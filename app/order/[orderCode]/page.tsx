'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { OrderRecord, OrderStatus } from '@/types';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { BankDetailsCard } from '@/components/BankDetailsCard';
import { PaymentProofUploader } from '@/components/PaymentProofUploader';
import { useAnnouncer } from '@/components/Announcer';
import { formatNaira, getWhatsAppLink } from '@/lib/utils/format';
import { DEFAULT_SETTINGS } from '@/lib/data/mock-data';
import {
  MessageCircle,
  Clock,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function OrderConfirmationPage({
  params,
}: {
  params: { orderCode: string };
}) {
  const { orderCode } = params;
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const { announce } = useAnnouncer();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const url = `/api/orders/${orderCode}${
        phoneParam ? `?phone=${encodeURIComponent(phoneParam)}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.order) {
        setOrder(data.order);
        setError(null);
      } else {
        // Fallback: check session storage if placed in this session
        try {
          const cached = sessionStorage.getItem(`order_${orderCode}`);
          if (cached) {
            setOrder(JSON.parse(cached));
            setError(null);
          } else {
            setError(data.error || 'Could not find order details.');
          }
        } catch {
          setError(data.error || 'Could not find order details.');
        }
      }
    } catch (err: unknown) {
      console.error(err);
      try {
        const cached = sessionStorage.getItem(`order_${orderCode}`);
        if (cached) {
          setOrder(JSON.parse(cached));
          setError(null);
        } else {
          setError('Failed to connect. Please check your internet connection.');
        }
      } catch {
        setError('Failed to connect. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderCode, phoneParam]);

  useEffect(() => {
    fetchOrderDetails();
    announce(`Order ${orderCode} loaded.`);
  }, [fetchOrderDetails, orderCode, announce]);

  const handleStatusUpdate = (newStatus: string) => {
    if (order) {
      setOrder({
        ...order,
        status: newStatus as OrderStatus,
      });
    }
    fetchOrderDetails(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-fire-700" aria-hidden="true" />
        <h1 className="text-xl font-bold text-brand-charcoal-900">Loading order {orderCode}...</h1>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-brand-charcoal-900">Order Not Found</h1>
        <p className="text-sm text-brand-charcoal-700">
          {error || `We could not locate order code ${orderCode}.`}
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/track"
            className="px-6 py-3 bg-brand-charcoal-900 text-white rounded-xl font-bold text-sm min-touch-target"
          >
            Track with Phone Number
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-brand-offwhite-border bg-white text-brand-charcoal-900 rounded-xl font-bold text-sm min-touch-target"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isInterstate = order.is_interstate;
  const isPendingFee = order.status === 'Pending Fee Confirmation';
  const isPendingPayment = order.status === 'Pending Payment';
  const isAwaitingConfirmation = order.status === 'Awaiting Confirmation';

  // Prefilled WhatsApp message
  const whatsappMessage = `Hello Emari Grill, my order code is *${order.order_code}*.\nName: ${order.customer_name}\nLocation: ${order.state}${order.area ? `, ${order.area}` : ''}\nAddress: ${order.customer_address}\nStatus: ${order.status}`;
  const whatsappUrl = getWhatsAppLink(DEFAULT_SETTINGS.whatsapp_number, whatsappMessage);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-8">
      {/* Top Header Card */}
      <div className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-offwhite-subtle pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-fire-700">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal-900 tracking-tight flex items-center gap-2">
              <span>Order #{order.order_code}</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => fetchOrderDetails(true)}
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

      {/* Action Zone: Dependent on Status */}
      {isPendingFee && (
        <section
          aria-labelledby="interstate-review-heading"
          className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-brand-charcoal-900 space-y-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 id="interstate-review-heading" className="text-lg font-bold text-amber-950">
                Delivery Fee Confirmation in Progress
              </h2>
              <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                Because your delivery address is in <strong>{order.state}</strong> (interstate), our team is currently confirming the current travel transit delivery fee.
              </p>
              <p className="mt-2 text-xs text-amber-800">
                Bank payment details and screenshot upload will appear here as soon as the fee is confirmed.
              </p>
            </div>
          </div>

          {/* Large WhatsApp CTA button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 bg-green-700 hover:bg-green-800 text-white font-extrabold text-base rounded-xl shadow-md min-touch-target flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>Chat on WhatsApp with Emari Grill</span>
          </a>
        </section>
      )}

      {/* Pending Payment or Awaiting Confirmation */}
      {!isPendingFee && (
        <section aria-label="Payment Section" className="space-y-6">
          {/* Show Bank Details if payment not confirmed yet */}
          {(isPendingPayment || isAwaitingConfirmation) && (
            <BankDetailsCard
              bankName={DEFAULT_SETTINGS.bank_name}
              accountName={DEFAULT_SETTINGS.account_name}
              accountNumber={DEFAULT_SETTINGS.account_number}
              amountToPay={formatNaira(order.total_amount)}
            />
          )}

          {/* Screenshot Upload */}
          <PaymentProofUploader
            orderCode={order.order_code}
            alreadyUploaded={!!order.payment_proof_path || isAwaitingConfirmation}
            onUploadSuccess={handleStatusUpdate}
          />
        </section>
      )}

      {/* If Payment Confirmed or in Delivery */}
      {(order.status === 'Payment Confirmed' ||
        order.status === 'Preparing' ||
        order.status === 'Out for Delivery' ||
        order.status === 'Delivered') && (
        <section
          aria-label="Order progress status"
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 space-y-2 text-center"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold">Payment Verified & Order Active</h2>
          <p className="text-sm text-emerald-900 max-w-md mx-auto">
            Your payment has been confirmed. Our grill masters are on it!
          </p>
        </section>
      )}

      {/* Order Summary & Delivery Details Card */}
      <section
        aria-labelledby="order-details-heading"
        className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
      >
        <h2 id="order-details-heading" className="text-lg font-bold text-brand-charcoal-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-brand-fire-700" aria-hidden="true" />
          <span>Order Breakdown</span>
        </h2>

        {/* Ordered items */}
        {order.items && order.items.length > 0 && (
          <ul className="divide-y divide-brand-offwhite-subtle">
            {order.items.map((item, idx) => (
              <li key={item.id || idx} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-brand-charcoal-900">
                    {item.quantity}× {item.product_name}
                  </span>
                  {item.sauce_name && (
                    <span className="block text-xs text-brand-charcoal-700">
                      Sauce: {item.sauce_name}
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

        {/* Financial Breakdown */}
        <div className="border-t border-brand-offwhite-subtle pt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between text-brand-charcoal-800">
            <span>Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-brand-charcoal-800">
            <span>Delivery Fee</span>
            <span>
              {isPendingFee
                ? 'Pending Confirmation'
                : formatNaira(order.delivery_fee)}
            </span>
          </div>

          <div className="border-t border-brand-offwhite-border pt-2 flex items-baseline justify-between font-bold text-base text-brand-charcoal-900">
            <span>Total</span>
            <span className="text-xl font-black">{formatNaira(order.total_amount)}</span>
          </div>
        </div>

        {/* Customer & Delivery Destination */}
        <div className="border-t border-brand-offwhite-subtle pt-4 space-y-2 text-xs sm:text-sm text-brand-charcoal-800">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-brand-fire-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-brand-charcoal-900">
                {order.customer_name} ({order.customer_phone})
              </p>
              <p className="text-brand-charcoal-700 mt-0.5">
                {order.customer_address}
                {order.area ? `, ${order.area}` : ''}, {order.state}
              </p>
              {order.order_note && (
                <p className="mt-1 text-xs italic text-brand-charcoal-700">
                  Note: &quot;{order.order_note}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick WhatsApp Support & Tracking shortcut */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm min-touch-target shadow-sm"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          <span>Chat on WhatsApp</span>
        </a>

        <Link
          href={`/track?code=${order.order_code}&phone=${encodeURIComponent(order.customer_phone)}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-brand-offwhite-border bg-white hover:bg-brand-offwhite-subtle text-brand-charcoal-900 font-bold text-sm min-touch-target"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          <span>Live Tracking Link</span>
        </Link>
      </div>
    </div>
  );
}

