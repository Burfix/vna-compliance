# Vercel Environment Variables - REQUIRED

Add these to Vercel → Settings → Environment Variables → Production:

## 1. AUTH_SECRET (CRITICAL - NextAuth v5 requirement)
```
AUTH_SECRET=9i6Mv+VWjydoRpjACgIqpMddPfeTPLpBV8HYeU5iXD4=
```

## 2. NEXTAUTH_URL
```
NEXTAUTH_URL=https://vna-compliance.vercel.app
```

## 3. DATABASE_URL
```
DATABASE_URL=postgresql://neondb_owner:npg_O51eTdpUDKIG@ep-polished-wind-aic50lq0-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 4. DIRECT_URL
```
DIRECT_URL=postgresql://neondb_owner:npg_O51eTdpUDKIG@ep-polished-wind-aic50lq0-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## After adding ALL variables:
1. Go to Deployments
2. Click latest deployment → ⋮ → Redeploy
3. Test login and audit creation

## Why AUTH_SECRET is critical:
NextAuth v5 requires `AUTH_SECRET` (not NEXTAUTH_SECRET) to encrypt sessions.
Without it, `auth()` returns null in server actions even when user is logged in.
