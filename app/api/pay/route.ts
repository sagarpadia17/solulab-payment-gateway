import { PaymentPayload, PaymentResponse } from '@/types/payment';
import { NextRequest, NextResponse } from 'next/server';

const failureReasons = [
  'Insufficient funds',
  'Bank declined',
  'Invalid CVV',
  'Network issue',
  'Card expired',
];

export async function POST(request: NextRequest): Promise<NextResponse<PaymentResponse>> {
  try {
    const payload: PaymentPayload = await request.json();

    // Validate required fields
    if (
      !payload.transactionId ||
      !payload.cardHolderName ||
      !payload.cardNumber ||
      !payload.expiry ||
      !payload.cvv ||
      !payload.amount ||
      !payload.currency
    ) {
      return NextResponse.json(
        {
          success: false,
          transactionId: payload.transactionId || 'unknown',
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Simulate payment processing with realistic behavior:
    // 60% success, 25% failure, 15% timeout (simulated by delay)
    const random = Math.random();

    // Check for timeout scenario (15% chance - delay 8 seconds)
    if (random < 0.15) {
      await new Promise((resolve) => setTimeout(resolve, 8000));
      return NextResponse.json(
        {
          success: false,
          transactionId: payload.transactionId,
          message: 'Payment processing timeout',
        },
        { status: 408 }
      );
    }

    // Check for failure (25% chance)
    if (random < 0.4) {
      const failureReason = failureReasons[
        Math.floor(Math.random() * failureReasons.length)
      ];

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return NextResponse.json(
        {
          success: false,
          transactionId: payload.transactionId,
          message: 'Payment failed',
          failureReason,
        },
        { status: 200 }
      );
    }

    // Success (60% chance)
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json(
      {
        success: true,
        transactionId: payload.transactionId,
        message: 'Payment processed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      {
        success: false,
        transactionId: 'unknown',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
