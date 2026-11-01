'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { useAnnouncer } from '@/components/Announcer';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { announce } = useAnnouncer();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();

      if (!supabase) {
        // Fallback for local preview when Supabase env vars are not set
        sessionStorage.setItem('admin_session', 'authenticated_demo');
        announce('Admin demo session started.');
        router.push('/admin');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      announce('Logged in successfully. Redirecting to admin dashboard.');
      router.push('/admin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      setErrorMsg(msg);
      announce(`Login failed: ${msg}`, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal-700 hover:text-brand-fire-700 p-1 mb-4 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to Customer App</span>
          </Link>

          <div className="text-center space-y-2">
            <Logo size="lg" asLink={false} />
            <h1 className="text-xl font-black text-brand-charcoal-900 tracking-tight">
              Admin & Kitchen Portal
            </h1>
            <p className="text-xs text-brand-charcoal-700">
              Sign in with your staff credentials to manage orders and settings.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="emailInput"
              className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1"
            >
              Staff Email
            </label>
            <div className="relative">
              <input
                id="emailInput"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@emarigrill.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-offwhite-border text-sm min-touch-target focus:ring-2 focus:ring-brand-fire-700 bg-white"
              />
              <Mail
                className="w-4 h-4 text-brand-charcoal-200 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="passwordInput"
              className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal-800 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="passwordInput"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-offwhite-border text-sm min-touch-target focus:ring-2 focus:ring-brand-fire-700 bg-white"
              />
              <Lock
                className="w-4 h-4 text-brand-charcoal-200 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-brand-charcoal-900 hover:bg-brand-charcoal-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-md min-touch-target transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-brand-gold-400" aria-hidden="true" />
                <span>Sign In to Admin</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
