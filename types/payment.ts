export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type PaymentStatus =
  | 'idle'
  | 'processing'
  | 'success'
  | 'failed'
  | 'timeout';

export type Currency = 'INR' | 'USD';

export interface PaymentFormData {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export interface PaymentPayload {
  transactionId: string;
  cardHolderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  failureReason?: string;
}

export interface Transaction {
  transactionId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  timestamp: string;
  attempts: number;
  failureReason?: string;
  cardholderName: string;
  lastFourDigits: string;
}

export interface ValidationError {
  field: keyof PaymentFormData;
  message: string;
}

export interface FormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  amount?: string;
}
