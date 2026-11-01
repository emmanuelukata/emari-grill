'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { formatNaira } from '@/lib/utils/format';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function StickyBottomBar() {
  const { totalCount, subtotal, isLoaded } = useCart();

  if (!isLoaded || totalCount === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Order summary bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-brand-charcoal-900 text-white shadow-2xl border-t border-brand-charcoal-800 safe-pb animate-slide-up"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Item count & Subtotal */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-brand-charcoal-800 border border-brand-charcoal-700 flex items-center justify-center text-brand-fire-500">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </div>
            <span
              className="absolute -top-1.5 -right-1.5 bg-brand-fire-600 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-brand-charcoal-900"
              aria-label={`${totalCount} items in order`}
            >
              {totalCount}
            </span>
          </div>

          <div>
            <div className="text-xs text-brand-charcoal-200 uppercase tracking-wider font-semibold">
              {totalCount} {totalCount === 1 ? 'chicken' : 'chickens'}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white">
              {formatNaira(subtotal)}
            </div>
          </div>
        </div>

        {/* Order Now CTA */}
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-fire-700 hover:bg-brand-fire-800 text-white font-bold rounded-xl text-base shadow-lg transition-transform active:scale-[0.98] min-touch-target"
        >
          <span>Order Now</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
