import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { OrderRecord } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const adminSupabase = createAdminClient() || createServerSupabaseClient();

    if (adminSupabase) {
      let query = adminSupabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (status && status !== 'All') {
        if (status === 'Needs Action') {
          query = query.in('status', ['Awaiting Confirmation', 'Pending Fee Confirmation']);
        } else {
          query = query.eq('status', status);
        }
      }

      if (search && search.trim()) {
        const cleanSearch = search.trim().toUpperCase();
        query = query.or(`order_code.ilike.%${cleanSearch}%,customer_phone.ilike.%${cleanSearch}%,customer_name.ilike.%${cleanSearch}%`);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error('Admin orders query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Compute daily summary
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const allOrders = (orders || []) as OrderRecord[];
      const todayOrders = allOrders.filter(
        (o) => new Date(o.created_at) >= startOfToday
      );

      const awaitingConfirmationCount = allOrders.filter(
        (o) => o.status === 'Awaiting Confirmation'
      ).length;

      const pendingFeeCount = allOrders.filter(
        (o) => o.status === 'Pending Fee Confirmation'
      ).length;

      const confirmedSalesToday = todayOrders
        .filter((o) =>
          ['Payment Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(o.status)
        )
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Map signed URLs for payment proofs
      const ordersWithUrls = await Promise.all(
        allOrders.map(async (order) => {
          let proofUrl = null;
          if (order.payment_proof_path) {
            const { data: signed } = await adminSupabase.storage
              .from('payment_proofs')
              .createSignedUrl(order.payment_proof_path, 7200);
            proofUrl = signed?.signedUrl || null;
          }
          return {
            ...order,
            items: order.items || (order as unknown as { order_items: unknown[] }).order_items || [],
            payment_proof_url: proofUrl,
          };
        })
      );

      return NextResponse.json({
        orders: ordersWithUrls,
        summary: {
          ordersToday: todayOrders.length,
          awaitingConfirmation: awaitingConfirmationCount,
          pendingFeeConfirmation: pendingFeeCount,
          totalConfirmedSales: confirmedSalesToday,
        },
      });
    }

    // Fallback if Supabase credentials not yet configured
    return NextResponse.json({
      orders: [],
      summary: {
        ordersToday: 0,
        awaitingConfirmation: 0,
        pendingFeeConfirmation: 0,
        totalConfirmedSales: 0,
      },
    });
  } catch (err: unknown) {
    console.error('Admin orders error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch admin orders' },
      { status: 500 }
    );
  }
}

