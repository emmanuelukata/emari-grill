'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useAnnouncer } from '@/components/Announcer';
import { formatNaira, isValidNigerianPhone } from '@/lib/utils/format';
import {
  DEFAULT_DELIVERY_AREAS,
  NIGERIAN_STATES,
} from '@/lib/data/mock-data';
import { DeliveryArea } from '@/types';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalCount, removeItem, updateQuantity, clearCart, isLoaded } = useCart();
  const { announce } = useAnnouncer();

  const [deliveryAreas] = useState<DeliveryArea[]>(DEFAULT_DELIVERY_AREAS);
  const [selectedState, setSelectedState] = useState('Akwa Ibom');
  const [selectedAreaId, setSelectedAreaId] = useState(DEFAULT_DELIVERY_AREAS[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isInterstate = selectedState !== 'Akwa Ibom';
  const selectedArea = deliveryAreas.find((a) => a.id === selectedAreaId);
  const deliveryFee = isInterstate ? 0 : selectedArea ? selectedArea.fee : 2000;
  const finalTotal = subtotal + (isInterstate ? 0 : deliveryFee);

  // Announce page loaded
  useEffect(() => {
    announce('Checkout page loaded. Please review your order and enter delivery details.');
  }, [announce]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (at least 2 letters).';
    }

    if (!phoneNumber.trim() || !isValidNigerianPhone(phoneNumber)) {
      newErrors.phoneNumber =
        'Please enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678).';
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      newErrors.deliveryAddress =
        'Please enter your street address, house number, or known landmark.';
    }

    if (!isInterstate && !selectedAreaId) {
      newErrors.area = 'Please select a delivery area in Uyo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      announce('There are errors in the form. Please check the highlighted fields.', 'assertive');
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField instanceof HTMLElement) {
        firstErrorField.focus();
      }
      return;
    }

    if (items.length === 0) {
      setServerError('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsSubmitting(true);
    announce('Submitting your order, please wait...');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          state: selectedState,
          area: isInterstate ? null : selectedArea?.name,
          deliveryAddress,
          orderNote,
          items,
          deliveryFee,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order. Please try again.');
      }

      // Order created successfully!
      announce('Order placed successfully! Redirecting to confirmation page.', 'polite');

      // Clear the cart
      clearCart();

      // Store temporary order info for fallback preview if needed
      try {
        sessionStorage.setItem(
          `order_${data.orderCode}`,
          JSON.stringify({
            orderCode: data.orderCode,
            customerName: fullName,
            customerPhone: data.phone || phoneNumber,
            customerAddress: deliveryAddress,
            state: selectedState,
            area: isInterstate ? null : selectedArea?.name,
            orderNote,
            status: data.status,
            subtotal,
            deliveryFee: isInterstate ? 0 : deliveryFee,
            totalAmount: isInterstate ? subtotal : finalTotal,
            isInterstate,
            items,
            createdAt: new Date().toISOString(),
          })
        );
      } catch {}

      // Navigate to order confirmation
      router.push(`/order/${data.orderCode}?phone=${encodeURIComponent(data.phone || phoneNumber)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      setServerError(msg);
      announce(`Error: ${msg}`, 'assertive');
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-brand-charcoal-700">Loading your order...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-fire-100 text-brand-fire-700 flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-brand-charcoal-900">Your order is empty</h1>
        <p className="mt-2 text-sm text-brand-charcoal-700">
          You haven&apos;t added any flame-grilled chicken yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-fire-700 hover:bg-brand-fire-800 text-white font-bold rounded-xl min-touch-target transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-charcoal-800 hover:text-brand-fire-700 rounded-md p-1 min-touch-target"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Menu</span>
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-900 tracking-tight">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-brand-charcoal-700">
        Quick & simple: Enter your delivery info, then pay directly by bank transfer.
      </p>

      {/* Global Error Banner */}
      {serverError && (
        <div
          role="alert"
          className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-sm">Could not place order</h2>
            <p className="text-sm mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Form */}
        <div className="md:col-span-7">
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Delivery and contact information"
            className="space-y-6 bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-brand-charcoal-900 border-b border-brand-offwhite-subtle pb-3">
              1. Delivery Information
            </h2>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-bold text-brand-charcoal-900 mb-1"
              >
                Full Name <span className="text-brand-fire-700" aria-hidden="true">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                placeholder="e.g. Emmanuel Okon"
                className={`w-full px-4 py-3 rounded-xl border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 focus:border-brand-fire-700 bg-white ${
                  errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-brand-offwhite-border'
                }`}
              />
              {errors.fullName && (
                <p id="fullName-error" className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-bold text-brand-charcoal-900 mb-1"
              >
                Phone Number <span className="text-brand-fire-700" aria-hidden="true">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                }}
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={
                  errors.phoneNumber ? 'phoneNumber-error' : 'phone-hint'
                }
                placeholder="0801 234 5678"
                className={`w-full px-4 py-3 rounded-xl border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 focus:border-brand-fire-700 bg-white ${
                  errors.phoneNumber ? 'border-red-500 bg-red-50/30' : 'border-brand-offwhite-border'
                }`}
              />
              <p id="phone-hint" className="mt-1 text-xs text-brand-charcoal-700">
                Accepts Nigerian numbers (e.g. 080..., 090..., +234...).
              </p>
              {errors.phoneNumber && (
                <p id="phoneNumber-error" className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.phoneNumber}</span>
                </p>
              )}
            </div>

            {/* State Selection */}
            <div>
              <label
                htmlFor="stateSelect"
                className="block text-sm font-bold text-brand-charcoal-900 mb-1"
              >
                State <span className="text-brand-fire-700" aria-hidden="true">*</span>
              </label>
              <select
                id="stateSelect"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-offwhite-border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 focus:border-brand-fire-700 bg-white"
              >
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state} {state === 'Akwa Ibom' ? '(Home State / Uyo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Area selection (Only when Akwa Ibom) */}
            {!isInterstate ? (
              <div>
                <label
                  htmlFor="areaSelect"
                  className="block text-sm font-bold text-brand-charcoal-900 mb-1"
                >
                  Delivery Area in Uyo <span className="text-brand-fire-700" aria-hidden="true">*</span>
                </label>
                <select
                  id="areaSelect"
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-offwhite-border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 focus:border-brand-fire-700 bg-white"
                >
                  {deliveryAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name} — {formatNaira(area.fee)} delivery
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-brand-charcoal-700">
                  Deliveries within Uyo are ₦2,000 – ₦3,000 charged once per order.
                </p>
              </div>
            ) : (
              /* Interstate Delivery Notice */
              <div
                role="status"
                className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-brand-charcoal-900 text-sm space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-brand-gold-800">
                  <Truck className="w-4 h-4 shrink-0 text-brand-gold-700" aria-hidden="true" />
                  <span>Interstate Delivery Confirmation</span>
                </div>
                <p className="text-xs leading-relaxed text-brand-charcoal-800">
                  Delivery to your location will be confirmed by Emari Grill before payment.
                  You can chat with our team on WhatsApp immediately after submitting.
                </p>
              </div>
            )}

            {/* Delivery Address */}
            <div>
              <label
                htmlFor="deliveryAddress"
                className="block text-sm font-bold text-brand-charcoal-900 mb-1"
              >
                Delivery Address <span className="text-brand-fire-700" aria-hidden="true">*</span>
              </label>
              <textarea
                id="deliveryAddress"
                rows={3}
                autoComplete="street-address"
                required
                value={deliveryAddress}
                onChange={(e) => {
                  setDeliveryAddress(e.target.value);
                  if (errors.deliveryAddress) setErrors((prev) => ({ ...prev, deliveryAddress: '' }));
                }}
                aria-invalid={!!errors.deliveryAddress}
                aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
                placeholder="Street address, building number, and notable nearby landmark"
                className={`w-full px-4 py-3 rounded-xl border text-base focus:ring-2 focus:ring-brand-fire-700 focus:border-brand-fire-700 bg-white ${
                  errors.deliveryAddress ? 'border-red-500 bg-red-50/30' : 'border-brand-offwhite-border'
                }`}
              />
              {errors.deliveryAddress && (
                <p id="deliveryAddress-error" className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.deliveryAddress}</span>
                </p>
              )}
            </div>

            {/* Optional Note */}
            <div>
              <label
                htmlFor="orderNote"
                className="block text-sm font-bold text-brand-charcoal-900 mb-1"
              >
                Delivery Note <span className="font-normal text-brand-charcoal-700">(Optional)</span>
              </label>
              <input
                id="orderNote"
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="e.g. Call when outside the gate, extra spicy"
                className="w-full px-4 py-3 rounded-xl border border-brand-offwhite-border text-base min-touch-target focus:ring-2 focus:ring-brand-fire-700 focus:border-brand-fire-700 bg-white"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-brand-fire-700 hover:bg-brand-fire-800 disabled:opacity-50 text-white font-extrabold text-lg rounded-xl shadow-md transition-all active:scale-[0.99] min-touch-target flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>Place Order • {isInterstate ? `${formatNaira(subtotal)} + delivery` : formatNaira(finalTotal)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <aside
          aria-labelledby="summary-heading"
          className="md:col-span-5 bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-brand-offwhite-subtle pb-3">
            <h2 id="summary-heading" className="text-lg font-bold text-brand-charcoal-900">
              Order Summary
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-fire-100 text-brand-fire-800 rounded-full">
              {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Items List */}
          <ul className="divide-y divide-brand-offwhite-subtle">
            {items.map((item) => (
              <li key={item.id} className="py-3 flex items-start justify-between gap-3 text-sm">
                <div className="flex-1">
                  <div className="font-bold text-brand-charcoal-900">
                    {item.quantity}× {item.product_name}
                  </div>
                  <div className="text-xs text-brand-charcoal-700 mt-0.5">
                    {item.sauce_name ? `Sauce: ${item.sauce_name}` : 'No sauce'}
                  </div>
                  <div className="text-xs text-brand-charcoal-700 mt-0.5">
                    {formatNaira(item.unit_price)} each
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-brand-charcoal-900">
                    {formatNaira(item.unit_price * item.quantity)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.product_name} from cart`}
                    className="mt-1 text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 min-touch-target p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Remove</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Breakdown & Totals */}
          <div className="border-t border-brand-offwhite-subtle pt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-brand-charcoal-800">
              <span>Items Subtotal</span>
              <span className="font-semibold">{formatNaira(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-brand-charcoal-800">
              <span>Delivery Fee ({isInterstate ? selectedState : selectedArea?.name || 'Uyo'})</span>
              <span className="font-semibold">
                {isInterstate ? (
                  <span className="text-brand-gold-800 text-xs">To be confirmed</span>
                ) : (
                  formatNaira(deliveryFee)
                )}
              </span>
            </div>

            <div className="border-t border-brand-offwhite-border pt-3 flex items-baseline justify-between">
              <span className="text-base font-bold text-brand-charcoal-900">Total</span>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-charcoal-900">
                  {formatNaira(finalTotal)}
                </span>
                {isInterstate && (
                  <span className="block text-xs text-brand-charcoal-700 font-medium">
                    + delivery fee (to be confirmed)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-brand-offwhite-subtle rounded-xl p-3 text-xs text-brand-charcoal-700 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Payment is made by simple bank transfer after this step. Bank details will be shown on the next page.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

