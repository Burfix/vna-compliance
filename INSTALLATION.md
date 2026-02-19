# Installation & Verification Guide

## Step-by-Step Setup

Follow these exact steps to get the Operational Compliance Engine running locally.

---

## ✅ Step 1: Verify Prerequisites

Make sure you have:
- **Node.js 18+**: `node --version`
- **npm**: `npm --version`
- **PostgreSQL 14+**: `psql --version`

---

## ✅ Step 2: Install Dependencies

```bash
cd /Users/Thami/Desktop/WCTV2
npm install
```

**Expected output:**
```
added XXX packages in XXs
```

---

## ✅ Step 3: Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Generate AUTH_SECRET
openssl rand -base64 32
```

**Edit `.env` and add:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/compliance_engine"
AUTH_SECRET="paste-generated-secret-here"
DEMO_MODE=true
```

---

## ✅ Step 4: Create Database

```bash
# Option 1: Using createdb command
createdb compliance_engine

# Option 2: Using psql
psql postgres
CREATE DATABASE compliance_engine;
\q
```

**Verify:**
```bash
psql -l | grep compliance_engine
```

---

## ✅ Step 5: Setup Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate
```

**When prompted for migration name, enter:** `init`

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "compliance_engine" at "localhost:5432"

✔ Enter a name for the new migration: … init
Applying migration `20260219000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260219000000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.1.0) to ./node_modules/@prisma/client
```

---

## ✅ Step 6: Seed Database

```bash
npm run db:seed
```

**Expected output:**
```
🌱 Seeding database...
✅ Created users: { manager: 'manager@demo.com', officer: 'officer@demo.com' }
✅ Created stores: { store1: 'Downtown Food & Beverage', store2: 'Main Street Retail' }
✅ Created audit template: Standard Compliance Audit
🎉 Seeding completed!
```

---

## ✅ Step 7: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.1.0
- Local:        http://localhost:3000

✓ Starting...
✓ Ready in XXXms
```

---

## ✅ Step 8: Verify Installation

Open your browser and test each step:

### 8.1 Health Check API
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"ok":true,"status":"healthy","timestamp":"2026-02-19T..."}
```

### 8.2 Seed API
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
  "counts": {...}
}
```

### 8.3 Landing Page
**Navigate to:** http://localhost:3000

**Verify:**
- Page loads without errors
- Demo login buttons visible
- No console errors

### 8.4 Login as Manager
**From landing page:**
- Click "Login as Manager (ADMIN)"
- Should redirect to http://localhost:3000/dashboard
- Header shows "ADMIN" badge

### 8.5 Create Audit
**From dashboard:**
1. Click "Start New Audit"
2. Select a store
3. Select a template
4. Click "Create Draft Audit"
5. Should redirect to audit detail page
6. Status shows "DRAFT"

### 8.6 Submit Audit
**From audit detail page:**
1. Click "Submit Audit"
2. Status changes to "SUBMITTED"
3. Button disappears

---

## ✅ Step 9: Run TypeCheck

```bash
npm run typecheck
```

**Expected output:**
```
No errors found
```

---

## ✅ Step 10: Run Build

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB        XXX kB
├ ○ /_not-found                          XXX kB        XXX kB
├ ○ /api/admin/seed                      0 B                0 B
├ ○ /api/auth/[...nextauth]              0 B                0 B
├ ○ /api/health                          0 B                0 B
├ λ /audits/[id]                         XXX kB        XXX kB
├ λ /audits/new                          XXX kB        XXX kB
├ λ /dashboard                           XXX kB        XXX kB
└ ○ /login                               XXX kB        XXX kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand
```

---

## 🎯 Success Criteria

Your installation is successful if:

- ✅ `npm run dev` starts without errors
- ✅ `curl http://localhost:3000/api/health` returns ok: true
- ✅ Landing page loads in browser
- ✅ Demo login works (redirects to dashboard)
- ✅ Dashboard shows correct role badge
- ✅ Can create and submit audits
- ✅ `npm run typecheck` passes
- ✅ `npm run build` completes successfully

---

## 🐛 Troubleshooting Common Issues

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Verify database exists
psql -l | grep compliance_engine

# Test connection
psql compliance_engine -c "SELECT 1"
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npm run db:generate
```

### Issue: "Migration failed"

**Solution:**
```bash
# Reset database
npm run db:migrate -- --reset

# Re-run migration
npm run db:migrate

# Re-seed
npm run db:seed
```

### Issue: "Module not found"

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### Issue: "Auth redirect loop"

**Solution:**
```bash
# Ensure AUTH_SECRET is set in .env
grep AUTH_SECRET .env

# Restart dev server
# (Ctrl+C and npm run dev again)
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

---

## 🔍 Database Inspection

### View all users
```bash
psql compliance_engine -c "SELECT email, role, active FROM users;"
```

### View all stores
```bash
psql compliance_engine -c "SELECT name, unit_number, store_type FROM stores;"
```

### View all audits
```bash
psql compliance_engine -c "SELECT id, status, audit_date FROM audits;"
```

### Count records
```bash
psql compliance_engine -c "
  SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM stores) as stores,
    (SELECT COUNT(*) FROM audit_templates) as templates,
    (SELECT COUNT(*) FROM audits) as audits;
"
```

---

## 📊 Performance Benchmarks

After successful installation, you should see:

- **Page load times:**
  - Landing: < 1s
  - Dashboard: < 2s
  - Audit pages: < 1s

- **Build time:** < 1 minute
- **TypeCheck time:** < 10 seconds

---

## 🚀 Next Steps

After successful installation:

1. **Read documentation:**
   - [DEMO-SETUP.md](./DEMO-SETUP.md) - Complete setup guide
   - [SMOKE-TESTS.md](./SMOKE-TESTS.md) - Testing procedures
   - [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Quick reference

2. **Test the application:**
   - Follow the click path in SMOKE-TESTS.md
   - Create multiple audits
   - Test both user roles

3. **Explore the code:**
   - Review Prisma schema
   - Check NextAuth configuration
   - Examine server actions

4. **Customize (optional):**
   - Add more demo data
   - Customize UI styling
   - Add additional features

---

## 📞 Support Checklist

Before asking for help, verify:

- [ ] Node.js version is 18+
- [ ] PostgreSQL is running
- [ ] Database exists and is accessible
- [ ] `.env` file exists with correct values
- [ ] `npm install` completed without errors
- [ ] `npm run db:generate` completed
- [ ] `npm run db:migrate` completed
- [ ] `npm run db:seed` completed
- [ ] No firewall blocking port 3000
- [ ] Browser console shows no errors

---

**Version:** 0.1.0  
**Last Updated:** February 19, 2026  
**Installation Time:** ~5-10 minutes
