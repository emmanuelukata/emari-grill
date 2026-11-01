# Emari Grill: Build Spec

You are a senior full-stack engineer and accessibility-focused product designer. Build, commit, and push a complete web app for **Emari Grill**, a grilled chicken seller based in Uyo, Akwa Ibom, Nigeria. Work autonomously, step by step, and verify each stage runs before moving on. Re-read this file at the start of each stage.

## 1. Goal

A simple, fast, mobile-first ordering app. Customers order chicken, get bank account details, pay outside the app by bank transfer, upload proof of payment, and track the order until delivery. An admin confirms payment, sets the delivery time, and manages everything in an organized way.

The business currently takes orders manually on WhatsApp, with links shared on TikTok, Facebook, and Instagram. The app must feel as easy as a WhatsApp chat: nothing new, nothing strange, no account creation, no friction. Most users are on mid-range Android phones, in-app browsers (TikTok, Facebook, Instagram), and sometimes slow or unstable data connections.

## 2. Tech Stack

- Next.js (App Router) with TypeScript and Tailwind CSS
- Supabase for database, admin auth (email/password), and private file storage for payment proofs
- Deploy target: Vercel
- No payment gateway. Payment is manual bank transfer.
- No heavy libraries. Use native HTML elements where possible.

## 3. Brand and Logo

