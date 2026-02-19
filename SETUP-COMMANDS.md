# 🎯 Exact Setup Commands

Copy and paste these commands in order to get your Operational Compliance Engine running.

---

## Prerequisites Check

```bash
# Verify Node.js (should be 18+)
node --version

# Verify npm
npm --version

# Verify PostgreSQL
psql --version
```

---

## Installation (Copy & Paste)

```bash
# 1. Navigate to project
cd /Users/Thami/Desktop/WCTV2

# 2. Create .env file
cp .env.example .env

# 3. Generate AUTH_SECRET and save it
openssl rand -base64 32

# 4. Edit .env (use your favorite editor)
# Set DATABASE_URL, DIRECT_URL, and paste the NEXTAUTH_SECRET from step 3
# For local Postgres, DATABASE_URL and DIRECT_URL can be the same
nano .env
# or
code .env

# 5. Create PostgreSQL database
createdb compliance_engine

# 6. Install dependencies
npm install

# 7. Verify environment configuration
npm run verify:env

# 8. Generate Prisma Client
npm run db:generate

# 9. Run migrations (enter "init" when prompted)
npm run db:migrate

# 10. Verify database connection
npm run verify:db

# 11. Seed database
npm run db:seed

# 12. Start development server
npm run dev
```

---

## Quick Verification

```bash
# In a new terminal, run these tests:

# Test 1: Environment validation
npm run verify:env

# Test 2: Database verification
npm run verify:db

# Test 3: Health check
curl http://localhost:3000/api/health

# Test 4: Seed endpoint
curl http://localhost:3000/api/admin/seed

# Test 5: Open in browser
open http://localhost:3000
```

---

## Build & Deploy Check

```bash
# TypeScript check
npm run typecheck

# Production build
npm run build

# Start production server
npm run start
```

---

## Complete Flow Test (Click Path)

1. Open: http://localhost:3000
2. Click: "Login as Manager (ADMIN)"
3. Click: "Start New Audit"
4. Select store and template
5. Click: "Create Draft Audit"
6. Click: "Submit Audit"
7. Verify status changes to "SUBMITTED"

---

## Database Commands

```bash
# View users
psql compliance_engine -c "SELECT email, role FROM users;"

# View stores
psql compliance_engine -c "SELECT name, store_type FROM stores;"

# View audits
psql compliance_engine -c "SELECT id, status FROM audits;"

# Reset database (if needed)
npm run db:migrate -- --reset
npm run db:seed
```

---

## Troubleshooting Commands

```bash
# If "Module not found"
rm -rf node_modules package-lock.json
npm install
npm run db:generate

# If "Port 3000 in use"
lsof -ti:3000 | xargs kill

# If database connection fails
psql -l | grep compliance_engine
```

---

## All Done! 🎉

Your app should now be running at:
- **Development:** http://localhost:3000
- **Health API:** http://localhost:3000/api/health
- **Seed API:** http://localhost:3000/api/admin/seed

**Demo Users:**
- manager@demo.com (ADMIN)
- officer@demo.com (OFFICER)

**Documentation:**
- [README.md](./README.md) - Overview
- [INSTALLATION.md](./INSTALLATION.md) - Detailed installation
- [DEMO-SETUP.md](./DEMO-SETUP.md) - Complete setup guide
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Quick reference
- [SMOKE-TESTS.md](./SMOKE-TESTS.md) - Testing guide
