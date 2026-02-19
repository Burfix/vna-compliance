# Quick Reference Card

## 🚀 Quick Start Commands

```bash
# One-time setup
cp .env.example .env          # Create environment file
npm install                   # Install dependencies
npm run verify:env           # Validate environment
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Create database tables
npm run verify:db            # Verify database connection
npm run db:seed              # Seed demo data

# Development
npm run dev                  # Start dev server (http://localhost:3000)

# Verification
npm run verify:env           # Check environment variables
npm run verify:db            # Check database connection
npm run verify:all           # Run all verifications

# Production
npm run build                # Build for production
npm run start                # Start production server

# Maintenance
npm run typecheck            # Check TypeScript
npm run lint                 # Run linter
npm run db:seed              # Re-seed database
```

---

## 👥 Demo Users

| Email                | Role    | Password |
|----------------------|---------|----------|
| manager@demo.com     | ADMIN   | (none)   |
| officer@demo.com     | OFFICER | (none)   |

---

## 🔗 Important URLs

| Page               | URL                          | Auth Required |
|--------------------|------------------------------|---------------|
| Landing            | http://localhost:3000        | No            |
| Login              | http://localhost:3000/login  | No            |
| Dashboard          | http://localhost:3000/dashboard | Yes        |
| Start Audit        | http://localhost:3000/audits/new | Yes (Officer/Admin) |
| Health Check       | http://localhost:3000/api/health | No        |
| Seed Endpoint      | http://localhost:3000/api/admin/seed | No (Demo Mode) |

---

## 📊 Database Schema

### Users
- `id` (string)
- `email` (unique)
- `name`
- `role` (ADMIN | OFFICER)
- `passwordHash` (optional)
- `active` (boolean)

### Stores
- `id` (string)
- `name`
- `unitNumber`
- `storeType` (FB | RETAIL)
- `active` (boolean)

### AuditTemplates
- `id` (string)
- `name`
- `description`
- `active` (boolean)

### Audits
- `id` (string)
- `storeId` → Store
- `templateId` → AuditTemplate
- `conductedById` → User
- `status` (DRAFT | SUBMITTED)
- `auditDate`

---

## 🔐 Environment Variables

```env
# Database (for local Postgres, both can be the same)
DATABASE_URL="postgresql://user:password@localhost:5432/compliance_engine"
DIRECT_URL="postgresql://user:password@localhost:5432/compliance_engine"

# Authentication (use NEXTAUTH_SECRET, not AUTH_SECRET)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Feature Flags
DEMO_MODE=true
```

---

## 🛣️ Click Path: Complete Audit Flow

1. http://localhost:3000 → Click "Login as Manager"
2. → Dashboard → Click "Start New Audit"
3. → Select store + template → Click "Create Draft Audit"
4. → Audit detail page → Click "Submit Audit"
5. → Status changes to SUBMITTED ✅
Verify environment
npm run verify:env

# Verify database
npm run verify:db

# Check API health
curl http://localhost:3000/api/health

# Seed database
curl http://localhost:3000/api/admin/seed
curl http://localhost:3000/api/health

# Seed database
curl http://localhost:3000/api/admin/seed

# Expected: Both return JSON with "ok": true or "success": true
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check PostgreSQL is running + DATABASE_URL |
| "Auth redirect loop" | Set AUTH_SECRET + restart server |
| "No stores/templates" | Run `npm run db:seed` |
| TypeScript errors | Run `npm run db:generate` |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth configuration |
| `src/lib/requireRole.ts` | Auth guards |
| `prisma/schema.prisma` | Database schema |
| `src/app/audits/actions.ts` | Server actions |
| `.env` | Environment variables |

---

## ⚡ Useful Snippets

### Check Database Records
```bash
psql compliance_engine -c "SELECT COUNT(*) FROM audits;"
```

### Reset Database
```bash
npm run db:migrate -- --reset
npm run db:seed
```

### Generate New Secret
```bash
openssl rand -base64 32
```

---

**Version:** 0.1.0  
**Last Updated:** Feb 19, 2026
