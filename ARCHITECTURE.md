# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Landing   │  │   Login    │  │     Dashboard        │  │
│  │    Page    │  │    Page    │  │  (Role-based view)   │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Audit Flow Pages                          │ │
│  │  /audits/new  →  /audits/[id]                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Server Components                     │ │
│  │  • Dashboard • Audit List • Audit Detail               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 Client Components                      │ │
│  │  • LoginForm • NewAuditForm • Error Boundaries         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Server Actions                        │ │
│  │  • createAuditDraft() • submitAudit()                  │ │
│  │  • getAuditTemplates() • getStoresForAudits()          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API Routes                           │ │
│  │  • /api/auth/[...nextauth] • /api/health               │ │
│  │  • /api/admin/seed                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      NextAuth v5                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Credentials Provider                      │ │
│  │  • Demo Mode (passwordless)                            │ │
│  │  • Standard Mode (with password)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 Session Management                     │ │
│  │  Strategy: JWT                                         │ │
│  │  Includes: user.id, user.role                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Auth Guards                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  requireUser()  →  Ensures authenticated               │ │
│  │  requireRole([...])  →  Checks role permissions        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Database Models                         │ │
│  │  • User  • Store  • AuditTemplate  • Audit             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  Tables: users, stores, audit_templates, audits             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Authentication Flow

```
User enters credentials
    ↓
LoginForm (client) → signIn()
    ↓
NextAuth Credentials Provider
    ↓
If DEMO_MODE + demo email → Upsert user in DB
If password provided → Verify bcrypt hash
    ↓
Create JWT with user.id + user.role
    ↓
Set session cookie
    ↓
Redirect to /dashboard
```

### 2. Protected Route Access

```
User navigates to /dashboard
    ↓
Dashboard page (server component)
    ↓
requireUser() guard → auth()
    ↓
If no session → redirect("/login")
If session exists → return user
    ↓
Fetch data from Prisma
    ↓
Render dashboard with user data
```

### 3. Create Audit Flow

```
User clicks "Start New Audit"
    ↓
/audits/new page loads
    ↓
requireRole(["ADMIN", "OFFICER"]) guard
    ↓
Fetch templates & stores (server)
    ↓
Render NewAuditForm (client)
    ↓
User selects store + template
    ↓
Form submit → createAuditDraft() server action
    ↓
Validate with Zod schema
    ↓
Create Audit record in DB (status: DRAFT)
    ↓
Revalidate cache
    ↓
Return auditId
    ↓
Redirect to /audits/[id]
```

### 4. Submit Audit Flow

```
User on /audits/[id] page
    ↓
Audit status is DRAFT
    ↓
User clicks "Submit Audit" button
    ↓
submitAudit() server action
    ↓
Verify user owns the audit
    ↓
Verify status is DRAFT
    ↓
Update status to SUBMITTED
    ↓
Revalidate cache
    ↓
Page reloads with new status
```

---

## File Structure

```
WCTV2/
├── prisma/
│   ├── schema.prisma              # Database schema & models
│   ├── seed.ts                    # Seed script for demo data
│   └── migrations/                # Database migrations
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API endpoints
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── health/route.ts
│   │   │   └── admin/seed/route.ts
│   │   │
│   │   ├── audits/
│   │   │   ├── [id]/page.tsx      # Audit detail (server)
│   │   │   ├── new/
│   │   │   │   ├── page.tsx       # New audit (server)
│   │   │   │   └── NewAuditForm.tsx  # Form (client)
│   │   │   └── actions.ts         # Server actions
│   │   │
│   │   ├── dashboard/page.tsx     # Dashboard (server)
│   │   ├── login/
│   │   │   ├── page.tsx           # Login page (server)
│   │   │   └── LoginForm.tsx      # Login form (client)
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Global styles
│   │   ├── error.tsx              # Error boundary
│   │   └── not-found.tsx          # 404 page
│   │
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   └── requireRole.ts         # Auth guard utilities
│   │
│   ├── types/
│   │   └── next-auth.d.ts         # NextAuth type extensions
│   │
│   └── auth.ts                    # NextAuth configuration
│
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
├── postcss.config.mjs             # PostCSS config
├── next.config.ts                 # Next.js config
├── eslint.config.mjs              # ESLint config
│
├── README.md                      # Project overview
├── INSTALLATION.md                # Detailed installation guide
├── DEMO-SETUP.md                  # Complete setup guide
├── SMOKE-TESTS.md                 # Testing procedures
├── QUICK-REFERENCE.md             # Quick reference card
├── SETUP-COMMANDS.md              # Copy-paste commands
├── ARCHITECTURE.md                # This file
│
├── setup.sh                       # Automated setup script
└── validate.sh                    # Validation script
```

---

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **React 19**: UI library

### Authentication
- **NextAuth v5**: Authentication library
- **bcryptjs**: Password hashing

### Database
- **Prisma**: ORM for database operations
- **PostgreSQL**: Relational database

### Validation
- **Zod**: Schema validation

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Development Tools
- **tsx**: TypeScript execution
- **ESLint**: Code linting
- **TypeScript Compiler**: Type checking

---

## Design Patterns

### 1. Server-First Architecture
- Most pages are Server Components
- Client Components only when needed (forms, interactivity)
- Reduces JavaScript bundle size

### 2. Server Actions
- Form submissions use Server Actions
- Direct database access from actions
- Type-safe with Zod validation
- Automatic revalidation

