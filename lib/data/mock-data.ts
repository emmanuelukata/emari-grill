import { Product, Sauce, DeliveryArea, InterstateFee, BusinessSettings } from '@/types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'half-chicken',
    name: 'Half Chicken',
    description: 'Juicy, seasoned, flame-grilled half chicken. Crispy on the outside, succulent inside.',
    base_price: 7000,
    price_with_sauce: 8000,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'full-chicken',
    name: 'Full Chicken',
    description: 'A whole flame-grilled chicken packed with rich smoky spice. Perfect for couples or family sharing.',
    base_price: 14000,
    price_with_sauce: 16000,
    is_active: true,
    sort_order: 2,
  },
];

export const DEFAULT_SAUCES: Sauce[] = [
  {
    id: 'salad',
    name: 'Salad (served with cream)',
    description: 'Crunchy fresh cabbage & carrot coleslaw with creamy salad dressing',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'pepper-sauce',
    name: 'Pepper sauce',
    description: 'Traditional hot pepper dip infused with grilled aromatics',
    is_active: true,
    sort_order: 2,
  },
];

export const DEFAULT_DELIVERY_AREAS: DeliveryArea[] = [
  { id: '1', state: 'Akwa Ibom', city: 'Uyo', name: 'Ewet Housing Estate', fee: 2000, is_active: true, sort_order: 1 },
  { id: '2', state: 'Akwa Ibom', city: 'Uyo', name: 'Shelter Afrique Estate', fee: 2500, is_active: true, sort_order: 2 },
  { id: '3', state: 'Akwa Ibom', city: 'Uyo', name: 'Osongama Estate', fee: 2000, is_active: true, sort_order: 3 },
  { id: '4', state: 'Akwa Ibom', city: 'Uyo', name: 'Ikot Ekpene Road', fee: 2500, is_active: true, sort_order: 4 },
  { id: '5', state: 'Akwa Ibom', city: 'Uyo', name: 'Itam Junction / Market', fee: 3000, is_active: true, sort_order: 5 },
  { id: '6', state: 'Akwa Ibom', city: 'Uyo', name: 'Oron Road Axis', fee: 2000, is_active: true, sort_order: 6 },
  { id: '7', state: 'Akwa Ibom', city: 'Uyo', name: 'Nwaniba Road / Uniuyo Town Campus', fee: 2500, is_active: true, sort_order: 7 },
  { id: '8', state: 'Akwa Ibom', city: 'Uyo', name: 'Abak Road Axis', fee: 2500, is_active: true, sort_order: 8 },
  { id: '9', state: 'Akwa Ibom', city: 'Uyo', name: 'Federal Housing Estate', fee: 2500, is_active: true, sort_order: 9 },
  { id: '10', state: 'Akwa Ibom', city: 'Uyo', name: 'Ring Road 3', fee: 3000, is_active: true, sort_order: 10 },
];

export const NIGERIAN_STATES: string[] = [
  'Akwa Ibom',
  'Abia',
  'Adamawa',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
  'Federal Capital Territory (Abuja)',
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  id: 'general',
  business_name: 'Emari Grill',
  tagline: 'Hot, tender flame-grilled chicken in Uyo',
  home_state: 'Akwa Ibom',
  home_city: 'Uyo',
  whatsapp_number: '2348000000000',
  bank_name: 'Moniepoint MFB / OPay',
  account_name: 'Emari Grill Kitchen',
  account_number: '1234567890',
  delivery_note: 'Deliveries within Uyo arrive hot and fresh within 45 to 60 minutes.',
};

