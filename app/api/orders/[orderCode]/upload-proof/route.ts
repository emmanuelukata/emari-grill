import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderCode: string } }
) {
  try {
    const { orderCode } = params;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided. Please select a payment screenshot.' },
        { status: 400 }
      );
    }

    // Limit check: 5 MB (SPEC section 8)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5 MB. Please upload a compressed screenshot.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    if (adminSupabase) {
      // 1. Verify order exists
      const { data: order, error: orderLookupError } = await adminSupabase
        .from('orders')
        .select('id, status')
        .eq('order_code', orderCode.toUpperCase().trim())
        .single();

      if (orderLookupError || !order) {
        return NextResponse.json(
          { error: 'Order not found.' },
          { status: 404 }
        );
      }

      // 2. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'jpg';
      const storagePath = `${orderCode.toUpperCase()}/${Date.now()}.${fileExt}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await adminSupabase.storage
        .from('payment_proofs')
        .upload(storagePath, fileBuffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to save payment proof image. Please try again or send via WhatsApp.' },
          { status: 500 }
        );
      }

      // 3. Update order status to 'Awaiting Confirmation'
      const { error: updateError } = await adminSupabase
        .from('orders')
        .update({
          payment_proof_path: storagePath,
          payment_proof_uploaded_at: new Date().toISOString(),
          status: 'Awaiting Confirmation',
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Order status update error:', updateError);
        return NextResponse.json(
          { error: 'Proof uploaded, but failed to update order status.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: 'Awaiting Confirmation',
        storagePath,
      });
    }

    // Fallback if Supabase is not yet connected
    return NextResponse.json({
      success: true,
      status: 'Awaiting Confirmation',
      isFallback: true,
    });
  } catch (err: unknown) {
    console.error('Upload proof error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while uploading payment screenshot.' },
      { status: 500 }
    );
  }
}

