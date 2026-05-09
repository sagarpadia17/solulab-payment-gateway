'use client';

import { usePaymentStore } from '@/store/paymentStore';
import { Transaction, PaymentStatus } from '@/types/payment';

export const TransactionHistory: React.FC = () => {
  const { transactions, clearTransactionHistory } = usePaymentStore();

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 p-8 text-center bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No transactions yet. Make your first payment to see history.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const statusStyles: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
      idle: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Idle' },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'Processing' },
      success: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Success' },
      failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Failed' },
      timeout: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Timeout' },
    };

    const style = statusStyles[status];
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getStatusIcon = (status: PaymentStatus): string => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      case 'timeout':
        return '⏱';
      case 'processing':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Transaction History
        </h3>
        {transactions.length > 0 && (
          <button
            onClick={clearTransactionHistory}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-semibold transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Attempts
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr
                key={`${tx.transactionId}-${tx.attempts}`}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  index % 2 === 1 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <td className="px-6 py-4">
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {tx.transactionId.slice(0, 8)}...
                  </code>
                </td>
                <td className="px-6 py-4 font-semibold">
                  {tx.amount} {tx.currency}
                </td>
                <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {tx.attempts}/3
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => (
          <div
            key={`${tx.transactionId}-${tx.attempts}`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon(tx.status)}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {tx.amount} {tx.currency}
                  </p>
                  <code className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {tx.transactionId.slice(0, 12)}...
                  </code>
                </div>
              </div>
              {getStatusBadge(tx.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">Cardholder</p>
                <p>{tx.cardholderName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">Attempts</p>
                <p>{tx.attempts}/3</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">Time</p>
                <p>{new Date(tx.timestamp).toLocaleString()}</p>
              </div>
              {tx.failureReason && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">Reason</p>
                  <p className="text-red-600 dark:text-red-400">{tx.failureReason}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
