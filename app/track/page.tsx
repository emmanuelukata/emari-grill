'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderRecord, OrderStatus } from '@/types';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { BankDetailsCard } from '@/components/BankDetailsCard';
import { PaymentProofUploader } from '@/components/PaymentProofUploader';
import { useAnnouncer } from '@/components/Announcer';
import { formatNaira, getWhatsAppLink, isValidNigerianPhone } from '@/lib/utils/format';
import { DEFAULT_SETTINGS } from '@/lib/data/mock-data';
import {
  Search,
  RefreshCw,
  Clock,
  MapPin,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderCode, setOrderCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { announce } = useAnnouncer();

  const handleLookup = useCallback(async (codeToLookup: string, phoneToLookup: string, isSilent = false) => {
    if (!codeToLookup.trim()) {
      setErrorMessage('Please enter your order code (e.g. IG-4821).');
      return;
    }

    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const url = `/api/orders/${codeToLookup.trim()}${
        phoneToLookup ? `?phone=${encodeURIComponent(phoneToLookup.trim())}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.order) {
        setOrder(data.order);
        announce(`Order ${data.order.order_code} found. Current status: ${data.order.status}`);
      } else {
        // Fallback: Check local session storage if created in same session
        try {
          const cached = sessionStorage.getItem(`order_${codeToLookup.trim()}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            setOrder(parsed);
            announce(`Order ${parsed.orderCode} found.`);
            return;
          }
        } catch {}

        setErrorMessage(data.error || 'Order not found. Please verify the code and phone number.');
        announce('Order not found. Please check your details.', 'assertive');
        setOrder(null);
      }
    } catch {
      // Check fallback
      try {
        const cached = sessionStorage.getItem(`order_${codeToLookup.trim()}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setOrder(parsed);
          announce(`Order ${parsed.orderCode} found.`);
          return;
        }
      } catch {}

      setErrorMessage('Could not connect. Please check your network connection.');
      announce('Could not connect. Please check your network connection.', 'assertive');
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [announce]);

  // If query parameters are present on load, trigger lookup immediately
  useEffect(() => {
    if (initialCode) {
      handleLookup(initialCode, initialPhone);
    }
  }, [initialCode, initialPhone, handleLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/track?code=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(phone)}`);
    handleLookup(orderCode, phone);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (order) {
      setOrder({
        ...order,
        status: newStatus as OrderStatus,
      });
    }
    handleLookup(orderCode, phone, true);
  };

  const isInterstate = order?.is_interstate;
  const isPendingFee = order?.status === 'Pending Fee Confirmation';
  const isPendingPayment = order?.status === 'Pending Payment';
  const isAwaitingConfirmation = order?.status === 'Awaiting Confirmation';

  const whatsappMessage = order
    ? `Hello Emari Grill, I am tracking my order *${order.order_code}*.\nName: ${order.customer_name}\nStatus: ${order.status}`
    : `Hello Emari Grill, I have an enquiry about my order.`;
  const whatsappUrl = getWhatsAppLink(DEFAULT_SETTINGS.whatsapp_number, whatsappMessage);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-charcoal-800 hover:text-brand-fire-700 rounded-md p-1 min-touch-target"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Menu</span>
        </Link>
      </div>

      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="mt-1 text-sm text-brand-charcoal-700">
          Enter your order code and phone number to see live kitchen and delivery status.
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={handleSubmit}
        aria-label="Track order form"
        className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 max-w-xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="orderCodeInput"
              className="block text-sm font-bold text-brand-charcoal-900 mb-1"
            >
              Order Code <span className="text-brand-fire-700" aria-hidden="true">*</span>
            </label>
            <input
              id="orderCodeInput"
              type="text"
              required
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
              placeholder="e.g. IG-4821"
              className="w-full px-4 py-3 uppercase rounded-xl border border-brand-offwhite-border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 font-mono font-bold bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="phoneInput"
              className="block text-sm font-bold text-brand-charcoal-900 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phoneInput"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="080... or +234..."
              className="w-full px-4 py-3 rounded-xl border border-brand-offwhite-border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 bg-white"
            />
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-brand-fire-700 hover:bg-brand-fire-800 disabled:opacity-50 text-white font-extrabold text-base rounded-xl shadow-md min-touch-target transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>Checking order...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" aria-hidden="true" />
              <span>Track Order</span>
            </>
          )}
        </button>
      </form>

      {/* Result Display */}
      {order && (
        <div className="space-y-6 pt-4 animate-fade-in">
          {/* Header Card */}
          <div className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-offwhite-subtle pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-fire-700">
                  Live Order Tracker
                </span>
                <h2 className="text-2xl font-black text-brand-charcoal-900 tracking-tight">
                  Order #{order.order_code}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handleLookup(order.order_code, phone, true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-charcoal-800 bg-brand-offwhite hover:bg-brand-offwhite-subtle border border-brand-offwhite-border rounded-lg min-touch-target self-start sm:self-auto"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-fire-700' : ''}`}
                  aria-hidden="true"
                />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
              </button>
            </div>

            {/* Estimated delivery time notification if set */}
            {order.estimated_delivery_time && (
              <div
                role="status"
                className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-brand-charcoal-900 text-sm flex items-center gap-2.5 font-medium"
              >
                <Clock className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
                <span>
                  Estimated delivery time: <strong>{order.estimated_delivery_time}</strong>
                </span>
              </div>
            )}

            {/* Status Stepper */}
            <OrderStatusStepper status={order.status} isInterstate={isInterstate} />
          </div>

          {/* Interstate Pending Notice */}
          {isPendingFee && (
            <div
              role="status"
              className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-brand-charcoal-900 space-y-3"
            >
              <h3 className="text-base font-bold text-amber-950">
                Delivery Fee Confirmation in Progress
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Delivery to your location will be confirmed by Emari Grill before payment.
                Our team is reviewing the transit route. Once confirmed, payment details will unlock here.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm min-touch-target"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Chat on WhatsApp with Us</span>
              </a>
            </div>
          )}

          {/* Pending Payment Action */}
          {!isPendingFee && (isPendingPayment || isAwaitingConfirmation) && (
            <div className="space-y-6">
              <BankDetailsCard
                bankName={DEFAULT_SETTINGS.bank_name}
                accountName={DEFAULT_SETTINGS.account_name}
                accountNumber={DEFAULT_SETTINGS.account_number}
                amountToPay={formatNaira(order.total_amount)}
              />

              <PaymentProofUploader
                orderCode={order.order_code}
                alreadyUploaded={!!order.payment_proof_path || isAwaitingConfirmation}
                onUploadSuccess={handleStatusUpdate}
              />
            </div>
          )}

          {/* Order Details Accordion / Summary */}
          <div className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-brand-charcoal-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-fire-700" aria-hidden="true" />
              <span>Order Summary</span>
            </h3>

            {order.items && order.items.length > 0 && (
              <ul className="divide-y divide-brand-offwhite-subtle">
                {order.items.map((item, idx) => (
                  <li key={item.id || idx} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-brand-charcoal-900">
                        {item.quantity}× {item.product_name}
                      </span>
                      {item.sauce_name && (
                        <span className="block text-xs text-brand-charcoal-700">
                          {item.sauce_name}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-brand-charcoal-900">
                      {formatNaira(item.total_price || item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-brand-offwhite-border pt-3 flex items-baseline justify-between text-base font-bold text-brand-charcoal-900">
              <span>Total Amount</span>
              <span className="text-xl font-black">{formatNaira(order.total_amount)}</span>
            </div>

            <div className="border-t border-brand-offwhite-subtle pt-3 text-xs sm:text-sm text-brand-charcoal-800 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-fire-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-brand-charcoal-900">
                  {order.customer_name} ({order.customer_phone})
                </p>
                <p className="text-brand-charcoal-700">
                  {order.customer_address}
                  {order.area ? `, ${order.area}` : ''}, {order.state}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-brand-charcoal-700">Loading order tracker...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

