import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  DEFAULT_SETTINGS,
  DEFAULT_PRODUCTS,
  DEFAULT_SAUCES,
  DEFAULT_DELIVERY_AREAS,
} from '@/lib/data/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminSupabase = createAdminClient() || createServerSupabaseClient();

    if (!adminSupabase) {
      return NextResponse.json({
        settings: DEFAULT_SETTINGS,
        products: DEFAULT_PRODUCTS,
        sauces: DEFAULT_SAUCES,
        deliveryAreas: DEFAULT_DELIVERY_AREAS,
      });
    }

    const [settingsRes, productsRes, saucesRes, areasRes] = await Promise.all([
      adminSupabase.from('settings').select('*').single(),
      adminSupabase.from('products').select('*').order('sort_order', { ascending: true }),
      adminSupabase.from('sauces').select('*').order('sort_order', { ascending: true }),
      adminSupabase.from('delivery_areas').select('*').order('sort_order', { ascending: true }),
    ]);

    return NextResponse.json({
      settings: settingsRes.data || DEFAULT_SETTINGS,
      products: (productsRes.data && productsRes.data.length > 0) ? productsRes.data : DEFAULT_PRODUCTS,
      sauces: (saucesRes.data && saucesRes.data.length > 0) ? saucesRes.data : DEFAULT_SAUCES,
      deliveryAreas: (areasRes.data && areasRes.data.length > 0) ? areasRes.data : DEFAULT_DELIVERY_AREAS,
    });
  } catch (err: unknown) {
    console.error('Fetch settings error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, products, deliveryAreas } = body;

    const adminSupabase = createAdminClient() || createServerSupabaseClient();

    if (!adminSupabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // 1. Update general settings
    if (settings) {
      await adminSupabase
        .from('settings')
        .upsert({
          id: 'general',
          business_name: settings.business_name,
          whatsapp_number: settings.whatsapp_number,
          bank_name: settings.bank_name,
          account_name: settings.account_name,
          account_number: settings.account_number,
          delivery_note: settings.delivery_note,
          updated_at: new Date().toISOString(),
        });
    }

    // 2. Update products
    if (Array.isArray(products)) {
      for (const p of products) {
        await adminSupabase
          .from('products')
          .update({
            base_price: Number(p.base_price),
            price_with_sauce: Number(p.price_with_sauce),
            updated_at: new Date().toISOString(),
          })
          .eq('id', p.id);
      }
    }

    // 3. Update delivery areas
    if (Array.isArray(deliveryAreas)) {
      for (const a of deliveryAreas) {
        await adminSupabase
          .from('delivery_areas')
          .update({
            name: a.name,
            fee: Number(a.fee),
          })
          .eq('id', a.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Update settings error:', err);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

