import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateOrderCode, cleanPhoneNumber, isValidNigerianPhone } from '@/lib/utils/format';
import { CartItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      state,
      area,
      deliveryAddress,
      orderNote,
      items,
      deliveryFee,
    } = body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!phoneNumber || !isValidNigerianPhone(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid Nigerian phone number (e.g. 080... or +234...).' },
        { status: 400 }
      );
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please enter a complete delivery address with landmark.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your order is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    const isInterstate = state !== 'Akwa Ibom';
    const subtotal = items.reduce(
      (sum: number, item: CartItem) => sum + item.unit_price * item.quantity,
      0
    );

    // If interstate: status is 'Pending Fee Confirmation' and delivery_fee is 0/unconfirmed
    // If Akwa Ibom: delivery fee is 2000-3000, status is 'Pending Payment'
    const finalDeliveryFee = isInterstate ? 0 : Number(deliveryFee) || 2000;
    const totalAmount = subtotal + finalDeliveryFee;
    const initialStatus = isInterstate ? 'Pending Fee Confirmation' : 'Pending Payment';
    const orderCode = generateOrderCode();
    const cleanedPhone = cleanPhoneNumber(phoneNumber);

    // 2. Insert into Supabase (if configured)
    const adminSupabase = createAdminClient() || createServerSupabaseClient();

    if (adminSupabase) {
      const { data: orderData, error: orderError } = await adminSupabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: fullName.trim(),
          customer_phone: cleanedPhone,
          customer_address: deliveryAddress.trim(),
          state: state || 'Akwa Ibom',
          area: area || null,
          order_note: orderNote?.trim() || null,
          status: initialStatus,
          subtotal,
          delivery_fee: finalDeliveryFee,
          total_amount: totalAmount,
          is_interstate: isInterstate,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting order into Supabase:', orderError);
        return NextResponse.json(
          { error: 'Failed to create order. Please try again or chat with us on WhatsApp.' },
          { status: 500 }
        );
      }

      // Insert Order Items
      const orderItemsToInsert = items.map((item: CartItem) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sauce_id: item.sauce_id,
        sauce_name: item.sauce_name,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await adminSupabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error('Error inserting order items into Supabase:', itemsError);
      }

      return NextResponse.json({
        success: true,
        orderCode,
        phone: cleanedPhone,
        status: initialStatus,
        orderId: orderData.id,
      });
    }

    // 3. Fallback when Supabase keys are not yet configured in local environment
    return NextResponse.json({
      success: true,
      orderCode,
      phone: cleanedPhone,
      status: initialStatus,
      isFallback: true,
    });
  } catch (err: unknown) {
    console.error('Unhandled order creation error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while placing your order.' },
      { status: 500 }
    );
  }
}

