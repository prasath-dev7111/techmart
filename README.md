# TechMart — Gaming eCommerce Platform

Full-stack eCommerce for gaming gear with role-based auth, a gaming-inspired user landing page, and a comprehensive admin dashboard.

## What's New

### 1. User Landing Page (landing.html)
Gaming-inspired dark theme UI matching the design reference:
- Hero banner with animated floating product visuals
- Shop by Categories (Keyboard, Mouse, Headphones, Controllers)
- Featured Products with tab filtering
- Weekly Deals with live countdown timer
- Best Sellers, Brand showcase, Testimonials
- Newsletter subscription
- Shopping cart sidebar with qty control + wishlist
- Fully responsive — mobile + desktop
- Dark / Light mode toggle

### 2. Updated Login Page (index.html)
- Role cards: User or Admin with visual selection
- Integrated Sign Up tab with role selector
- Password strength meter
- Demo credentials auto-fill on role click
- Redirect: Admin → dashboard.html, User → landing.html

### 3. User Dashboard (user-dashboard.html)
- User-only protected route
- Overview stats, My Orders, Wishlist, Profile, Security

### 4. Admin Pages (all existing)
- requireAdmin() protection — non-admins redirected to landing
- Dark/Light toggle in topbar
- "View Store" link in sidebar

### 5. Protected Routes
| Page | Access |
|------|--------|
| landing.html | Public |
| index.html | Public |
| user-dashboard.html | User only |
| dashboard.html + all admin pages | Admin only |

### 6. Theme (Dark/Light)
Saved to localStorage, available on all pages.

## Setup
```bash
cd backend && npm install
cp .env.example .env   # add MONGO_URI + JWT_SECRET
npm run dev
```
Open frontend/pages/landing.html in browser.

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| User | user@techmart.com | User@123 |
| Admin | admin@techmart.com | Admin@123 |

Create these via the Sign Up form (role-based registration supported).
