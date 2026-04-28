# SmartResidence CY

SmartResidence CY is an academic MERN smart-residence platform built from the existing repository and migrated away from the original store domain. It now focuses on connected devices, zones, services, dashboards, approval workflows, logs, reports, points, levels, and role-based access.

## Modules
- `Information`: landing page, free tour, public announcements, public search with visible filters, sign-up.
- `Visualisation`: member dashboard, profile, members list, devices browsing, services browsing, activity visibility.
- `Gestion`: device creation, activation/deactivation, deletion requests, telemetry/statistics consultation, maintenance visibility.
- `Administration`: registration approval, user updates, categories, logs, requests review, platform settings, CSV export.

## User Types And Progression
- `visiteur`: public, not authenticated.
- `simple`: approved and verified member.
- `complexe`: unlocked automatically at level `avance` or set manually.
- `administrateur`: unlocked automatically at level `expert` or set manually.

Default progression rules:
- Login: `+0.25` point
- Device/service consultation: `+0.50` point
- Gestion actions: additional configurable gains

Thresholds:
- `debutant`: `0+`
- `intermediaire`: `3+`
- `avance`: `7+`
- `expert`: `12+`

## Local Environment

Create a local `.env` from `.env.example`:

```bash
cp .env.example .env
```

Example values:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartresidence-cy
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_a_second_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
EMAIL_VERIFICATION_CODE_TTL_MINUTES=15
EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=60
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

SMTP example:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-account@example.com
SMTP_PASS=your-app-password
SMTP_FROM="SmartResidence CY <your-account@example.com>"
```

## Install

Root backend dependencies:

```bash
npm install
```

This now installs `nodemailer`, which is used for real SMTP delivery of verification codes.

Frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Run

Backend:

```bash
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Seed Demo Data

```bash
npm run seed
```

Seeded accounts:
- Admin Saad: `saad.admin@smartresidence.cy` / `Admin123!`
- Simple member Mehdi: `mehdi@smartresidence.cy` / `Member123!`
- Complexe member Saad: `saad@smartresidence.cy` / `Member123!`

## Verification Code Delivery

This project supports two delivery modes for email verification:

### SMTP mode
- If `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are configured, SmartResidence CY sends a real email using Nodemailer.
- The email contains a 6-digit verification code with expiration information.
- The frontend does not display the raw code in this mode.

### Demo fallback mode
- If SMTP is not configured, the backend logs the code in the server console and returns it in the API response under `demoVerification`.
- The frontend then displays that code in a local demo panel.

In both cases:
- Sign-up generates a 6-digit code and a fallback token
- The verification page accepts `email + code`
- A resend endpoint can generate a fresh code
- The legacy token URL remains available as a fallback such as `/verify-email?token=...`
- After email verification, an administrator still needs to approve the registration request from the administration module

This avoids requiring a real SMTP provider for the academic demo.

## How To Test Real Email Sending

1. Add valid SMTP credentials to `.env`.
2. Run:

```bash
npm install
cd frontend && npm install && cd ..
```

3. Start the backend and frontend.
4. Create a new account from `/signup`.
5. If SMTP is working:
   - the signup page will say that a verification code has been sent to the email address
   - no raw demo code will be shown
6. Open your mailbox and copy the 6-digit code.
7. Go to `/verify-email`, enter the email and code, then submit.
8. If you do not receive the email, use `Renvoyer un code`.

If SMTP is not configured, the project automatically falls back to local demo mode.

## Main API Areas
- `GET /api/public/overview`
- `GET /api/public/announcements`
- `GET /api/public/search`
- `POST /api/auth/signup`
- `GET|POST /api/auth/verify-email`
- `POST /api/auth/verify-email-code`
- `POST /api/auth/resend-verification-code`
- `POST /api/auth/login`
- `GET /api/members/me/dashboard`
- `GET /api/devices`
- `GET /api/services`
- `GET /api/reports/overview`
- `GET /api/reports/export.csv`
- `GET /api/admin/dashboard`

## Notes
- `SMARTRESIDENCE_PLAN.md` summarizes the migration strategy.
- `.env.example` is included for local setup.
- The project keeps the original MERN architecture while replacing the business domain with a smart-building / smart-residence platform.
