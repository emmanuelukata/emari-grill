import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cleanPhoneNumber } from '@/lib/utils/format';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderCode: string } }
) {
  try {
    const { orderCode } = params;
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!orderCode) {
      return NextResponse.json({ error: 'Order code is required.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient() || createServerSupabaseClient();

    if (adminSupabase) {
      let query = adminSupabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_code', orderCode.toUpperCase().trim());

      // If phone is provided, verify phone match for customer security
      if (phone) {
        const cleanedPhone = cleanPhoneNumber(phone);
        // Match exact or last 10 digits
        const last10 = cleanedPhone.slice(-10);
        query = query.ilike('customer_phone', `%${last10}%`);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Order not found. Please verify your order code and phone number.' },
          { status: 404 }
        );
      }

      // Generate signed URL for payment proof if uploaded
      let proofUrl: string | null = null;
      if (data.payment_proof_path) {
        const { data: signedData } = await adminSupabase.storage
          .from('payment_proofs')
          .createSignedUrl(data.payment_proof_path, 3600); // 1 hour validity
        proofUrl = signedData?.signedUrl || null;
      }

      return NextResponse.json({
        order: {
          ...data,
          items: data.order_items || [],
          payment_proof_url: proofUrl,
        },
      });
    }

    return NextResponse.json(
      { error: 'Supabase credentials not configured yet.' },
      { status: 501 }
    );
  } catch (err: unknown) {
    console.error('Fetch order error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve order details.' },
      { status: 500 }
    );
  }
}
