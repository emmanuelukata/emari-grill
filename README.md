# Emari Grill Ordering App 🍗🔥

A fast, lightweight, mobile-first ordering app for **Emari Grill**, a grilled chicken seller based in Uyo, Akwa Ibom State, Nigeria.

Built to feel as simple and familiar as a WhatsApp chat: no account creation, no password friction, direct bank transfer payment, and live order tracking.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom WCAG 2.2 AA accessible theme tokens
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, email/password admin auth)
- **Storage**: Supabase Storage (private bucket for customer payment proofs)
- **Deployment**: Vercel
- **Payments**: Manual Nigerian bank transfer (OPay, Moniepoint, etc.) with screenshot upload

---

## 🎨 Brand Design & Accessibility (WCAG 2.2 AA)

- **Colors**:
  - Charcoal Black: `#1A1A1A`
  - Fire Orange: `#C2410C` (tested contrast ratio 4.8:1 against off-white background, exceeding the 4.5:1 requirement)
  - Warm Gold: `#B45309` / `#F59E0B`
  - Warm Off-White: `#FBF9F5`
- **Touch Targets**: All buttons, inputs, and steppers have a minimum touch target of 44 × 44 px for comfortable one-handed mobile use.
- **Screen Reader Announcements**: Live region (`AnnouncerProvider`) announces cart additions, clipboard copies, status changes, and form errors via `aria-live`.
- **Keyboard Navigation**: High-contrast visible focus rings (`:focus-visible`), logical tab order, and a "Skip to main content" link.
- **In-App Browser Friendly**: Optimized for TikTok, Instagram, and Facebook mobile webviews with no fragile popups or blocking new-tab behaviors.

---

## 📋 Architectural Decisions & Assumptions

Documented per SPEC.md:

1. **Uyo Delivery Fee Rules**:
   - Deliveries within Uyo are charged **once per order** (never per chicken item) and range from ₦2,000 to ₦3,000 (never above ₦3,000).
   - Seeding includes common Uyo areas (Ewet Housing, Shelter Afrique, Osongama, Ikot Ekpene Road, Itam Junction, Oron Road, Nwaniba/Uniuyo, Abak Road, Federal Housing, Ring Road 3) at ₦2,000 – ₦3,000. All areas and fees are editable in the admin settings.
2. **Interstate Delivery Workflow**:
   - For all states other than Akwa Ibom, delivery fees fluctuate and cannot be preset automatically.
   - The customer sees: *"Delivery to your location will be confirmed by Emari Grill before payment."*
   - Order is created in status `Pending Fee Confirmation`. Bank details and payment upload are hidden until the admin confirms the fee.
   - Admin opens the order detail in `/admin`, inputs the transit fee, and saves. This updates the total and moves the order to `Pending Payment`. The customer immediately sees the final amount, bank details, and screenshot uploader on the tracking page.
   - Prefilled WhatsApp buttons allow the customer and admin to discuss transit fees directly.
