'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, Settings, LogOut, ExternalLink } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show admin nav bar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      try {
        sessionStorage.removeItem('admin_session');
      } catch {}
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { href: '/admin', label: 'Orders', icon: ShoppingBag, exact: true },
    { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
  ];

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-30 bg-brand-charcoal-900 text-white border-b border-brand-charcoal-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" inverted asLink={false} />
            <span className="text-xs font-bold px-2 py-0.5 bg-brand-fire-700 text-white rounded-md tracking-wider uppercase">
              Staff
            </span>
          </div>

          <nav aria-label="Admin Navigation" className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold min-touch-target transition-colors ${
                    isActive
                      ? 'bg-brand-charcoal-800 text-white ring-1 ring-white/20'
                      : 'text-brand-charcoal-200 hover:text-white hover:bg-brand-charcoal-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-fire-500" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-brand-charcoal-200 hover:text-white min-touch-target"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out of admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-brand-charcoal-800 min-touch-target"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}

