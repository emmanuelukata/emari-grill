import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { MessageCircle, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-brand-offwhite/95 backdrop-blur-md border-b border-brand-offwhite-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-brand-fire-100 text-brand-fire-800 rounded-full border border-brand-fire-200">
            Uyo, Akwa Ibom
          </span>
        </div>

        {/* Navigation & Actions */}
        <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-brand-charcoal-800 hover:text-brand-fire-700 rounded-lg hover:bg-brand-offwhite-subtle transition-colors min-touch-target justify-center"
          >
            <Search className="w-4 h-4 text-brand-fire-700" aria-hidden="true" />
            <span>Track Order</span>
          </Link>

          <a
            href="https://wa.me/2348000000000?text=Hello%20Emari%20Grill%2C%20I%20have%20an%20enquiry"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp (opens in WhatsApp)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-lg shadow-sm transition-colors min-touch-target justify-center"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
