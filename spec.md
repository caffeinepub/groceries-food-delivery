# Specification

## Summary
**Goal:** Build a full-featured grocery delivery app called "Quick-Groceries" with product catalog, cart, checkout, order management, promo codes, delivery settings, and an admin dashboard.

**Planned changes:**
- Backend: single Motoko actor with CRUD for products (name, price, category, description, image, stock, discount), categories, and stock management
- Backend: order management with item list, delivery address, payment method, and status (Pending, Confirmed, Delivered)
- Backend: configurable delivery settings (fee, free delivery threshold, toggle)
- Backend: promo/discount coupon support (percentage or fixed, min order, usage limit, expiry, validate function)
- Backend: time-limited promotional offers (title, description, discount %, start/end dates)
- Backend: payment records linked to orders with status (pending, paid, failed)
- Backend: user profile store (display name keyed by Internet Identity principal)
- Frontend: homepage with hero banner (using generated image), tagline, "Shop Now" CTA, feature highlights, category quick-links, and featured products grid (up to 8, with loading skeletons)
- Frontend: product listing page with real-time search bar, category filter badges, product cards (image, name, price, discount badge, Add to Cart), and out-of-stock handling
- Frontend: slide-over shopping cart panel with quantity controls, subtotal, delivery charge, free delivery threshold message, and sessionStorage persistence
- Frontend: checkout page with delivery address input, payment method selector, promo code field, order summary (subtotal, delivery, discount, total), and active promotional offers display
- Frontend: order success confirmation page with order ID, itemized list, full pricing breakdown, and payment status
- Frontend: order history page for authenticated users with collapsible order cards sorted newest first
- Frontend: admin dashboard with tabs for Products (CRUD + stock toggle), Orders (status update), Payments (status update), Offers (promotional offers, promo codes, delivery settings), and a "Seed Demo Data" button
- Frontend: green-dominant color palette with warm accents, sticky navbar (logo, search, nav links, cart badge, login/logout), consistent card styles, light/dark mode support
- Frontend: use generated hero banner image and app logo as static assets; all prices formatted in INR

**User-visible outcome:** Users can browse groceries, add items to a cart, apply promo codes, place orders with delivery details, and view order history. Admins can manage products, orders, payments, offers, and delivery settings through a dedicated dashboard.
