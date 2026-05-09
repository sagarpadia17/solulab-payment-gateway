import { CardType } from '@/types/payment';

/**
 * Detect card type based on card number
 */
export const detectCardType = (cardNumber: string): CardType => {
  const sanitized = cardNumber.replace(/\s/g, '');

  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(sanitized)) {
    return 'visa';
  }
  if (/^5[1-5][0-9]{14}$/.test(sanitized)) {
    return 'mastercard';
  }
  if (/^3[47][0-9]{13}$/.test(sanitized)) {
    return 'amex';
  }

  return 'unknown';
};

/**
 * Format card number with spaces every 4 digits
 */
export const formatCardNumber = (value: string): string => {
  const cardNumber = value.replace(/\s/g, '').slice(0, 19);
  const parts: string[] = [];

  for (let i = 0; i < cardNumber.length; i += 4) {
    parts.push(cardNumber.slice(i, i + 4));
  }

  return parts.join(' ');
};

/**
 * Format expiry date as MM/YY
 */
export const formatExpiry = (value: string): string => {
  const sanitized = value.replace(/\D/g, '').slice(0, 4);

  if (sanitized.length === 0) return '';
  if (sanitized.length <= 2) return sanitized;

  const month = sanitized.slice(0, 2);
  const year = sanitized.slice(2, 4);
  return `${month}/${year}`;
};

/**
 * Format CVV (numeric only, max length depends on card type)
 */
export const formatCVV = (value: string, cardType: CardType): string => {
  const maxLength = cardType === 'amex' ? 4 : 3;
  return value.replace(/\D/g, '').slice(0, maxLength);
};

/**
 * Luhn algorithm validation
 */
export const isValidCardNumber = (cardNumber: string): boolean => {
  const sanitized = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(sanitized)) return false;

  const cardType = detectCardType(sanitized);
  const expectedLength = cardType === 'amex' ? 15 : 16;

  if (sanitized.length !== expectedLength) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate expiry date (must be future date)
 */
export const isValidExpiry = (expiry: string): boolean => {
  const sanitized = expiry.replace(/\D/g, '');

  if (sanitized.length !== 4) return false;

  const month = parseInt(sanitized.slice(0, 2), 10);
  const year = parseInt(sanitized.slice(2, 4), 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  // Card expired
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  // Ensure reasonable future date (max 50 years)
  if (year > currentYear + 50) return false;

  return true;
};

/**
 * Validate CVV based on card type
 */
export const isValidCVV = (cvv: string, cardType: CardType): boolean => {
  const sanitized = cvv.replace(/\D/g, '');

  if (cardType === 'amex') {
    return sanitized.length === 4;
  }

  return sanitized.length === 3;
};

/**
 * Mask card number for display (show only last 4 digits)
 */
export const maskCardNumber = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\s/g, '');
  const lastFour = sanitized.slice(-4);
  const masked = '*'.repeat(Math.max(0, sanitized.length - 4)) + lastFour;

  // Format masked number with spaces every 4 digits
  const parts: string[] = [];
  for (let i = 0; i < masked.length; i += 4) {
    parts.push(masked.slice(i, i + 4));
  }

  return parts.join(' ');
};

/**
 * Get last four digits of card
 */
export const getLastFourDigits = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\s/g, '');
  return sanitized.slice(-4);
};
