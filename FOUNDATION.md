# 🧱 Foundation Architecture: Local Postgres → Nile Migration Path

## Overview

This project is built with a **provider-agnostic database architecture** that ensures:
- ✅ Reliable local development with PostgreSQL
- ✅ Clear separation between database failures and auth failures
- ✅ Fail-fast environment validation at startup
- ✅ Zero-code migration path to Nile (or any other provider)

---

## 🎯 Core Principles

### 1. Database Failures ≠ Auth Failures

**Problem:** Silent database failures can manifest as authentication loops.

**Solution:**
- Health endpoint (`/api/health`) is the source of truth for database connectivity
- Environment validation runs at startup
- Auth debugging begins ONLY after database verification passes

### 2. Fail-Fast Environment Validation

**Problem:** Missing environment variables cause cryptic runtime errors.

**Solution:**
- All required env vars validated with Zod at startup
- Clear error messages with exact variable names
- No silent defaults or fallbacks

### 3. Provider-Agnostic Database Setup

**Problem:** Hard-coding for a specific provider makes migration difficult.

**Solution:**
- Prisma uses both `DATABASE_URL` (runtime) and `DIRECT_URL` (migrations)
- Local Postgres: both URLs are identical
- Nile/Pooled: separate URLs for pooling and migrations
- Migration requires only environment variable changes

---

## 🔧 Environment Variables

### Required Variables

```bash
# Database URLs
DATABASE_URL="postgresql://user:password@localhost:5432/compliance_engine"
DIRECT_URL="postgresql://user:password@localhost:5432/compliance_engine"

# Authentication
NEXTAUTH_SECRET="generated-secret-here"

# Feature Flags
DEMO_MODE=true

# Node Environment
NODE_ENV=development
```

### Variable Purposes

| Variable | Purpose | Local Value | Nile Value |
|----------|---------|-------------|------------|
| `DATABASE_URL` | Runtime queries (may be pooled) | Direct connection | Pooled connection |
| `DIRECT_URL` | Migrations (must be direct) | Direct connection | Direct connection |
| `NEXTAUTH_SECRET` | Session encryption | Any secure string | Any secure string |
| `DEMO_MODE` | Enable demo features | `true` | `false` |
| `NODE_ENV` | Environment type | `development` | `production` |

---

## 🚦 Startup Validation Flow

```
Application Start
    ↓
src/lib/env.ts validates environment
    ↓
All required vars present?
    ├─ YES → Continue startup
    └─ NO  → Show clear error, exit immediately
              (No silent failures!)
    ↓
Application runs
```

### Example Error Output

```
❌ Environment validation failed:

  • DATABASE_URL: Required
  • NEXTAUTH_SECRET: Required

💡 Check your .env file and ensure all required variables are set.
   See .env.example for reference.
```

---

## 🏥 Health Endpoint (Source of Truth)

### Endpoint: `GET /api/health`

**Success Response (200):**
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-02-19T12:00:00.000Z",
  "db": {
    "ok": true,
    "latencyMs": 4
  },
  "env": {
    "nodeEnv": "development",
    "demoMode": true
  }
}
```

**Failure Response (503):**
```json
{
  "ok": false,
  "status": "unhealthy",
  "timestamp": "2026-02-19T12:00:00.000Z",
  "db": {
    "ok": false,
    "latencyMs": 5002,
    "error": "Connection timeout"
  }
}
```

### Using Health Check

```bash
# Quick check
curl http://localhost:3000/api/health

# Automated monitoring
curl -f http://localhost:3000/api/health || echo "⚠️ Service unhealthy!"
```

---

## 🔍 Pre-Auth Debugging Protocol

**ALWAYS verify in this order:**

### Step 1: Environment Validation
```bash
npm run verify:env
```

Expected output:
```
✅ Environment validation passed!

📋 Configuration:
   • Node Environment: development
   • Demo Mode: ENABLED
   • Database URL: ✓ SET
   • Direct URL: ✓ SET
   • NextAuth Secret: ✓ SET
```

### Step 2: Database Verification
```bash
npm run verify:db
```

Expected output:
```
Test 1: Basic connectivity...
✅ Connected successfully (12ms)

Test 2: Checking database schema...
✅ All required tables exist

Test 3: Checking seed data...
   • Users: 2
   • Stores: 2
   • Templates: 1
