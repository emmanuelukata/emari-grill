import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      status,
      rejectionReason,
      interstateFee,
      estimatedDeliveryTime,
    } = body;

    const adminSupabase = createAdminClient() || createServerSupabaseClient();

    if (!adminSupabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // 1. Fetch current order to handle fee calculation if updating interstate fee
    const { data: currentOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.status = status;
    }

    if (rejectionReason !== undefined) {
      updates.rejection_reason = rejectionReason;
    }

    if (estimatedDeliveryTime !== undefined) {
      updates.estimated_delivery_time = estimatedDeliveryTime;
    }

    // Setting interstate delivery fee
    if (interstateFee !== undefined && interstateFee !== null) {
      const parsedFee = Number(interstateFee);
      if (isNaN(parsedFee) || parsedFee < 0) {
        return NextResponse.json({ error: 'Invalid delivery fee amount' }, { status: 400 });
      }
      updates.delivery_fee = parsedFee;
      updates.total_amount = currentOrder.subtotal + parsedFee;
      // When interstate fee is set, move order to 'Pending Payment'
      updates.status = 'Pending Payment';
    }

    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (updateError) {
      console.error('Update order error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err: unknown) {
    console.error('Admin order update error:', err);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
