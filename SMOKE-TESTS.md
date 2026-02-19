# Smoke Tests - Operational Compliance Engine

Quick verification tests to ensure the application is working correctly.

## Prerequisites

- Application is running (`npm run dev`)
- Database is migrated and seeded
- Environment variables are set

---

## API Endpoint Tests

### 1. Health Check

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-02-19T..."
}
```

**Status:** Should return `200 OK`

---

### 2. Seed Endpoint

**Request:**
```bash
curl http://localhost:3000/api/admin/seed
```

**Expected Response:**
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

**Status:** Should return `200 OK`

---

## UI Click Path Tests

### Test 1: Landing Page

1. **Navigate to:** http://localhost:3000
2. **Verify:**
   - ✅ Page loads without errors
   - ✅ "Operational Compliance Engine" title visible
   - ✅ Demo mode buttons visible (if DEMO_MODE=true)
   - ✅ "Go to Login" button visible
   - ✅ Features list displayed

---

### Test 2: Login Flow (Demo Mode)

1. **From landing page, click:** "Login as Manager (ADMIN)"
2. **Verify:**
   - ✅ Redirects to `/dashboard`
   - ✅ No redirect loops
   - ✅ No console errors
3. **Logout**
4. **From landing page, click:** "Login as Officer (AUDITOR)"
5. **Verify:**
   - ✅ Redirects to `/dashboard`
   - ✅ Different role badge shown

---

### Test 3: Manual Login

1. **Navigate to:** http://localhost:3000/login
2. **Enter:**
   - Email: `manager@demo.com`
   - Password: (leave blank)
3. **Click:** "Sign In"
4. **Verify:**
   - ✅ Redirects to `/dashboard`
   - ✅ Session established
   - ✅ User info displayed

---

### Test 4: Dashboard (Manager)

**Login as:** manager@demo.com

**Verify:**
- ✅ Header shows "Dashboard"
- ✅ Welcome message with user name/email
- ✅ Role badge shows "ADMIN"
- ✅ Logout button present
- ✅ Stats cards show:
  - Total Audits
  - Draft Audits
  - Submitted Audits
- ✅ "Start New Audit" button visible
- ✅ "Seed Database" button visible (ADMIN only)
- ✅ Recent audits table (empty initially)

---

### Test 5: Dashboard (Officer)

**Login as:** officer@demo.com

**Verify:**
- ✅ Role badge shows "OFFICER"
- ✅ "Start New Audit" button visible
- ✅ "Seed Database" button NOT visible (permission check)
- ✅ All other dashboard elements present

---

### Test 6: Create Audit Flow

**Login as:** manager@demo.com or officer@demo.com

1. **From dashboard, click:** "Start New Audit"
2. **Verify `/audits/new` page:**
   - ✅ Page loads without errors
   - ✅ "Select Store" dropdown populated
   - ✅ "Select Audit Template" dropdown populated
   - ✅ "Create Draft Audit" button enabled
3. **Select:**
   - Store: Any available store
   - Template: Any available template
4. **Click:** "Create Draft Audit"
5. **Verify:**
   - ✅ Redirects to `/audits/[id]`
   - ✅ Audit ID displayed
   - ✅ Status shows "DRAFT" (yellow badge)
   - ✅ Store information correct
   - ✅ Template information correct
   - ✅ Conducted by shows current user
   - ✅ "Submit Audit" button visible

---

### Test 7: Submit Audit

**Prerequisites:** Created a draft audit (Test 6)

1. **From audit detail page, click:** "Submit Audit"
2. **Verify:**
   - ✅ Page reloads
   - ✅ Status changes to "SUBMITTED" (green badge)
   - ✅ "Submit Audit" button disappears
   - ✅ Success message displayed
   - ✅ "read-only" notice shown

---

### Test 8: View Audit from Dashboard

1. **Navigate to:** `/dashboard`
2. **Verify:**
   - ✅ Recent audits table shows created audit
   - ✅ Stats cards updated with new counts
3. **Click:** "View" on any audit
4. **Verify:**
   - ✅ Redirects to audit detail page
   - ✅ All information displayed correctly

---

### Test 9: Auth Guard - Unauthenticated

1. **Logout** (if logged in)
2. **Navigate to:** http://localhost:3000/dashboard
3. **Verify:**
   - ✅ Redirects to `/login`
   - ✅ No errors
   - ✅ No infinite loops

---

### Test 10: Auth Guard - Forbidden (Future)

**Note:** Current implementation allows both ADMIN and OFFICER to access all routes. This test validates the guard mechanism works if permissions change.

1. **Login as:** officer@demo.com
2. **Attempt to access admin-only endpoint via code**
3. **Expected:**
   - ✅ Error page shows 403 Forbidden
   - ✅ Error message clear

---

## Database Validation

### Check Users

```bash
# Using psql
psql compliance_engine -c "SELECT email, role, active FROM users;"
```

**Expected:**
```
       email        |  role   | active 