3. **Logo Abstraction**:
   - The logo lives exclusively in [`components/Logo.tsx`](file:///components/Logo.tsx). Swapping the placeholder wordmark and flame SVG for the production asset requires modifying only this one component.
4. **Client-Side Image Compression**:
   - Customer payment screenshots are compressed in the browser using HTML5 Canvas (`lib/utils/image.ts`) down to ~200 KB – 600 KB before upload. This saves customer mobile data and ensures fast uploads under the 5 MB Supabase Storage limit.
5. **Zero-Crash Resilience**:
   - If Supabase environment variables are not yet configured during initial preview or build, the app automatically falls back to clean mock data and session storage, enabling flawless builds and local testing.

---

## 🛠️ Step-by-Step Setup Guide

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd "GrillOrder App"
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@emarigrill.com
NEXT_PUBLIC_WHATSAPP_NUMBER=2348000000000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🗄️ Supabase Manual Setup Steps

Follow these 4 steps in your Supabase dashboard:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **New project**.
2. Name it `emari-grill`, choose a secure database password, and pick the closest region.

### Step 2: Run the SQL Schema
1. In your Supabase project dashboard, navigate to the **SQL Editor** tab on the left.
2. Open [`supabase/schema.sql`](file:///supabase/schema.sql) from this repository, copy its entire contents, paste it into the SQL Editor, and click **Run**.
3. This will create:
   - Tables: `products`, `sauces`, `delivery_areas`, `interstate_fees`, `settings`, `orders`, `order_items`
   - Row Level Security (RLS) policies
   - Secure tracking RPC function `get_order_tracking`
   - Private storage bucket `payment_proofs` with RLS
   - Seed data for Half Chicken (₦7,000 / ₦8,000), Full Chicken (₦14,000 / ₦16,000), sauces, and Uyo delivery areas.

### Step 3: Verify the Storage Bucket
1. Go to **Storage** in the left menu.
2. Confirm the bucket `payment_proofs` exists and is marked **Private** with a 5 MB file size limit and image MIME types.

### Step 4: Create the Admin Staff User
1. Go to **Authentication** -> **Users** in the left menu.
2. Click **Add User** -> **Create user**.
3. Enter your staff email (e.g. `admin@emarigrill.com`) and a strong password.
4. Turn on **Auto Confirm User?** so the account is immediately active without waiting for email verification.

---

## 🚀 Vercel Deployment Steps

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public API key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret key
   - `ADMIN_EMAIL`: Your staff email (`admin@emarigrill.com`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: Your business WhatsApp number in international format without leading `+` (e.g. `2348012345678`)
   - `NEXT_PUBLIC_SITE_URL`: Your production Vercel URL (e.g. `https://emarigrill.vercel.app`)
5. Click **Deploy**.

---

## 🖼️ How to Swap Brand Assets

### 1. Logo
Open [`components/Logo.tsx`](file:///components/Logo.tsx). Replace the SVG icon or wordmark with your official logo component or Next.js `Image` tag. Every page (customer header, tracking view, staff portal) will update automatically.

### 2. Product Food Photos
- Photos can be uploaded to a public storage bucket in Supabase and the URL saved in the `products` table (`image_url` column).
- Or place images in `public/images/half-chicken.jpg` and `public/images/full-chicken.jpg` and update `ProductCard.tsx`.

### 3. Business Info, Bank Details & Delivery Areas
- Navigate to `/admin/settings` when logged in as admin to update bank details, WhatsApp hotline, product prices, and Uyo delivery fees without editing any code.

---

## ✅ End-to-End Verification Checklist

- [ ] **Customer Local Order**:
  1. Add 1 Half Chicken with Salad (₦8,000) and 1 Full Chicken with Pepper Sauce (₦16,000).
  2. Click "Order Now" -> Select state "Akwa Ibom" and area "Ewet Housing Estate" (₦2,000).
  3. Total displays ₦26,000. Submit order.
  4. Order code generated (e.g. `IG-4821`).
  5. Click "Copy Account Number" -> verify visible "Copied!" notification.
  6. Click "Upload Payment Screenshot" -> choose an image -> verify client compression and upload -> status changes to "Awaiting Confirmation".
- [ ] **Interstate Manual Fee Flow**:
  1. Add 1 Full Chicken (₦14,000).
  2. Select state "Rivers (Port Harcourt)". Delivery notice shows *"Delivery to your location will be confirmed by Emari Grill before payment."*
  3. Submit order -> status displays `Pending Fee Confirmation` and bank details are hidden.
  4. Admin logs into `/admin`, opens the order, enters delivery fee (e.g. ₦3,500), and saves.
  5. Customer refreshes tracking page -> status advances to `Pending Payment` with total ₦17,500 and bank details unlocked.
- [ ] **Admin Management**:
  1. Visit `/admin/login` and sign in.
  2. Verify Daily Summary cards (Orders Today, Proof Uploaded, Confirmed Sales).
  3. Open order detail -> Click payment proof to zoom full size.
  4. Click "Confirm Payment" -> Order moves to `Payment Confirmed`.
  5. Click "Preparing (Grill)" -> Step advances.
  6. Set ETA (e.g. "45 to 60 mins") -> Customer tracking page shows live ETA.
