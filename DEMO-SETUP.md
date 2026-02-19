# Operational Compliance Engine - Demo Setup Guide

## Overview

A minimal SaaS spine for audit and compliance management built with:
- **Next.js 15** (App Router)
- **NextAuth v5** (Credentials provider with demo mode)
- **Prisma** + PostgreSQL
- **TypeScript** + Zod validation
- **Tailwind CSS**

---

## Prerequisites

- Node.js 18+ (with npm)
- PostgreSQL 14+ running locally or accessible
- Git (optional)

---

## Step 1: Environment Setup

1. **Clone or navigate to project directory:**
   ```bash
   cd /Users/Thami/Desktop/WCTV2
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your values:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/compliance_engine"
   AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
   DEMO_MODE=true
   ```

   **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Create PostgreSQL database:**
   ```bash
   # Using psql
   createdb compliance_engine

   # Or connect to PostgreSQL and run:
   # CREATE DATABASE compliance_engine;
   ```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Database Setup

1. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```
   
   When prompted for migration name, enter: `init`

3. **Seed the database:**
   ```bash
   npm run db:seed
   ```

   This creates:
   - 2 demo users (manager@demo.com, officer@demo.com)
   - 2 stores (1 FB, 1 RETAIL)
   - 1 audit template

---

## Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Step 5: Verify Installation

### A. Health Check (API)

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-02-19T..."
}
```

### B. Seed Endpoint (API)

```bash
curl http://localhost:3000/api/admin/seed
```

**Expected response:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "created": {
    "users": ["manager@demo.com", "officer@demo.com"],
    "stores": ["Downtown Food & Beverage", "Main Street Retail"],
    "templates": ["Standard Compliance Audit"]
  },
  "counts": {
    "users": 2,
    "stores": 2,
    "templates": 1,
    "audits": 0
  }
}
```

---

## Step 6: Manual Testing (Click Path)

### Scenario 1: Manager Login Flow

1. **Navigate to:** http://localhost:3000
2. **Click:** "Login as Manager (ADMIN)" button (demo mode)
3. **Expected:** Redirects to `/dashboard`
4. **Verify:**
   - Header shows "ADMIN" badge
   - Stats cards show counts (0 audits initially)
   - "Start New Audit" button visible
   - "Seed Database" button visible (ADMIN only)

### Scenario 2: Start Audit Flow (as Manager)

1. **From dashboard, click:** "Start New Audit"
2. **Expected:** `/audits/new` page loads
3. **Select:**
   - Store: "Downtown Food & Beverage (FB-101) - FB"
   - Template: "Standard Compliance Audit"
4. **Click:** "Create Draft Audit"
5. **Expected:** Redirects to `/audits/[id]` page
6. **Verify:**
   - Status shows "DRAFT" (yellow badge)
   - Store and template info displayed
   - "Submit Audit" button visible

### Scenario 3: Submit Audit

1. **From audit detail page, click:** "Submit Audit"
2. **Expected:** Page reloads
3. **Verify:**
   - Status changes to "SUBMITTED" (green badge)
   - Submit button disappears
   - Green success message appears

### Scenario 4: Officer Login Flow

1. **Logout** from manager account
2. **Navigate to:** http://localhost:3000
3. **Click:** "Login as Officer (AUDITOR)" button
4. **Expected:** Redirects to `/dashboard`
5. **Verify:**
   - Header shows "OFFICER" badge
   - "Seed Database" button NOT visible (OFFICER role)
   - Can create audits via "Start New Audit"

### Scenario 5: Manual Login (Alternative)

1. **Navigate to:** http://localhost:3000/login
2. **Enter:**
   - Email: `manager@demo.com`
   - Password: (leave blank in demo mode)
3. **Click:** "Sign In"
4. **Expected:** Redirects to `/dashboard`

---

## User Roles & Permissions

### ADMIN (manager@demo.com)
- ✅ View dashboard
- ✅ Create audits
- ✅ Submit audits
- ✅ Access seed endpoint

### OFFICER (officer@demo.com)
- ✅ View dashboard
- ✅ Create audits
- ✅ Submit audits
- ❌ Cannot access seed endpoint

---

## Project Structure

```
WCTV2/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── health/route.ts
│   │   │   └── admin/seed/route.ts
│   │   ├── audits/
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   ├── new/NewAuditForm.tsx
│   │   │   └── actions.ts     # Server actions
│   │   ├── dashboard/page.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   └── requireRole.ts     # Auth guards
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth types
│   └── auth.ts                # NextAuth config
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

---

## Available Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

---

## Validation & Build

### TypeScript Check
```bash
npm run typecheck
```
**Expected:** No errors

### Linting
```bash
npm run lint
```
**Expected:** No errors

### Production Build
```bash
npm run build
```
**Expected:** Build completes successfully

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution:** 
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb compliance_engine`

### Issue: "Auth session not found"
**Solution:**
- Ensure `AUTH_SECRET` is set in `.env`
- Clear browser cookies/localStorage
- Restart dev server

### Issue: "No stores/templates available"
**Solution:**
- Run seed script: `npm run db:seed`
- Or visit: http://localhost:3000/api/admin/seed

### Issue: "Redirect loop on login"
**Solution:**
- This should NOT happen with current implementation
- Check that `requireUser()` in pages correctly redirects to `/login`
- Verify NextAuth pages config points to `/login`

---

## Demo Data

### Users
| Email                 | Role    | Password (demo) |
|-----------------------|---------|-----------------|
| manager@demo.com      | ADMIN   | (none)          |
| officer@demo.com      | OFFICER | (none)          |

### Stores
| Name                        | Unit Number | Type   |
|-----------------------------|-------------|--------|
| Downtown Food & Beverage    | FB-101      | FB     |
| Main Street Retail          | RT-201      | RETAIL |

### Templates
| Name                          | Description                              |
|-------------------------------|------------------------------------------|
| Standard Compliance Audit     | General operational compliance checklist |

---

## Security Notes

- **DEMO_MODE** should be `false` in production
- **AUTH_SECRET** must be strong and unique
- **Database credentials** should be secured
- Demo users have **no passwords** when `DEMO_MODE=true`

---

## Next Steps (Future Features)

These are intentionally NOT included in this minimal version:
- ❌ Audit questions/checklist items
- ❌ File uploads
- ❌ PDF reports
- ❌ Analytics dashboard
- ❌ Email notifications
- ❌ User management UI
- ❌ Multi-tenant support

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in terminal
3. Verify environment variables
4. Check database connection

---

**Last Updated:** February 19, 2026
**Version:** 0.1.0
