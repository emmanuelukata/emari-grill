import React from 'react';
import { OrderStatus } from '@/types';
import {
  Clock,
  CreditCard,
  Search,
  CheckCircle,
  Flame,
  Truck,
  PackageCheck,
  XCircle,
} from 'lucide-react';

interface OrderStatusStepperProps {
  status: OrderStatus;
  isInterstate?: boolean;
}

export function OrderStatusStepper({ status, isInterstate = false }: OrderStatusStepperProps) {
  if (status === 'Cancelled') {
    return (
      <div
        role="status"
        aria-label="Order Status: Cancelled"
        className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3"
      >
        <XCircle className="w-6 h-6 text-red-600 shrink-0" aria-hidden="true" />
        <div>
          <span className="font-bold text-base block">Order Cancelled</span>
          <span className="text-xs text-red-700">
            This order was cancelled or payment was rejected. Please contact us on WhatsApp for assistance.
          </span>
        </div>
      </div>
    );
  }

  // Normal progression steps
  const steps: { key: OrderStatus; label: string; icon: React.ElementType }[] = isInterstate
    ? [
        { key: 'Pending Fee Confirmation', label: 'Fee Review', icon: Clock },
        { key: 'Pending Payment', label: 'Payment', icon: CreditCard },
        { key: 'Awaiting Confirmation', label: 'Verifying', icon: Search },
        { key: 'Preparing', label: 'Grilling', icon: Flame },
        { key: 'Out for Delivery', label: 'Dispatched', icon: Truck },
        { key: 'Delivered', label: 'Delivered', icon: PackageCheck },
      ]
    : [
        { key: 'Pending Payment', label: 'Payment', icon: CreditCard },
        { key: 'Awaiting Confirmation', label: 'Verifying', icon: Search },
        { key: 'Preparing', label: 'Grilling', icon: Flame },
        { key: 'Out for Delivery', label: 'On the Way', icon: Truck },
        { key: 'Delivered', label: 'Delivered', icon: PackageCheck },
      ];

  // Helper to determine step index
  const getStepIndex = (s: OrderStatus) => {
    if (s === 'Payment Confirmed') {
      // Payment confirmed maps to right before or at Preparing
      return steps.findIndex((step) => step.key === 'Preparing') - 0.5;
    }
    const idx = steps.findIndex((step) => step.key === s);
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = getStepIndex(status);

  return (
    <div
      role="region"
      aria-label={`Order progress: currently ${status}`}
      className="bg-brand-offwhite-subtle border border-brand-offwhite-border rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentIdx > index;
          const isCurrent = currentIdx === index || (status === 'Payment Confirmed' && step.key === 'Preparing');

          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center text-center min-w-[70px] relative"
            >
              {/* Connector line between steps */}
              {index > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 right-1/2 h-0.5 -z-0 ${
                    index <= currentIdx ? 'bg-brand-fire-700' : 'bg-brand-offwhite-border'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Icon Circle */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-700 text-white'
                    : isCurrent
                    ? 'bg-brand-fire-700 text-white ring-4 ring-brand-fire-100'
                    : 'bg-white text-brand-charcoal-200 border-2 border-brand-offwhite-border'
                }`}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs font-bold leading-tight ${
                  isCurrent
                    ? 'text-brand-fire-800 underline underline-offset-2'
                    : isCompleted
                    ? 'text-emerald-800'
                    : 'text-brand-charcoal-200'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Status Announcement */}
      <div className="mt-4 pt-3 border-t border-brand-offwhite-border flex items-center justify-between text-xs sm:text-sm">
        <span className="text-brand-charcoal-700">Current Status:</span>
        <span className="font-extrabold text-brand-charcoal-900 bg-white px-3 py-1 rounded-full border border-brand-offwhite-border shadow-2xs">
          {status}
        </span>
      </div>
    </div>
  );
}
