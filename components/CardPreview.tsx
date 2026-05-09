'use client';

import { CardType } from '@/types/payment';
import { maskCardNumber, detectCardType } from '@/utils/cardUtils';

interface CardPreviewProps {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cardType?: CardType;
}

const getCardBrandColor = (cardType: CardType): string => {
  switch (cardType) {
    case 'visa':
      return 'from-blue-600 to-blue-800';
    case 'mastercard':
      return 'from-red-600 to-orange-600';
    case 'amex':
      return 'from-green-600 to-teal-800';
    default:
      return 'from-gray-700 to-gray-900';
  }
};

const getCardBrandText = (cardType: CardType): string => {
  switch (cardType) {
    case 'visa':
      return 'VISA';
    case 'mastercard':
      return 'MASTERCARD';
    case 'amex':
      return 'AMERICAN EXPRESS';
    default:
      return 'CARD';
  }
};

export const CardPreview: React.FC<CardPreviewProps> = ({
  cardholderName,
  cardNumber,
  expiry,
  cardType: providedCardType,
}) => {
  const cardType = providedCardType || detectCardType(cardNumber);
  const maskedNumber = maskCardNumber(cardNumber);
  const brandColor = getCardBrandColor(cardType);
  const brandText = getCardBrandText(cardType);

  const displayName = cardholderName.trim() || 'CARDHOLDER NAME';
  const displayNumber = cardNumber ? maskedNumber : '**** **** **** ****';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <div className="perspective h-64 w-full max-w-sm">
      <div
        className={`relative h-full w-full rounded-2xl bg-linear-to-br ${brandColor} p-8 text-white shadow-2xl transition-transform duration-300 hover:scale-105`}
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%)',
        }}
      >
        {/* Card Background Pattern */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white" />
        </div>

        {/* Card Content */}
        <div className="relative flex h-full flex-col justify-between">
          {/* Top Section */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest opacity-75">
                DEBIT CARD
              </p>
              <p className="text-lg font-bold tracking-wider">{brandText}</p>
            </div>
            <div className="h-12 w-16 rounded-lg border-2 border-white bg-linear-to-br from-white to-gray-200 p-1">
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-transparent bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text">
                {cardType === 'mastercard' ? (
                  <svg
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="9" cy="12" r="7" fill="#EB001B" />
                    <circle cx="15" cy="12" r="7" fill="#F79E1B" />
                  </svg>
                ) : cardType === 'visa' ? (
                  <span className="text-2xl font-bold bg-linear-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                    V
                  </span>
                ) : cardType === 'amex' ? (
                  <span className="text-sm font-bold text-blue-600">AXP</span>
                ) : (
                  '💳'
                )}
              </div>
            </div>
          </div>

          {/* Middle Section - Card Number */}
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider opacity-75">
              CARD NUMBER
            </p>
            <p className="font-mono text-xl tracking-wider">{displayNumber}</p>
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider opacity-75">
                CARD HOLDER
              </p>
              <p className="font-semibold tracking-wider text-white uppercase">
                {displayName.length > 20
                  ? displayName.substring(0, 20)
                  : displayName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tracking-wider opacity-75">
                EXPIRES
              </p>
              <p className="font-mono text-lg tracking-wider">{displayExpiry}</p>
            </div>
          </div>
        </div>

        {/* Hologram Effect */}
        <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-linear-to-br from-white to-transparent opacity-30 blur-md" />
      </div>
    </div>
  );
};
