import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  PaymentFormData,
  Transaction,
  PaymentStatus,
  FormErrors,
} from '@/types/payment';

interface PaymentStore {
  // Form state
  formData: PaymentFormData;
  formErrors: FormErrors;
  touchedFields: Set<keyof PaymentFormData>;

  // Payment lifecycle
  status: PaymentStatus;
  currentTransaction: Transaction | null;
  retryCount: number;
  transactionId: string | null;

  // Transaction history
  transactions: Transaction[];

  // Form actions
  setFormField: (field: keyof PaymentFormData, value: string | number) => void;
  setFormErrors: (errors: FormErrors) => void;
  touchField: (field: keyof PaymentFormData) => void;
  resetForm: () => void;

  // Payment actions
  initiatePayment: (
    formData: PaymentFormData
  ) => Promise<{ success: boolean; reason?: string }>;
  setPaymentStatus: (status: PaymentStatus) => void;
  resetPayment: () => void;

  // Transaction history actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  clearTransactionHistory: () => void;
  getTransactionById: (transactionId: string) => Transaction | undefined;
}

const initialFormData: PaymentFormData = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  amount: 0,
  currency: 'INR',
};

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        formData: initialFormData,
        formErrors: {},
        touchedFields: new Set(),
        status: 'idle',
        currentTransaction: null,
        retryCount: 0,
        transactionId: null,
        transactions: [],

        // Form actions
        setFormField: (field, value) => {
          set((state) => ({
            formData: {
              ...state.formData,
              [field]: value,
            },
          }));
        },

        setFormErrors: (errors) => {
          set({ formErrors: errors });
        },

        touchField: (field) => {
          set((state) => ({
            touchedFields: new Set([...state.touchedFields, field]),
          }));
        },

        resetForm: () => {
          set({
            formData: initialFormData,
            formErrors: {},
            touchedFields: new Set(),
            status: 'idle',
            currentTransaction: null,
            retryCount: 0,
            transactionId: null,
          });
        },

        // Payment actions
        initiatePayment: async (formData) => {
          const { transactionId, setPaymentStatus, addTransaction } = get();

          // Use existing transaction ID or generate new one
          const txId = transactionId || crypto.randomUUID();

          if (!transactionId) {
            set({ transactionId: txId });
          }

          set({ status: 'processing', retryCount: 0 });

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch('/api/pay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transactionId: txId,
                cardHolderName: formData.cardholderName,
                cardNumber: formData.cardNumber,
                expiry: formData.expiry,
                cvv: formData.cvv,
                amount: formData.amount,
                currency: formData.currency,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            const paymentResult = data.success ? 'success' : 'failed';
            const newStatus: PaymentStatus = paymentResult as 'success' | 'failed';

            const transaction: Transaction = {
              transactionId: txId,
              amount: formData.amount,
              currency: formData.currency,
              status: newStatus,
              timestamp: new Date().toISOString(),
              attempts: (get().retryCount || 0) + 1,
              failureReason: data.failureReason,
              cardholderName: formData.cardholderName,
              lastFourDigits: formData.cardNumber.replace(/\s/g, '').slice(-4),
            };

            set({
              status: newStatus,
              currentTransaction: transaction,
              retryCount: (get().retryCount || 0) + 1,
            });

            addTransaction(transaction);

            return {
              success: data.success,
              reason: data.failureReason,
            };
          } catch (error) {
            const isTimeout =
              error instanceof Error && error.name === 'AbortError';
            const newStatus: PaymentStatus = isTimeout ? 'timeout' : 'failed';

            const transaction: Transaction = {
              transactionId: txId,
              amount: formData.amount,
              currency: formData.currency,
              status: newStatus,
              timestamp: new Date().toISOString(),
              attempts: (get().retryCount || 0) + 1,
              failureReason: isTimeout
                ? 'Request timeout - payment processing failed'
                : 'Network error',
              cardholderName: formData.cardholderName,
              lastFourDigits: formData.cardNumber.replace(/\s/g, '').slice(-4),
            };

            set({
              status: newStatus,
              currentTransaction: transaction,
              retryCount: (get().retryCount || 0) + 1,
            });

            addTransaction(transaction);

            return {
              success: false,
              reason: transaction.failureReason,
            };
          }
        },

        setPaymentStatus: (status) => {
          set({ status });
        },

        resetPayment: () => {
          set({
            status: 'idle',
            currentTransaction: null,
            retryCount: 0,
            transactionId: null,
          });
        },

        // Transaction history actions
        addTransaction: (transaction) => {
          set((state) => {
            const existingIndex = state.transactions.findIndex(
              (t) =>
                t.transactionId === transaction.transactionId &&
                t.attempts === transaction.attempts
            );

            if (existingIndex > -1) {
              const updated = [...state.transactions];
              updated[existingIndex] = transaction;
              return { transactions: updated };
            }

            return {
              transactions: [transaction, ...state.transactions],
            };
          });
        },

        updateTransaction: (transactionId, updates) => {
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.transactionId === transactionId ? { ...t, ...updates } : t
            ),
          }));
        },

        clearTransactionHistory: () => {
          set({ transactions: [] });
        },

        getTransactionById: (transactionId) => {
          return get().transactions.find((t) => t.transactionId === transactionId);
        },
      }),
      {
        name: 'payment-store',
        partialize: (state) => ({
          transactions: state.transactions,
        }),
      }
    )
  )
);
