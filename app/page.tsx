'use client';

import { useEffect, useState } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import { CardPreview } from '@/components/CardPreview';
import { PaymentForm } from '@/components/PaymentForm';
import { PaymentStatusDisplay } from '@/components/PaymentStatusDisplay';
import { TransactionHistory } from '@/components/TransactionHistory';

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const { formData, status, resetForm, resetPayment } = usePaymentStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleRetry = () => {
    // Retry is handled by the form submit button
    // Reset payment state to allow retry
    resetPayment();
  };

  const handleReset = () => {
    resetForm();
    resetPayment();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Gateway
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Secure payment processing with real-time card validation
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Card Preview & Form */}
          <div className="space-y-8">
            {/* Card Preview */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Card Preview
              </h2>
              <div className="flex justify-center md:justify-start">
                <CardPreview
                  cardholderName={formData.cardholderName}
                  cardNumber={formData.cardNumber}
                  expiry={formData.expiry}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Payment Details
              </h2>
              <PaymentForm />
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {status !== 'idle' && (
          <div className="mb-12">
            <PaymentStatusDisplay onRetry={handleRetry} onReset={handleReset} />
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <TransactionHistory />
        </div>

        {/* Footer Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">✓</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Secure Processing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ~60% success rate with realistic failure scenarios
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Retry Logic
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Up to 3 retry attempts with timeout handling
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Card Support
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visa, Mastercard, American Express validation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
