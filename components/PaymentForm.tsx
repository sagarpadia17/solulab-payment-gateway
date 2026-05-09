'use client';

import React, { useState, useCallback } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import {
  formatCardNumber,
  formatExpiry,
  formatCVV,
  detectCardType,
} from '@/utils/cardUtils';
import {
  validateCardholderName,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  validateAmount,
} from '@/utils/validation';
import { PaymentFormData, CardType, FormErrors } from '@/types/payment';

interface PaymentFormProps {
  onSubmitStart?: () => void;
  onSubmitEnd?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmitStart,
  onSubmitEnd,
}) => {
  const {
    formData,
    formErrors,
    touchedFields,
    status,
    retryCount,
    setFormField,
    setFormErrors,
    touchField,
    initiatePayment,
  } = usePaymentStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardType = detectCardType(formData.cardNumber);

  // Handle field change with formatting
  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let formattedValue: string | number = value;

      // Apply field-specific formatting
      if (name === 'cardNumber') {
        formattedValue = formatCardNumber(value);
      } else if (name === 'expiry') {
        formattedValue = formatExpiry(value);
      } else if (name === 'cvv') {
        formattedValue = formatCVV(value, cardType);
      } else if (name === 'amount') {
        formattedValue = parseFloat(value) || 0;
      }

      setFormField(name as keyof PaymentFormData, formattedValue);

      // Real-time validation for touched fields
      if (touchedFields.has(name as keyof PaymentFormData)) {
        validateField(name as keyof PaymentFormData, formattedValue);
      }
    },
    [touchedFields, cardType, setFormField]
  );

  // Validate individual field
  const validateField = useCallback(
    (field: keyof PaymentFormData, value: string | number) => {
      let error: string | undefined;

      switch (field) {
        case 'cardholderName':
          error = validateCardholderName(String(value));
          break;
        case 'cardNumber':
          error = validateCardNumber(String(value));
          break;
        case 'expiry':
          error = validateExpiry(String(value));
          break;
        case 'cvv':
          error = validateCVV(String(value), formData.cardNumber);
          break;
        case 'amount':
          error = validateAmount(Number(value));
          break;
      }

      // Update errors, removing or adding the field error
      setFormErrors({
        ...formErrors,
        ...(error ? { [field]: error } : { [field]: undefined }),
      });
    },
    [formData.cardNumber, formErrors, setFormErrors]
  );

  // Handle blur to trigger validation
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const field = name as keyof PaymentFormData;

      touchField(field);
      validateField(field, formData[field]);
    },
    [formData, touchField, validateField]
  );

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      validateCardholderName(formData.cardholderName) === undefined &&
      validateCardNumber(formData.cardNumber) === undefined &&
      validateExpiry(formData.expiry) === undefined &&
      validateCVV(formData.cvv, formData.cardNumber) === undefined &&
      validateAmount(formData.amount) === undefined
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      // Mark all fields as touched to show errors
      ['cardholderName', 'cardNumber', 'expiry', 'cvv', 'amount'].forEach(
        (field) => {
          touchField(field as keyof PaymentFormData);
        }
      );
      return;
    }

    setIsSubmitting(true);
    onSubmitStart?.();

    try {
      await initiatePayment(formData);
    } finally {
      setIsSubmitting(false);
      onSubmitEnd?.();
    }
  };

  const isProcessing = status === 'processing' || isSubmitting;
  const maxRetries = 3;
  const canRetry =
    (status === 'failed' || status === 'timeout') && retryCount < maxRetries;

  // Get error message for a field if it's touched
  const getFieldError = (field: keyof PaymentFormData): string | undefined => {
    if (field === 'currency') return undefined; // Currency doesn't have validation errors
    if (!touchedFields.has(field)) return undefined;

    const validationFields: (keyof FormErrors)[] = [
      'cardholderName',
      'cardNumber',
      'expiry',
      'cvv',
      'amount',
    ];

    if (validationFields.includes(field as keyof FormErrors)) {
      return formErrors[field as keyof FormErrors];
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardholderName"
          name="cardholderName"
          placeholder="John Doe"
          value={formData.cardholderName}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isProcessing}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none dark:bg-gray-700 dark:text-white ${
            getFieldError('cardholderName')
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
          }`}
          autoComplete="cc-name"
        />
        {getFieldError('cardholderName') && (
          <p className="mt-1 text-sm text-red-500 font-medium">
            {getFieldError('cardholderName')}
          </p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            disabled={isProcessing}
            maxLength={19}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none dark:bg-gray-700 dark:text-white ${
              getFieldError('cardNumber')
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
            autoComplete="cc-number"
          />
          {formData.cardNumber && (
            <div className="absolute right-4 top-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
              {cardType === 'visa' && '💳 VISA'}
              {cardType === 'mastercard' && '💳 MC'}
              {cardType === 'amex' && '💳 AMEX'}
              {cardType === 'unknown' && ''}
            </div>
          )}
        </div>
        {getFieldError('cardNumber') && (
          <p className="mt-1 text-sm text-red-500 font-medium">
            {getFieldError('cardNumber')}
          </p>
        )}
      </div>

      {/* Expiry and CVV Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expiry */}
        <div>
          <label htmlFor="expiry" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            placeholder="MM/YY"
            value={formData.expiry}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            disabled={isProcessing}
            maxLength={5}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none dark:bg-gray-700 dark:text-white ${
              getFieldError('expiry')
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
            autoComplete="cc-exp"
          />
          {getFieldError('expiry') && (
            <p className="mt-1 text-sm text-red-500 font-medium">
              {getFieldError('expiry')}
            </p>
          )}
        </div>

        {/* CVV */}
        <div>
          <label htmlFor="cvv" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            placeholder={cardType === 'amex' ? '0000' : '000'}
            value={formData.cvv}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            disabled={isProcessing}
            maxLength={cardType === 'amex' ? 4 : 3}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none dark:bg-gray-700 dark:text-white ${
              getFieldError('cvv')
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
            autoComplete="cc-csc"
          />
          {getFieldError('cvv') && (
            <p className="mt-1 text-sm text-red-500 font-medium">
              {getFieldError('cvv')}
            </p>
          )}
        </div>
      </div>

      {/* Amount Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Amount */}
        <div className="col-span-2">
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            placeholder="0.00"
            value={formData.amount || ''}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            disabled={isProcessing}
            step="0.01"
            min="0"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none dark:bg-gray-700 dark:text-white ${
              getFieldError('amount')
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
          />
          {getFieldError('amount') && (
            <p className="mt-1 text-sm text-red-500 font-medium">
              {getFieldError('amount')}
            </p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleFieldChange}
            disabled={isProcessing}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors focus:outline-none"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid() || isProcessing || (status !== 'idle' && !canRetry)}
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : canRetry ? (
          <span>
            Retry Payment (Attempt {retryCount + 1} of {maxRetries})
          </span>
        ) : status === 'success' ? (
          'Payment Successful ✓'
        ) : status === 'failed' || status === 'timeout' ? (
          'Payment Failed ✗'
        ) : (
          'Pay Now'
        )}
      </button>

      {/* Retry Count Display */}
      {retryCount > 0 && retryCount < maxRetries && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Attempt {retryCount} of {maxRetries}
        </p>
      )}
    </form>
  );
};
