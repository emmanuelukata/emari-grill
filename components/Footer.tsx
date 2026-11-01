import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-charcoal-900 text-brand-charcoal-100 py-10 border-t border-brand-charcoal-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-brand-charcoal-800">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <Logo size="md" inverted />
            <p className="text-sm text-brand-charcoal-200 leading-relaxed">
              Flame-grilled chicken prepared with authentic spices. Delivering hot and fresh across Uyo, Akwa Ibom State, and interstate.
            </p>
          </div>

          {/* Quick Info */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-gold-400">
              Kitchen & Delivery
            </h2>
            <ul className="space-y-2 text-sm text-brand-charcoal-200">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-fire-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Uyo, Akwa Ibom State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-fire-500 shrink-0" aria-hidden="true" />
                <span>Daily: 11:00 AM – 10:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-fire-500 shrink-0" aria-hidden="true" />
                <a
                  href="tel:+2348000000000"
                  className="hover:text-white underline-offset-4 hover:underline"
                >
                  Direct Support
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Assurance */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-gold-400">
              Payment & Security
            </h2>
            <div className="flex items-start gap-2 text-sm text-brand-charcoal-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Direct bank transfer. You pay directly into our verified business account after placing your order.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-charcoal-200">
          <p>© {new Date().getFullYear()} Emari Grill. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/track"
              className="hover:text-white underline-offset-2 hover:underline"
            >
              Track Existing Order
            </Link>
            <span>•</span>
            <Link
              href="/admin/login"
              className="text-brand-charcoal-200 hover:text-brand-fire-500 transition-colors"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
