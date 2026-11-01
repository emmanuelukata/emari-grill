'use client';

import React, { useState } from 'react';
import { Product, Sauce } from '@/types';
import { useCart } from '@/lib/context/CartContext';
import { formatNaira } from '@/lib/utils/format';
import { Plus, Minus, Check, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  sauces: Sauce[];
}

export function ProductCard({ product, sauces }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSauceId, setSelectedSauceId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedRecently, setIsAddedRecently] = useState<boolean>(false);

  const selectedSauce = sauces.find((s) => s.id === selectedSauceId) || null;
  const unitPrice = selectedSauce ? product.price_with_sauce : product.base_price;
  const totalPrice = unitPrice * quantity;

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 20));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    addItem(product, selectedSauce, quantity);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  return (
    <article
      aria-labelledby={`product-heading-${product.id}`}
      className="bg-brand-offwhite-card rounded-2xl border border-brand-offwhite-border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
    >
      {/* Visual Header / Photo Placeholder */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-br from-brand-charcoal-900 to-brand-charcoal-800 p-6 flex flex-col justify-between overflow-hidden">
        {/* Subtle decorative smoke/ember pattern */}
        <div
          className="absolute inset-0 opacity-15 bg-[radial-gradient(#EA580C_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-fire-700 text-white shadow">
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            Flame-Grilled
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-black/40 backdrop-blur-sm text-brand-gold-400 rounded-md border border-white/10">
            Fresh to order
          </span>
        </div>

        {/* Big stylized illustration placeholder */}
        <div className="z-10 text-center my-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-fire-600/20 text-brand-fire-500 mb-1 border border-brand-fire-500/30">
            <Flame className="w-8 h-8" aria-hidden="true" />
          </div>
          <p className="text-xs font-medium text-brand-charcoal-200 tracking-wide">
            {product.name === 'Full Chicken' ? 'Whole slow-roasted chicken' : 'Half seasoned chicken'}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2
              id={`product-heading-${product.id}`}
              className="text-xl sm:text-2xl font-bold text-brand-charcoal-900"
            >
              {product.name}
            </h2>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-extrabold text-brand-charcoal-900">
                {formatNaira(product.base_price)}
              </span>
              <span className="block text-xs text-brand-charcoal-200 font-medium">
                (or {formatNaira(product.price_with_sauce)} with sauce)
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-brand-charcoal-700 leading-relaxed">
            {product.description}
          </p>

          {/* Sauce Selector */}
          <fieldset className="mt-5 border-t border-brand-offwhite-subtle pt-4">
            <legend className="text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-2.5">
              Choose Sauce <span className="font-normal text-brand-charcoal-200">(Optional, 1 per chicken)</span>:
            </legend>

            <div className="space-y-2">
              {/* Option 1: No Sauce */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all min-touch-target ${
                  selectedSauceId === null
                    ? 'border-brand-fire-700 bg-brand-fire-50/50 text-brand-charcoal-900 font-semibold ring-1 ring-brand-fire-700'
                    : 'border-brand-offwhite-border hover:bg-brand-offwhite-subtle text-brand-charcoal-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`sauce-${product.id}`}
                    value=""
                    checked={selectedSauceId === null}
                    onChange={() => setSelectedSauceId(null)}
                    className="w-4 h-4 text-brand-fire-700 focus:ring-brand-fire-700 border-gray-300"
                  />
                  <span>No Sauce</span>
                </div>
                <span className="text-xs text-brand-charcoal-200 font-medium">
                  {formatNaira(product.base_price)}
                </span>
              </label>

              {/* Dynamic Sauces */}
              {sauces.map((sauce) => {
                const isSelected = selectedSauceId === sauce.id;
                return (
                  <label
                    key={sauce.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all min-touch-target ${
                      isSelected
                        ? 'border-brand-fire-700 bg-brand-fire-50/50 text-brand-charcoal-900 font-semibold ring-1 ring-brand-fire-700'
                        : 'border-brand-offwhite-border hover:bg-brand-offwhite-subtle text-brand-charcoal-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`sauce-${product.id}`}
                        value={sauce.id}
                        checked={isSelected}
                        onChange={() => setSelectedSauceId(sauce.id)}
                        className="w-4 h-4 text-brand-fire-700 focus:ring-brand-fire-700 border-gray-300"
                      />
                      <span>{sauce.name}</span>
                    </div>
                    <span className="text-xs text-brand-fire-800 font-semibold">
                      +{formatNaira(product.price_with_sauce - product.base_price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Stepper & Add to Order Bar */}
        <div className="pt-4 border-t border-brand-offwhite-subtle space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Quantity Stepper */}
            <div
              className="inline-flex items-center border-2 border-brand-offwhite-border rounded-xl bg-brand-offwhite p-1"
              role="group"
              aria-label={`Quantity selector for ${product.name}`}
            >
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                aria-label={`Decrease quantity of ${product.name}`}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-brand-charcoal-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-touch-target"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>

              <span
                className="w-10 text-center font-bold text-lg text-brand-charcoal-900"
                aria-live="polite"
                aria-label={`Current quantity: ${quantity}`}
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= 20}
                aria-label={`Increase quantity of ${product.name}`}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-brand-charcoal-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-touch-target"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Total calculated for this item selection */}
            <div className="text-right">
              <span className="text-xs text-brand-charcoal-200 block font-medium">Subtotal</span>
              <span className="text-lg font-bold text-brand-charcoal-900">
                {formatNaira(totalPrice)}
              </span>
            </div>
          </div>

          {/* Add to Order Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm min-touch-target ${
              isAddedRecently
                ? 'bg-emerald-700 text-white'
                : 'bg-brand-fire-700 hover:bg-brand-fire-800 active:scale-[0.99] text-white'
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-5 h-5" aria-hidden="true" />
                <span>Added to Order!</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" aria-hidden="true" />
                <span>Add to Order • {formatNaira(totalPrice)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
