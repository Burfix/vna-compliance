# Operational Compliance Engine

A minimal SaaS application for audit and compliance management with a **rock-solid, provider-agnostic foundation**.

## ✨ What's New in v0.2.0

- ✅ **Fail-fast environment validation** with Zod
- ✅ **Database-first debugging** (DB failures ≠ Auth failures)
- ✅ **Comprehensive health monitoring**
- ✅ **Zero-code migration to Nile** (or any provider)
- ✅ **Verification scripts** for confidence

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

---

## Quick Start

1. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify environment:**
   ```bash
   npm run verify:env
   ```

4. **Setup database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run verify:db
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Verify installation:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"ok":true,"status":"healthy",...}
   ```

7. **Open browser:**
   ```
   http://localhost:3000
   ```

## Documentation

### Essential Reading
- **[FOUNDATION.md](./FOUNDATION.md)** - ✨ Architecture & migration path
- **[SETUP-COMMANDS.md](./SETUP-COMMANDS.md)** - Copy-paste setup commands
- **[CHANGELOG.md](./CHANGELOG.md)** - What's new in v0.2.0

### Complete Guide
- [INSTALLATION.md](./INSTALLATION.md) - Detailed setup guide
- [DEMO-SETUP.md](./DEMO-SETUP.md) - Complete walkthrough
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Quick reference card
- [SMOKE-TESTS.md](./SMOKE-TESTS.md) - Testing procedures
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [FILE-STRUCTURE.md](./FILE-STRUCTURE.md) - Project structure

## Tech Stack

- Next.js 15 (App Router)
- TypeScript with strict mode
- NextAuth v5 (with fail-fast validation)
- Prisma + PostgreSQL (provider-agnostic)
- Tailwind CSS
- Zod validation

## Key Features

- ✅ Role-based authentication (ADMIN, OFFICER)
- ✅ Dashboard with audit statistics
- ✅ Create and manage audits
- ✅ Store and template management
- ✅ Demo mode for quick testing
- ✅ **Fail-fast environment validation**
- ✅ **Comprehensive health monitoring**
- ✅ **Provider-agnostic database setup**

## Demo Users

In demo mode (`DEMO_MODE=true`):
- **manager@demo.com** - ADMIN role
- **officer@demo.com** - OFFICER role
Verification

```bash
# Verify environment variables
npm run verify:env

# Verify database connection
npm run verify:db

# Run all verifications
npm run verify:all

# Check health endpoint
curl http://localhost:3000/api/health
```

## Migration to Nile (or any provider)

When ready to migrate:
1. Get new database URLs (pooled + direct)
2. Update `DATABASE_URL` and `DIRECT_URL` in `.env`
3. Run `npm run verify:all`
4. Deploy

**No code changes required!** See [FOUNDATION.md](./FOUNDATION.md) for details.

## License

Private - Not for distribution

---

**Version:** 0.2.0  
**Status:** ✅ Production Ready  
**Foundation:** Enterprise-grade with fail-fast validation  
**Migration:** Ready for Nile, Supabase, any Postgres provider
## License

Private - Not for distribution
