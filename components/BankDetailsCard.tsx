'use client';

import React, { useState } from 'react';
import { useAnnouncer } from './Announcer';
import { Copy, Check, Building2, User, CreditCard } from 'lucide-react';

interface BankDetailsCardProps {
  bankName: string;
  accountName: string;
  accountNumber: string;
  amountToPay: string;
}

export function BankDetailsCard({
  bankName,
  accountName,
  accountNumber,
  amountToPay,
}: BankDetailsCardProps) {
  const [copied, setCopied] = useState(false);
  const { announce } = useAnnouncer();

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        // Fallback for older in-app browsers
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      announce(`Account number ${accountNumber} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      announce(`Account number is ${accountNumber}. Please copy manually.`);
    }
  };

  return (
    <div
      role="region"
      aria-label="Payment Bank Account Details"
      className="bg-brand-charcoal-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-brand-charcoal-800 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-brand-charcoal-800 pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-brand-gold-400 font-bold block">
            Exact Amount to Pay
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {amountToPay}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-brand-fire-900/60 text-brand-fire-300 border border-brand-fire-700/50 rounded-lg">
          Manual Bank Transfer
        </span>
      </div>

      {/* Account Details Box */}
      <div className="space-y-3 bg-brand-charcoal-800/80 rounded-xl p-4 border border-brand-charcoal-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal-200 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-fire-500" aria-hidden="true" />
            Bank Name:
          </span>
          <span className="font-bold text-white">{bankName}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal-200 flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-fire-500" aria-hidden="true" />
            Account Name:
          </span>
          <span className="font-bold text-white">{accountName}</span>
        </div>

        <div className="flex items-center justify-between text-sm pt-1 border-t border-brand-charcoal-700">
          <span className="text-brand-charcoal-200 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-brand-fire-500" aria-hidden="true" />
            Account Number:
          </span>
          <span className="font-mono font-black text-lg text-brand-gold-400 tracking-wider">
            {accountNumber}
          </span>
        </div>
      </div>

      {/* Large Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy account number ${accountNumber}`}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all min-touch-target shadow-md active:scale-[0.99] ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-brand-fire-700 hover:bg-brand-fire-800 text-white'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" aria-hidden="true" />
            <span>Copied {accountNumber}!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" aria-hidden="true" />
            <span>Copy Account Number</span>
          </>
        )}
      </button>

      <p className="text-xs text-brand-charcoal-200 text-center leading-relaxed">
        Make your transfer from your bank app, then upload your screenshot below so we can verify and fire up the grill!
      </p>
    </div>
  );
}

