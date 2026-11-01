'use client';

import React, { useState, useEffect } from 'react';
import { Product, BusinessSettings, DeliveryArea } from '@/types';
import { useAnnouncer } from '@/components/Announcer';
import { formatNaira } from '@/lib/utils/format';
import {
  Save,
  Building2,
  Phone,
  CreditCard,
  Flame,
  Truck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { announce } = useAnnouncer();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setProducts(data.products || []);
        setDeliveryAreas(data.deliveryAreas || []);
      }
    } catch {
      setErrorMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(false);
    announce('Saving settings changes...');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          products,
          deliveryAreas,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(true);
        announce('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setErrorMessage(msg);
      announce(msg, 'assertive');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-fire-700" aria-hidden="true" />
        <p className="text-sm text-brand-charcoal-700">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-offwhite-border pb-4">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal-900 tracking-tight">
            Business & Kitchen Settings
          </h1>
          <p className="text-xs sm:text-sm text-brand-charcoal-700 mt-1">
            Update bank account details, menu pricing, Uyo delivery areas, and contact hotline.
          </p>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-fire-700 hover:bg-brand-fire-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md min-touch-target"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2 font-bold animate-fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All settings updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center gap-2 font-bold animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Bank Transfer Account Details */}
        <section
          aria-labelledby="bank-settings-heading"
          className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-brand-offwhite-subtle pb-3">
            <CreditCard className="w-5 h-5 text-brand-fire-700" />
            <h2 id="bank-settings-heading" className="text-lg font-bold text-brand-charcoal-900">
              Customer Bank Transfer Details
            </h2>
          </div>
          <p className="text-xs text-brand-charcoal-700">
            These details are displayed to customers after they checkout.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                placeholder="e.g. Moniepoint MFB / OPay"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm min-touch-target bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={settings.account_name}
                onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                placeholder="e.g. Emari Grill Kitchen"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm min-touch-target bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={settings.account_number}
                onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                placeholder="e.g. 1234567890"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm font-mono font-bold min-touch-target bg-white"
              />
            </div>
          </div>
        </section>

        {/* 2. Business Info & WhatsApp Hotline */}
        <section
          aria-labelledby="contact-settings-heading"
          className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-brand-offwhite-subtle pb-3">
            <Building2 className="w-5 h-5 text-brand-fire-700" />
            <h2 id="contact-settings-heading" className="text-lg font-bold text-brand-charcoal-900">
              Business Info & WhatsApp
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm min-touch-target bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                WhatsApp Phone Number (with country code e.g. 234...)
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="2348000000000"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm font-mono min-touch-target bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
              Delivery Reassurance Note
            </label>
            <input
              type="text"
              value={settings.delivery_note}
              onChange={(e) => setSettings({ ...settings, delivery_note: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm min-touch-target bg-white"
            />
          </div>
        </section>

        {/* 3. Products & Pricing */}
        <section
          aria-labelledby="pricing-settings-heading"
          className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-brand-offwhite-subtle pb-3">
            <Flame className="w-5 h-5 text-brand-fire-700" />
            <h2 id="pricing-settings-heading" className="text-lg font-bold text-brand-charcoal-900">
              Chicken Pricing (₦ Naira)
            </h2>
          </div>

          <div className="space-y-4">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="p-4 rounded-xl border border-brand-offwhite-subtle bg-brand-offwhite grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
              >
                <div>
                  <span className="font-bold text-sm text-brand-charcoal-900 block">
                    {product.name}
                  </span>
                  <span className="text-xs text-brand-charcoal-700">
                    ID: {product.id}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                    Base Price (No Sauce)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-charcoal-700">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="500"
                      value={product.base_price}
                      onChange={(e) => {
                        const updated = [...products];
                        updated[idx].base_price = Number(e.target.value);
                        setProducts(updated);
                      }}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-brand-offwhite-border text-sm font-bold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1">
                    Price with Sauce (+₦1,000)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-charcoal-700">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="500"
                      value={product.price_with_sauce}
                      onChange={(e) => {
                        const updated = [...products];
                        updated[idx].price_with_sauce = Number(e.target.value);
                        setProducts(updated);
                      }}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-brand-offwhite-border text-sm font-bold bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Delivery Areas & Fees (Uyo, Akwa Ibom) */}
        <section
          aria-labelledby="delivery-settings-heading"
          className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-brand-offwhite-subtle pb-3">
            <Truck className="w-5 h-5 text-brand-fire-700" />
            <h2 id="delivery-settings-heading" className="text-lg font-bold text-brand-charcoal-900">
              Delivery Areas & Fees (Uyo, Akwa Ibom)
            </h2>
          </div>
          <p className="text-xs text-brand-charcoal-700">
            Per SPEC, deliveries in Uyo cost between ₦2,000 and ₦3,000, charged once per order.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliveryAreas.map((area, idx) => (
              <div
                key={area.id}
                className="p-3 rounded-xl border border-brand-offwhite-border bg-white flex items-center justify-between gap-3 text-sm"
              >
                <input
                  type="text"
                  value={area.name}
                  onChange={(e) => {
                    const updated = [...deliveryAreas];
                    updated[idx].name = e.target.value;
                    setDeliveryAreas(updated);
                  }}
                  className="flex-1 font-semibold text-brand-charcoal-900 border-b border-transparent focus:border-brand-fire-700 bg-transparent text-sm"
                />

                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-charcoal-700">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="2000"
                    max="3000"
                    step="500"
                    value={area.fee}
                    onChange={(e) => {
                      const updated = [...deliveryAreas];
                      updated[idx].fee = Number(e.target.value);
                      setDeliveryAreas(updated);
                    }}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-brand-offwhite-border text-xs font-bold text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>
    </div>
  );
}