✅ Seed data detected
```

### Step 3: Health Endpoint Check
```bash
curl http://localhost:3000/api/health
```

Expected: `"ok": true`

### Step 4: ONLY NOW Debug Auth

If all above pass and auth still fails:
- Check session cookies
- Verify NEXTAUTH_SECRET hasn't changed
- Check browser console for errors
- Review NextAuth logs

**If database fails, STOP. Fix database first.**

---

## 🗄️ Prisma Configuration

### Schema Setup (Provider-Agnostic)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Local Postgres Setup

```bash
# Both URLs are identical
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
DIRECT_URL="postgresql://user:pass@localhost:5432/db"
```

### Nile Migration (Future)

```bash
# Different URLs for pooling vs migrations
DATABASE_URL="postgresql://pooler.nile.com/db?sslmode=require"
DIRECT_URL="postgresql://direct.nile.com/db?sslmode=require"
```

**No code changes required!**

---

## 🛠️ Verification Scripts

### verify:env - Environment Validation

**Purpose:** Validate all required environment variables

**Command:**
```bash
npm run verify:env
```

**What it checks:**
- All required variables are set
- Types are correct (booleans, URLs, etc.)
- Warns if DEMO_MODE is enabled

**When to run:**
- After creating/updating `.env`
- Before first startup
- After deployment
- When debugging environment issues

---

### verify:db - Database Verification

**Purpose:** Verify database connectivity and schema

**Command:**
```bash
npm run verify:db
```

**What it checks:**
1. Database connection (latency measurement)
2. Required tables exist (users, stores, audit_templates, audits)
3. Seed data present (warns if empty)

**When to run:**
- After database setup
- After migrations
- Before debugging auth issues
- After changing DATABASE_URL

---

### verify:all - Complete Verification

**Purpose:** Run all verification checks

**Command:**
```bash
npm run verify:all
```

**Runs:**
1. Environment validation
2. Database verification

**When to run:**
- After initial setup
- Before deployment
- After any configuration changes

---

## 🚀 Migration Path to Nile

### Current State (Local Postgres)

```bash
# .env
DATABASE_URL="postgresql://localhost:5432/compliance_engine"
DIRECT_URL="postgresql://localhost:5432/compliance_engine"
```

### Future State (Nile)

```bash
# .env
DATABASE_URL="postgresql://pooler.nile.com:5432/mydb?sslmode=require"
DIRECT_URL="postgresql://direct.nile.com:5432/mydb?sslmode=require"
```

### Migration Steps

1. **Create Nile database**
   - Sign up for Nile
   - Create database
   - Get connection URLs

2. **Update environment variables**
   ```bash
   # Only change these two lines in .env
   DATABASE_URL="<nile-pooled-url>"
   DIRECT_URL="<nile-direct-url>"
   ```

3. **Verify configuration**
   ```bash
   npm run verify:env
   npm run verify:db
   ```

4. **Run migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Verify health**
   ```bash
   curl https://your-app.com/api/health
   ```

**That's it! No code changes.**

---

## ✅ Definition of Done

The foundation is considered complete when:

- [ ] `npm run build` passes without errors
- [ ] `npx tsc --noEmit` passes without type errors
- [ ] `npm run verify:env` succeeds
- [ ] `npm run verify:db` succeeds
- [ ] `curl http://localhost:3000/api/health` returns `ok: true`
- [ ] Login works reliably without redirect loops
- [ ] Database failure causes health endpoint failure (NOT auth loop)
- [ ] All environment variables documented in `.env.example`
- [ ] Migration path to Nile is clear and tested

---

## 🐛 Troubleshooting Guide

### Issue: "Environment validation failed"

**Cause:** Missing or invalid environment variables

**Fix:**
1. Check `.env` file exists
2. Compare with `.env.example`
3. Run `npm run verify:env` for details

---

### Issue: "Database verification failed"

**Cause:** Cannot connect to database

**Fix:**
1. Verify PostgreSQL is running: `psql -l`
2. Check `DATABASE_URL` and `DIRECT_URL` are correct
3. Test connection: `psql $DATABASE_URL`
4. Run migrations: `npm run db:migrate`

---

### Issue: "Health endpoint returns 503"

**Cause:** Database is unreachable

**Fix:**
1. **DO NOT debug auth yet**
2. Run `npm run verify:db`
3. Check PostgreSQL status
4. Verify network connectivity
5. Check firewall rules

---

### Issue: "Auth redirect loop"

**Cause:** Multiple possible issues

**Fix (in order):**
1. **First:** Verify database health
   ```bash
   npm run verify:db
   curl http://localhost:3000/api/health
   ```
2. **Second:** Check NEXTAUTH_SECRET
   ```bash
   grep NEXTAUTH_SECRET .env
   ```
3. **Third:** Clear browser cookies
4. **Fourth:** Check browser console for errors
5. **Last:** Review NextAuth configuration

**Never assume auth issue until database is verified!**

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Application Startup              │
│  1. Validate environment (src/lib/env.ts)│
│  2. Fail fast if invalid                │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│          Runtime Operations              │
│                                          │
│  ┌────────────┐        ┌──────────────┐│
│  │  Queries   │────────│ DATABASE_URL ││
│  │ (Pooled OK)│        │   (Runtime)  ││
│  └────────────┘        └──────────────┘│
│                                          │
│  ┌────────────┐        ┌──────────────┐│
│  │ Migrations │────────│  DIRECT_URL  ││
│  │(Direct only)│       │  (Migrations)││
│  └────────────┘        └──────────────┘│
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Health Monitoring                │
│  GET /api/health → DB connectivity check │
│  Returns 200 (healthy) or 503 (unhealthy)│
└─────────────────────────────────────────┘
```

---

## 🎓 Best Practices

### 1. Always Verify Before Debugging

```bash
# Before any auth debugging
npm run verify:all
curl http://localhost:3000/api/health
```

### 2. Use Health Endpoint in CI/CD

```yaml
# Example: GitHub Actions
- name: Health Check
  run: |
    curl -f http://localhost:3000/api/health || exit 1
```

### 3. Monitor Health in Production

```bash
# Cron job or monitoring service
*/5 * * * * curl -f https://app.com/api/health || alert
```

### 4. Document Environment Changes

When changing `.env`:
1. Update `.env.example`
2. Run `npm run verify:env`
3. Document in commit message

### 5. Test Migration Path

Periodically test switching to a different database:
1. Spin up second Postgres instance
2. Update `DATABASE_URL` and `DIRECT_URL`
3. Run migrations
4. Verify health endpoint
5. Test auth flow

---

## 📚 Related Documentation

- [INSTALLATION.md](./INSTALLATION.md) - Setup instructions
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Command reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Version:** 0.2.0  
**Status:** ✅ Foundation Complete  
**Last Updated:** February 19, 2026  
**Migration Ready:** Yes (Nile, Supabase, any Postgres provider)
