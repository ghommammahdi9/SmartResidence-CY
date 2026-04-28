# SmartResidence CY Migration Plan

## Reused
- Existing MERN architecture with `backend/server.js`, Express, Mongoose, React, Vite, Zustand, and Tailwind.
- Cookie-based JWT authentication pattern and profile/session flow.
- Generic dashboard/page/card/table patterns from the frontend structure.

## Removed or Neutralized
- Store-specific concepts: cart, checkout, coupon, payment, order, price, discount, and shop wording.
- External service assumptions that are not needed for a local academic demo: Redis, Stripe, Cloudinary.

## Main Domain Mapping
- `Product` concept -> `ConnectedDevice`
- `Category` concept -> `DeviceCategory` / `ServiceCategory`
- `Analytics` concept -> residence reports, telemetry, access logs, action logs
- Admin dashboard -> SmartResidence CY administration module

## Implementation Steps
1. Replace active backend routes with SmartResidence domain APIs.
2. Extend auth with signup request, email verification, approval workflow, points, levels, and role progression.
3. Add database models for zones, devices, telemetry, services, announcements, logs, requests, and settings.
4. Build public, member, gestion, and administration frontend modules with clear role-based navigation.
5. Seed the database with realistic demo content and document the full local setup in `README.md`.
