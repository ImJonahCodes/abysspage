'use client';

import React from 'react';

interface CreditCardProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
}

export function CreditCard({ cardNumber, cardholderName, expiryDate }: CreditCardProps) {
  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="w-[420px] h-[250px] bg-gradient-to-br from-red-950 via-red-900 to-red-800 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1)_0%,_transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(220,38,38,0.2)_0%,_transparent_100%)]" />
      </div>

      {/* Holographic Effect */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />

      {/* Card Logo */}
      <div className="absolute top-4 left-6 w-20 h-20 z-10">
        <img
          src="https://i.imgur.com/zwkdq9p.png"
          alt="Card Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Name */}
      <div className="absolute top-8 right-8 z-10">
        <p className="text-2xl font-bold tracking-widest text-red-600">LOST ABYSS</p>
      </div>

      {/* Card Number */}
      <div className="absolute top-32 left-8 right-8 z-10">
        <p className="font-mono text-2xl tracking-wider text-gray-100/90">
          {formatCardNumber(cardNumber)}
        </p>
      </div>

      {/* Cardholder Name and Expiry */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-baseline z-10">
        <div>
          <p className="text-xs text-red-200/70 mb-1">Card Holder</p>
          <p className="font-medium tracking-wide text-gray-100">{cardholderName.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-200/70 mb-1">Expires</p>
          <p className="font-medium text-gray-100">{expiryDate}</p>
        </div>
      </div>

      {/* Security Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,_rgba(255,255,255,0.03)_0%,_rgba(255,255,255,0.03)_2px,_transparent_2px,_transparent_4px)]" />
      </div>
    </div>
  );
}