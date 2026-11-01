import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import { DEFAULT_PRODUCTS, DEFAULT_SAUCES } from '@/lib/data/mock-data';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Sauce } from '@/types';
import { Flame, ShieldCheck, Truck, Clock } from 'lucide-react';

export const revalidate = 60; // Cache and revalidate every minute

async function getProductsAndSauces(): Promise<{
  products: Product[];
  sauces: Sauce[];
}> {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return { products: DEFAULT_PRODUCTS, sauces: DEFAULT_SAUCES };
    }

    const [productsRes, saucesRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('sauces')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    const products =
      productsRes.data && productsRes.data.length > 0
        ? (productsRes.data as Product[])
        : DEFAULT_PRODUCTS;

    const sauces =
      saucesRes.data && saucesRes.data.length > 0
        ? (saucesRes.data as Sauce[])
        : DEFAULT_SAUCES;

    return { products, sauces };
  } catch {
    return { products: DEFAULT_PRODUCTS, sauces: DEFAULT_SAUCES };
  }
}

export default async function HomePage() {
  const { products, sauces } = await getProductsAndSauces();

  return (
    <div className="pb-28 sm:pb-32">
      {/* Hero Banner Section */}
      <section
        aria-labelledby="hero-title"
        className="bg-gradient-to-b from-brand-charcoal-900 to-brand-charcoal-800 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#EA580C_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-fire-600/30 border border-brand-fire-500/30 text-brand-gold-400 text-xs sm:text-sm font-semibold mb-4">
            <Flame className="w-4 h-4 text-brand-fire-500 shrink-0" aria-hidden="true" />
            <span>Uyo&apos;s Favorite Flame-Grilled Chicken</span>
          </div>

          <h1
            id="hero-title"
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto"
          >
            Hot, juicy grilled chicken in <span className="text-brand-fire-500">Uyo</span>.
          </h1>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-brand-charcoal-200 max-w-xl mx-auto leading-relaxed">
            Order your spiced chicken in seconds. Simple bank transfer, no account needed, delivered straight to your door.
          </p>

          {/* Quick Trust Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-brand-charcoal-100">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-brand-fire-500 shrink-0" aria-hidden="true" />
              <span>Grilled fresh to order</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Truck className="w-4 h-4 text-brand-gold-400 shrink-0" aria-hidden="true" />
              <span>Uyo delivery: ₦2k – ₦3k</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Easy bank transfer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Cards Section */}
      <section
        aria-labelledby="menu-heading"
        className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20"
      >
        <div className="sr-only">
          <h2 id="menu-heading">Our Chicken Menu</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} sauces={sauces} />
          ))}
        </div>
      </section>

      {/* How It Works (WhatsApp conversation simplicity) */}
      <section
        aria-labelledby="how-it-works-heading"
        className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20"
      >
        <div className="bg-brand-offwhite-subtle border border-brand-offwhite-border rounded-2xl p-6 sm:p-8">
          <h2
            id="how-it-works-heading"
            className="text-lg sm:text-xl font-bold text-brand-charcoal-900 text-center"
          >
            How Ordering Works
          </h2>
          <p className="text-sm text-brand-charcoal-700 text-center mt-1">
            As easy as a WhatsApp chat — no signup or passwords.
          </p>

          <ol className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <li className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2">
              <span className="w-10 h-10 rounded-full bg-brand-fire-700 text-white font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="font-bold text-sm text-brand-charcoal-900">Select & Customize</h3>
                <p className="text-xs text-brand-charcoal-700 mt-0.5">
                  Choose Half or Full Chicken, add your favorite sauce, and click Order Now.
                </p>
              </div>
            </li>

            <li className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2">
              <span className="w-10 h-10 rounded-full bg-brand-fire-700 text-white font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h3 className="font-bold text-sm text-brand-charcoal-900">Transfer & Upload</h3>
                <p className="text-xs text-brand-charcoal-700 mt-0.5">
                  Send payment to our account and snap a quick screenshot of your receipt.
                </p>
              </div>
            </li>

            <li className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2">
              <span className="w-10 h-10 rounded-full bg-brand-fire-700 text-white font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="font-bold text-sm text-brand-charcoal-900">Track & Feast</h3>
                <p className="text-xs text-brand-charcoal-700 mt-0.5">
                  Track your delivery rider in real time and enjoy hot, smoky grilled chicken!
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
