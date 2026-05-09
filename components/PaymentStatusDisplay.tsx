'use client';

import { usePaymentStore } from '@/store/paymentStore';
import { PaymentStatus } from '@/types/payment';

interface PaymentStatusDisplayProps {
  onRetry?: () => void;
  onReset?: () => void;
}

export const PaymentStatusDisplay: React.FC<PaymentStatusDisplayProps> = ({
  onRetry,
  onReset,
}) => {
  const { status, currentTransaction, retryCount } = usePaymentStore();

  if (status === 'idle') {
    return null;
  }

  const getStatusColor = (
    status: PaymentStatus
  ): { bg: string; border: string; text: string; icon: string } => {
    switch (status) {
      case 'processing':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-100',
          icon: '⏳',
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-100',
          icon: '✓',
        };
      case 'failed':
        return {
          bg: 'bg-red-50 dark:bg-red-900',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-100',
          icon: '✗',
        };
      case 'timeout':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-100',
          icon: '⏱',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-100',
          icon: '📋',
        };
    }
  };

  const colors = getStatusColor(status);

  const getStatusMessage = (): string => {
    switch (status) {
      case 'processing':
        return 'Processing your payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'timeout':
        return 'Payment Timeout';
      default:
        return 'Processing...';
    }
  };

  const maxRetries = 3;
  const canRetry = (status === 'failed' || status === 'timeout') && retryCount < maxRetries;
  const isMaxRetriesExceeded = (status === 'failed' || status === 'timeout') && retryCount >= maxRetries;

  return (
    <div
      className={`rounded-lg border-2 p-6 ${colors.bg} ${colors.border} ${colors.text}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{colors.icon}</div>
        <div>
          <h3 className="text-lg font-bold">{getStatusMessage()}</h3>
          {currentTransaction && (
            <p className="text-sm opacity-75">
              Transaction ID: {currentTransaction.transactionId}
            </p>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      {currentTransaction && (
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="opacity-75">Amount:</span>
            <span className="font-semibold">
              {currentTransaction.amount} {currentTransaction.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Card Holder:</span>
            <span className="font-semibold">{currentTransaction.cardholderName}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Card:</span>
            <span className="font-semibold">•••• •••• •••• {currentTransaction.lastFourDigits}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Attempt:</span>
            <span className="font-semibold">{retryCount} of {maxRetries}</span>
          </div>
          {currentTransaction.failureReason && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-30">
              <p className="text-xs opacity-75 mb-1">Reason:</p>
              <p className="font-semibold">{currentTransaction.failureReason}</p>
            </div>
          )}
          <div className="flex justify-between text-xs opacity-75">
            <span>Time:</span>
            <span>
              {new Date(currentTransaction.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {(canRetry || isMaxRetriesExceeded || status === 'success') && (
        <div className="flex gap-3 mt-6">
          {canRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
          {isMaxRetriesExceeded && (
            <div className="flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-center">
              Max Retries Exceeded
            </div>
          )}
          {(status === 'success' || isMaxRetriesExceeded) && (
            <button
              onClick={onReset}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              New Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
};
