export type OrderStatus =
  | 'Pending Fee Confirmation'
  | 'Pending Payment'
  | 'Awaiting Confirmation'
  | 'Payment Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number; // in NGN without sauce
  price_with_sauce: number; // in NGN with sauce
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Sauce {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface DeliveryArea {
  id: string;
  state: string;
  city: string;
  name: string;
  fee: number; // ₦2,000 to ₦3,000
  is_active: boolean;
  sort_order: number;
}

export interface InterstateFee {
  id: string;
  state: string;
  default_fee: number | null;
  is_active: boolean;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  tagline: string;
  home_state: string;
  home_city: string;
  whatsapp_number: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  delivery_note: string;
  updated_at?: string;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. productId-sauceId)
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  sauce_id: string | null;
  sauce_name: string | null;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  sauce_id: string | null;
  sauce_name: string | null;
  total_price: number;
  created_at?: string;
}

export interface OrderRecord {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  state: string;
  area: string | null;
  order_note: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  is_interstate: boolean;
  estimated_delivery_time: string | null;
  rejection_reason: string | null;
  payment_proof_path: string | null;
  payment_proof_uploaded_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItemRecord[];
}

export interface CheckoutFormData {
  fullName: string;
  phoneNumber: string;
  state: string;
  area: string;
  customArea?: string;
  deliveryAddress: string;
  orderNote?: string;
}