-------------------+---------+--------
 manager@demo.com  | ADMIN   | t
 officer@demo.com  | OFFICER | t
```

---

### Check Stores

```bash
psql compliance_engine -c "SELECT name, unit_number, store_type FROM stores;"
```

**Expected:**
```
           name            | unit_number | store_type 
---------------------------+-------------+------------
 Downtown Food & Beverage  | FB-101      | FB
 Main Street Retail        | RT-201      | RETAIL
```

---

### Check Templates

```bash
psql compliance_engine -c "SELECT name FROM audit_templates;"
```

**Expected:**
```
            name             
-----------------------------
 Standard Compliance Audit
```

---

## Build & Deploy Validation

### TypeScript Check

```bash
npm run typecheck
```

**Expected:** No errors

---

### ESLint Check

```bash
npm run lint
```

**Expected:** No errors or only warnings

---

### Production Build

```bash
npm run build
```

**Expected:**
- ✅ Build completes without errors
- ✅ All routes compiled successfully
- ✅ Static pages generated

---

### Production Server

```bash
npm run build
npm run start
```

**Verify:**
- ✅ Server starts on port 3000
- ✅ All routes accessible
- ✅ Auth works correctly
- ✅ Database operations successful

---

## Common Issues & Solutions

### Issue: Seed data not appearing

**Solution:**
```bash
npm run db:seed
# Or visit: http://localhost:3000/api/admin/seed
```

---

### Issue: Auth redirects not working

**Solution:**
- Check `AUTH_SECRET` in `.env`
- Clear browser cookies
- Restart dev server

---

### Issue: Database connection failed

**Solution:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `psql -l | grep compliance`

---

### Issue: TypeScript errors

**Solution:**
```bash
npm run db:generate  # Regenerate Prisma types
npm run typecheck    # Check specific errors
```

---

## Performance Checks (Optional)

### Page Load Times

- Landing page: < 1s
- Login page: < 1s
- Dashboard: < 2s (with data)
- Audit detail: < 1s

### Database Query Performance

All queries should complete in < 100ms for small datasets.

---

## Security Checks

- ✅ No passwords exposed in demo mode
- ✅ AUTH_SECRET not committed to git
- ✅ Database credentials not in source code
- ✅ DEMO_MODE clearly indicated in UI
- ✅ Role-based access working

---

## Checklist Summary

- [ ] All API endpoints return correct responses
- [ ] Landing page loads without errors
- [ ] Demo login buttons work
- [ ] Manual login works
- [ ] Dashboard shows correct role badge
- [ ] Stats cards display correctly
- [ ] Create audit flow works end-to-end
- [ ] Submit audit changes status
- [ ] Auth guards prevent unauthorized access
- [ ] TypeScript check passes
- [ ] Production build succeeds
- [ ] Database seeded correctly

---

**Test Date:** _____________  
**Tester:** _____________  
**Version:** 0.1.0  
**Status:** ⬜ PASS | ⬜ FAIL  
**Notes:** _____________