- Brand name: **Emari Grill**.
- The real logo will be supplied later. Build a placeholder logo in a single file, `components/Logo.tsx`: a clean text wordmark "EMARI GRILL" with a small flame icon in inline SVG. Use it in the header, favicon placeholder, and order pages. Swapping the real logo must require changing only this one component or one image file.
- Colors: charcoal black (#1A1A1A), fire orange, warm gold, and warm off-white. Choose exact shades that pass WCAG contrast (see section 9). Define them as Tailwind theme tokens so the brand can be changed in one place.

## 4. Products and Pricing (Nigerian Naira, show as ₦)

All prices live in the database and are editable by the admin.

**Chicken sizes**

- Half Chicken: ₦7,000, or ₦8,000 with a sauce
- Full Chicken: ₦14,000, or ₦16,000 with a sauce

**Sauce options** (optional, one per chicken)

- Salad (served with cream)
- Pepper sauce

Customers can add multiple items, with quantities, and choose a different sauce per item. Use a simple stepper for quantity (minus, number, plus buttons).

## 5. Delivery (location based)

- Home state: Akwa Ibom. Home city: Uyo.
- Delivery fee is charged **once per order**, not per item, and is the same for half or full chicken.
- Deliveries within Uyo cost between ₦2,000 and ₦3,000 depending on the area, never above ₦3,000. Seed a `delivery_areas` table with sample Uyo areas (for example Ewet Housing, Itam, Ikot Ekpene Road, Shelter Afrique, Osongama) at ₦2,000 to ₦3,000, clearly marked as editable placeholders. The admin will correct the areas and fees in settings.
- Interstate deliveries (for example Rivers State/Port Harcourt, Abia, Anambra) have no fixed fee in the app because the price fluctuates. For any state other than Akwa Ibom:
  1. Do not show a delivery fee at checkout. Show: "Delivery to your location will be confirmed by Emari Grill before payment."
  2. Create the order with status "Pending Fee Confirmation" and hide the bank details and payment upload until the fee is set.
  3. In the admin order detail, let the admin enter the delivery fee for that order. Once saved, the status moves to "Pending Payment" and the customer sees the final total, bank details, and payment upload on the Track Order page.
  4. Show a "Chat on WhatsApp" button on the confirmation page, prefilled with the order code, state, and address, so the admin can discuss the price with the customer.
- The admin may optionally add preset fees per state in settings. If none is set, the manual confirmation flow applies.
- At checkout the customer picks their state first. If Akwa Ibom, they then pick an area from a dropdown and the fee updates live.
- Always show a clear breakdown: items, sauces, delivery fee, total.
- Examples: Half chicken with sauce plus ₦2,000 delivery = ₦10,000. Full chicken with sauce plus ₦2,000 delivery = ₦18,000.

## 6. Customer Flow (keep it short and familiar)

Design the flow like a WhatsApp conversation: one clear step at a time, large buttons, plain language, no jargon.

1. **Home page:** header with logo, one-line tagline, two big product cards (Half Chicken, Full Chicken) each with photo placeholder, price, sauce selector, quantity stepper, and "Add to order". A sticky bottom bar shows the item count, running total, and a big "Order Now" button.
2. **Checkout** (single page, minimal fields): full name, phone number, state, area (if Akwa Ibom), delivery address, optional note. Show a compact order summary and the total. Phone input must open the numeric keypad and accept Nigerian formats (080..., +234...).
3. **Confirmation:** generate a short order code (example: IG-4821). Show the exact amount to pay, plus the bank details (bank name, account name, account number) with a large "Copy account number" button that confirms with a visible message. Also show "Chat on WhatsApp".
4. **Payment proof:** simple upload button ("Upload payment screenshot"), camera or gallery, with image preview, client-side image compression before upload, and a clear success message. Status becomes "Awaiting Confirmation".
5. **Track Order page:** customer enters order code and phone number to see live status, with a simple progress stepper and the estimated delivery time once the admin sets it. Also provide a link on the confirmation page that opens tracking directly.

No customer account, no login, no email required.

**Order statuses:** Pending Fee Confirmation (interstate only), Pending Payment, Awaiting Confirmation, Payment Confirmed, Preparing, Out for Delivery, Delivered, Cancelled.

## 7. Admin (`/admin`, protected by Supabase email/password login)

Keep it organized and fast, usable on a phone.

- Orders list with status filters, search by order code or phone, and newest first. Highlight orders needing action (Awaiting Confirmation, Pending Fee Confirmation).
- Order detail: customer info, items with sauces, delivery location and fee, total, payment proof image (viewable full size).
- Actions: Confirm Payment, Reject Payment (with reason), advance the status step by step, set the delivery fee for interstate orders, set the estimated delivery time (example: "45 to 60 minutes").
- "Chat on WhatsApp" button opening wa.me to the customer with a prefilled message including the order code.
- Settings: bank details, product prices, sauce options, home state, delivery areas with fees, optional interstate fees, business name, WhatsApp number.
- Simple daily summary at the top: orders today, awaiting confirmation, total confirmed sales.

## 8. Database (Supabase)

Tables: `orders`, `order_items`, `products`, `sauces`, `delivery_areas`, `interstate_fees`, `settings`.

- Row Level Security: customers can only create orders and read their own order by code plus phone; only the authenticated admin can read all orders and edit settings.
- Create a private storage bucket for payment proofs with size and type limits (images only, max 5 MB).
- Seed products, sauces, and sample delivery areas.
- Provide everything as one SQL file in the repo (`supabase/schema.sql`).

## 9. UI, UX, and Accessibility (top priority)

### Visual design

- Top-notch but simple: clean layout, generous spacing, warm appetizing look, rounded cards, one primary action per screen. Charcoal black with fire orange and gold accents on a warm off-white background. Consistent type scale, one font family (system font stack or a single lightweight web font with `font-display: swap`).
- Nothing strange or unfamiliar: use patterns Nigerian users already know from WhatsApp and Instagram (big buttons, simple steppers, clear labels, familiar icons with text labels).
- Subtle, quick micro-interactions only. Respect `prefers-reduced-motion`.

### WCAG 2.2 AA compliance (required)

- Text contrast at least 4.5:1 (3:1 for large text and UI components). Test all brand color combinations, especially orange on white, and adjust shades to pass.
- Never rely on color alone: status uses icon plus text label.
- Touch targets at least 44 by 44 px, with spacing between them. Buttons and inputs must be easy to tap one-handed.
- Fully keyboard accessible with a visible, high-contrast focus indicator and logical tab order. Include a "Skip to content" link.
- Semantic HTML: proper landmarks (header, main, nav, footer), a single h1 per page, ordered headings, real buttons and links.
- Every form input has a visible label (not placeholder only), correct input types and autocomplete attributes, inline error messages linked with `aria-describedby`, and an error summary announced via `aria-live`. Errors must say how to fix the problem in plain language.
- Alt text for meaningful images, empty alt for decorative ones. `aria-label` on icon-only buttons (but prefer visible text).
- Status changes (item added, copied, uploaded, payment confirmed) announced to screen readers with `aria-live` regions.
- Support zoom to 200% and text resize without loss of content or horizontal scrolling. Use relative units. Body text at least 16px.
- Language attribute set (`lang="en"`), meaningful page titles, and no timeouts that lose the customer's data. Persist the cart in localStorage.
- Run an accessibility check (axe or Lighthouse) and fix all issues before the final push.

### Performance and lightness (critical for Nigerian mobile data)

- Mobile-first, target Lighthouse Performance 90+ and total page weight under 300 KB on first load where possible.
- Optimize and lazy-load images with `next/image`, use modern formats, and compress uploads on the client. Minimal JavaScript, server components by default, no large UI libraries.
- Works well inside TikTok, Facebook, and Instagram in-app browsers. No reliance on features those browsers block. Avoid popups and new-tab behavior that breaks in in-app browsers.
- Graceful handling of slow or dropped connections: loading states, retry on failed upload, and clear offline messages.
- Add Open Graph and Twitter meta tags with a placeholder share image so links look great when shared on social platforms and WhatsApp. Make it installable as a lightweight PWA (manifest and icons, no heavy offline caching).

### Copy and tone

- Plain, friendly, short English. Use Nigerian context naturally (₦, "delivery", "transfer"). Buttons say exactly what they do ("Order Now", "I have paid", "Upload payment screenshot").

## 10. Git and Deployment Workflow

1. Initialize git with a clean `.gitignore` (node\_modules, .env.local, .next).
2. Create `.env.example` listing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`. Never commit real secrets.
3. Make small commits per feature with clear messages (`feat:`, `fix:`, `chore:`).
4. Create the GitHub repo (or use the one I connect) and push `main`.
5. Write a README covering setup, the Supabase SQL file, how to swap the logo, and Vercel deployment steps.
6. Stop and tell me exactly which environment variables to add in Vercel, and which Supabase steps I must do manually (create the project, run the SQL, create the storage bucket, create the admin user).
7. After I connect the repo to Vercel, help me verify the production build and test the full flow end to end: place an order, upload proof, admin confirms, status tracking, and an interstate order with a manual fee.
8. Finish with a short checklist of what I need to replace: real logo, food photos, delivery areas and fees, bank details, and WhatsApp number.

## 11. Rules

- Keep the code simple, readable, and well structured. No unnecessary libraries.
- Validate all forms on both client and server, and handle errors with friendly messages.
- Run the build, lint, and type checks and fix all errors before each push.
- Ask me only when blocked. Otherwise make sensible decisions and document them in the README.