### 3. Progressive Enhancement
- Forms work without JavaScript
- Server-side validation
- Client-side enhancements

### 4. Guard Pattern
- `requireUser()` - Basic authentication
- `requireRole([roles])` - Role-based access
- Centralized auth logic
- Consistent redirects

### 5. Repository Pattern
- Prisma acts as repository layer
- All DB queries through Prisma Client
- Type-safe database access

---

## Security Considerations

### Authentication
- ✅ JWT-based sessions
- ✅ Secure cookie storage
- ✅ Password hashing (bcrypt)
- ✅ Demo mode clearly indicated

### Authorization
- ✅ Role-based access control
- ✅ Server-side permission checks
- ✅ Guard functions on all protected routes

### Data Validation
- ✅ Zod schemas for input validation
- ✅ TypeScript for compile-time safety
- ✅ Prisma for SQL injection prevention

### Environment Security
- ✅ Secrets in .env (not committed)
- ✅ .env.example as template
- ✅ AUTH_SECRET required
- ✅ DEMO_MODE flag for development

---

## Performance Optimizations

### Server-Side Rendering
- Pages pre-rendered on server
- Faster initial page load
- Better SEO

### Data Fetching
- Parallel queries where possible
- Prisma query optimization
- Selective field fetching

### Caching
- Next.js automatic caching
- Revalidation on mutations
- Cache-Control headers

### Bundle Size
- Minimal client-side JavaScript
- Tree-shaking enabled
- Production minification

---

## Scalability Considerations

### Current Implementation
- Single-instance deployment
- Direct database connection
- Session-based authentication

### Future Scaling Options

**Horizontal Scaling:**
- Add Redis for session storage
- Implement connection pooling (PgBouncer)
- Use CDN for static assets

**Database Scaling:**
- Read replicas for queries
- Connection pooling
- Query optimization

**Caching Layer:**
- Redis for frequently accessed data
- Cache invalidation strategies
- Edge caching

**Monitoring:**
- Application performance monitoring
- Database query analysis
- Error tracking (Sentry, etc.)

---

## Testing Strategy

### Current Testing
- Manual smoke tests
- TypeScript compile-time checks
- Build verification

### Future Testing (Not Implemented)

**Unit Tests:**
- Server actions
- Utility functions
- Validation schemas

**Integration Tests:**
- API endpoints
- Database operations
- Auth flows

**E2E Tests:**
- User flows (Playwright, Cypress)
- Cross-browser testing
- Accessibility testing

---

## Deployment Architecture

### Development
```
Local Machine
├── Node.js process (npm run dev)
├── PostgreSQL (localhost)
└── .env (local secrets)
```

### Production (Example)
```
Vercel/Render/Railway
├── Next.js app (server)
├── PostgreSQL (managed service)
├── Environment variables (platform secrets)
└── CDN for static assets
```

---

## Database Schema

### Enums
- `Role`: ADMIN, OFFICER
- `StoreType`: FB, RETAIL
- `AuditStatus`: DRAFT, SUBMITTED

### Relations
```
User ─── conductedAudits ──→ Audit
Store ─── audits ──→ Audit
AuditTemplate ─── audits ──→ Audit
```

### Indexes
- `User.email` (unique)
- Primary keys on all tables

---

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/admin/seed` - Seed database (demo mode only)

### Auth Endpoints
- `POST /api/auth/signin/credentials` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get session

### Protected Pages
- `/dashboard` - Requires authentication
- `/audits/new` - Requires OFFICER or ADMIN
- `/audits/[id]` - Requires authentication

---

## State Management

### Server State
- Prisma queries (server components)
- Server actions for mutations
- Automatic revalidation

### Client State
- React hooks (useState, useForm)
- Next.js router (navigation)
- No global state library needed

### Session State
- NextAuth session
- JWT stored in HTTP-only cookie
- Session data in callbacks

---

## Error Handling

### Application Errors
- Error boundaries (error.tsx)
- 404 pages (not-found.tsx)
- Try-catch in server actions

### Database Errors
- Prisma error handling
- Unique constraint violations
- Foreign key constraints

### Auth Errors
- Invalid credentials
- Expired sessions
- Forbidden access (403)

---

## Development Workflow

1. **Make changes** to code
2. **Hot reload** (Next.js dev server)
3. **TypeScript** checks in editor
4. **Test manually** in browser
5. **Run typecheck** before commit
6. **Run build** before deploy
7. **Deploy** to production

---

## Monitoring & Observability

### Current Implementation
- Console logs
- Error messages in UI
- Health check endpoint

### Production Recommendations
- Application logs (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database query monitoring
- Uptime monitoring

---

## Version History

- **v0.1.0** (Feb 19, 2026): Initial minimal implementation
  - Basic auth with NextAuth
  - Role-based access control
  - Audit CRUD operations
  - Demo mode support

---

## Future Roadmap (Not Implemented)

### Phase 2: Enhanced Audits
- Audit questions/checklist
- File uploads
- Comments/notes

### Phase 3: Reporting
- PDF generation
- Analytics dashboard
- Export functionality

### Phase 4: Collaboration
- Multi-user audits
- Notifications
- Activity feed

### Phase 5: Enterprise
- Multi-tenant support
- SSO integration
- Advanced permissions

---

**Version:** 0.1.0  
**Last Updated:** February 19, 2026  
**Status:** Production Ready (Minimal Version)
