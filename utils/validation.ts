import {
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  detectCardType,
} from './cardUtils';
import { FormErrors, PaymentFormData } from '@/types/payment';

/**
 * Validate cardholder name
 */
export const validateCardholderName = (name: string): string | undefined => {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Cardholder name is required';
  }

  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (trimmed.length > 50) {
    return 'Name must not exceed 50 characters';
  }

  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }

  return undefined;
};

/**
 * Validate card number
 */
export const validateCardNumber = (cardNumber: string): string | undefined => {
  const trimmed = cardNumber.trim();

  if (!trimmed) {
    return 'Card number is required';
  }

  const sanitized = trimmed.replace(/\s/g, '');

  if (!/^\d+$/.test(sanitized)) {
    return 'Card number must contain only digits';
  }

  if (!isValidCardNumber(trimmed)) {
    return 'Invalid card number';
  }

  return undefined;
};

/**
 * Validate expiry date
 */
export const validateExpiry = (expiry: string): string | undefined => {
  const trimmed = expiry.trim();

  if (!trimmed) {
    return 'Expiry date is required';
  }

  if (!/^\d{2}\/\d{2}$/.test(trimmed)) {
    return 'Expiry date must be in MM/YY format';
  }

  if (!isValidExpiry(trimmed)) {
    return 'Card is expired or invalid expiry date';
  }

  return undefined;
};

/**
 * Validate CVV
 */
export const validateCVV = (
  cvv: string,
  cardNumber: string
): string | undefined => {
  const trimmed = cvv.trim();

  if (!trimmed) {
    return 'CVV is required';
  }

  const cardType = detectCardType(cardNumber);

  if (!isValidCVV(trimmed, cardType)) {
    const expectedLength = cardType === 'amex' ? '4' : '3';
    return `CVV must be ${expectedLength} digits`;
  }

  return undefined;
};

/**
 * Validate amount
 */
export const validateAmount = (amount: number): string | undefined => {
  if (amount === undefined || amount === null) {
    return 'Amount is required';
  }

  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Amount must be a valid number';
  }

  if (amount <= 0) {
    return 'Amount must be greater than 0';
  }

  if (amount > 999999) {
    return 'Amount must not exceed 999999';
  }

  // Check for reasonable decimal places (max 2)
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return 'Amount must have at most 2 decimal places';
  }

  return undefined;
};

/**
 * Validate entire form
 */
export const validatePaymentForm = (
  formData: PaymentFormData
): FormErrors => {
  const errors: FormErrors = {};

  const cardholderError = validateCardholderName(formData.cardholderName);
  if (cardholderError) {
    errors.cardholderName = cardholderError;
  }

  const cardNumberError = validateCardNumber(formData.cardNumber);
  if (cardNumberError) {
    errors.cardNumber = cardNumberError;
  }

  const expiryError = validateExpiry(formData.expiry);
  if (expiryError) {
    errors.expiry = expiryError;
  }

  const cvvError = validateCVV(formData.cvv, formData.cardNumber);
  if (cvvError) {
    errors.cvv = cvvError;
  }

  const amountError = validateAmount(formData.amount);
  if (amountError) {
    errors.amount = amountError;
  }

  return errors;
};

/**
 * Check if form is completely valid
 */
export const isFormValid = (formData: PaymentFormData): boolean => {
  const errors = validatePaymentForm(formData);
  return Object.keys(errors).length === 0;
};
