# 🚀 Deployment Guide - V&A Waterfront Compliance System

## Deploy to Vercel (Recommended - 5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))

### Step-by-Step Deployment

#### 1. Push to GitHub
```bash
# Create a new repository on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/vna-compliance.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Vercel

**Option A: One-Click Deploy (Easiest)**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js - no configuration needed!
5. Click "Deploy"

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel
```

#### 3. Set Up Database

**Vercel Postgres (Free Tier)**
1. In Vercel dashboard → Storage → Create Database → Postgres
2. Connect to your project
3. Copy the environment variables (auto-populated)

**OR use existing PostgreSQL:**
- Add `DATABASE_URL` in Vercel environment variables
- Format: `postgresql://user:password@host:port/database`

#### 4. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```bash
# Database
DATABASE_URL="your-vercel-postgres-url-or-external-db"

# NextAuth (REQUIRED)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Optional: Demo Mode
NEXT_PUBLIC_DEMO_MODE="false"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

#### 5. Run Database Migration

After first deployment, go to Vercel dashboard:
1. Settings → Functions → Node.js Version → 20.x
2. Deployments → Latest → Actions → Run Command
3. Execute:
```bash
npx prisma migrate deploy
npm run db:seed
```

**OR** via Vercel CLI:
```bash
vercel env pull .env.production.local
npx prisma migrate deploy --preview-feature
```

### 🎉 Done!

Your app is live at: `https://your-app.vercel.app`

---

## Alternative: Deploy to Other Platforms

### Railway (Great for PostgreSQL included)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```
- PostgreSQL automatically provisioned
- Environment variables auto-configured

### Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```
- Add PostgreSQL via Neon, Supabase, or external provider

### Render
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Add PostgreSQL database (free tier)
4. Set environment variables
5. Deploy

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Yes | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Yes | Random secret (32+ chars) | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_DEMO_MODE` | No | Enable mock data mode | `true` or `false` |

---

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Seed data loaded (2 users, 20 tenants)
- [ ] Can log in with username: `sarah` or `john`
- [ ] Dashboard displays V&A precincts
- [ ] Can create/view audits
- [ ] Audit scoring works with N/A option

---

## Troubleshooting

**Build fails with Prisma error:**
```bash
# Add to package.json scripts:
"postinstall": "prisma generate"
```

**Database connection fails:**
- Check `DATABASE_URL` includes `?sslmode=require` for cloud databases
- Verify IP allowlist (Vercel IPs need access)

**Authentication errors:**
- Ensure `NEXTAUTH_URL` matches your deployment URL
- Regenerate `NEXTAUTH_SECRET` if needed

**Demo Mode stuck:**
- Set `NEXT_PUBLIC_DEMO_MODE=false` in environment variables
- Redeploy to apply changes

---

## Demo Credentials

**After seeding the database:**
- Admin: `sarah`
- Officer: `john`

**No password required** - just enter username!
