# Project File Structure

```
WCTV2/ (Operational Compliance Engine)
│
├── 📄 Configuration Files
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Git ignore rules
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.ts            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── postcss.config.mjs        # PostCSS configuration
│   └── eslint.config.mjs         # ESLint configuration
│
├── 📚 Documentation
│   ├── README.md                 # Quick start guide
│   ├── PROJECT-SUMMARY.md        # Complete project summary
│   ├── INSTALLATION.md           # Detailed installation guide
│   ├── DEMO-SETUP.md             # Complete setup instructions
│   ├── SETUP-COMMANDS.md         # Copy-paste commands
│   ├── QUICK-REFERENCE.md        # Quick reference card
│   ├── SMOKE-TESTS.md            # Testing procedures
│   └── ARCHITECTURE.md           # System architecture
│
├── 🛠️ Scripts
│   ├── setup.sh                  # Automated setup script
│   └── validate.sh               # Build validation script
│
├── 🗄️ Database (prisma/)
│   ├── schema.prisma             # Database schema (4 models)
│   ├── seed.ts                   # Seed script (demo data)
│   └── migrations/               # Database migrations (created on first run)
│
├── 💻 Application (src/)
│   │
│   ├── 🔐 Authentication
│   │   ├── auth.ts               # NextAuth v5 configuration
│   │   └── types/
│   │       └── next-auth.d.ts    # TypeScript type extensions
│   │
│   ├── 📚 Libraries (lib/)
│   │   ├── db.ts                 # Prisma client singleton
│   │   └── requireRole.ts        # Auth guard utilities
│   │
│   └── 🌐 App Router (app/)
│       │
│       ├── 🏠 Root Pages
│       │   ├── layout.tsx        # Root layout with globals.css
│       │   ├── page.tsx          # Landing page (public)
│       │   ├── globals.css       # Tailwind CSS imports
│       │   ├── error.tsx         # Error boundary (403, 500)
│       │   └── not-found.tsx     # 404 page
│       │
│       ├── 🔑 Authentication (login/)
│       │   ├── page.tsx          # Login page (server)
│       │   └── LoginForm.tsx     # Login form (client)
│       │
│       ├── 📊 Dashboard (dashboard/)
│       │   └── page.tsx          # Role-based dashboard (server)
│       │
│       ├── 📝 Audits (audits/)
│       │   ├── actions.ts        # Server actions (create, submit, get)
│       │   │
│       │   ├── new/              # Create Audit Flow
│       │   │   ├── page.tsx      # New audit page (server)
│       │   │   └── NewAuditForm.tsx  # Audit form (client)
│       │   │
│       │   └── [id]/             # Audit Detail
│       │       └── page.tsx      # Audit detail & submit (server)
│       │
│       └── 🔌 API Routes (api/)
│           ├── health/
│           │   └── route.ts      # Health check endpoint
│           │
│           ├── admin/
│           │   └── seed/
│           │       └── route.ts  # Database seed endpoint
│           │
│           └── auth/
│               └── [...nextauth]/
│                   └── route.ts  # NextAuth routes (GET, POST)
│
├── 📦 Generated (not in git)
│   ├── node_modules/             # NPM dependencies
│   ├── .next/                    # Next.js build output
│   ├── .env                      # Environment variables (SECRET!)
│   └── prisma/migrations/        # Database migration files
│
└── 🎯 Entry Points
    ├── npm run dev               → http://localhost:3000
    ├── npm run build             → Production build
    └── npm run start             → Production server
```

---

## 📁 File Count by Type

| Type | Count |
|------|-------|
| Documentation | 8 |
| Configuration | 8 |
| TypeScript Source | 17 |
| Database | 2 |
| Scripts | 2 |
| **Total** | **37** |

---

## 🎯 Key Files to Know

### Must Understand
1. **`src/auth.ts`** - Authentication configuration
2. **`src/lib/requireRole.ts`** - Auth guards (prevents loops!)
3. **`prisma/schema.prisma`** - Database schema
4. **`src/app/audits/actions.ts`** - Server actions

### Entry Points
1. **`src/app/page.tsx`** - Landing page (start here)
2. **`src/app/login/page.tsx`** - Login page
3. **`src/app/dashboard/page.tsx`** - Dashboard

### Configuration
1. **`.env`** - Environment variables (create from .env.example)
2. **`package.json`** - Dependencies and scripts
3. **`tsconfig.json`** - TypeScript settings

---

## 🔄 Data Flow Through Files

### Login Flow
```
src/app/login/LoginForm.tsx (client)
    ↓ signIn()
src/auth.ts (NextAuth config)
    ↓ authorize()
src/lib/db.ts (Prisma client)
    ↓ query database
prisma/schema.prisma (User model)
```

### Protected Page Access
```
src/app/dashboard/page.tsx (server)
    ↓ requireUser()
src/lib/requireRole.ts (auth guard)
    ↓ auth()
src/auth.ts (NextAuth)
    ↓ if no session
redirect to /login
```

### Create Audit Flow
```
src/app/audits/new/NewAuditForm.tsx (client)
    ↓ form submit
src/app/audits/actions.ts (server action)
    ↓ createAuditDraft()
src/lib/requireRole.ts (check permissions)
    ↓ validate with Zod
src/lib/db.ts (Prisma)
    ↓ create Audit record
prisma/schema.prisma (Audit model)
```

---

## 📦 Dependencies

### Production (7)
```json
"next": "^15.1.0"              // Framework
"react": "^19.0.0"             // UI library
"react-dom": "^19.0.0"         // React DOM
"next-auth": "^5.0.0-beta.25"  // Authentication
"@prisma/client": "^6.1.0"     // Database client
"bcryptjs": "^2.4.3"           // Password hashing
"zod": "^3.24.1"               // Validation
```

### Development (9)
```json
"@types/node": "^22.10.2"           // Node types
"@types/react": "^19.0.1"           // React types
"@types/react-dom": "^19.0.2"       // React DOM types
"@types/bcryptjs": "^2.4.6"         // bcrypt types
"typescript": "^5.7.2"              // TypeScript compiler
"prisma": "^6.1.0"                  // Prisma CLI
"tsx": "^4.19.2"                    // TypeScript executor
"tailwindcss": "^3.4.17"            // CSS framework
"postcss": "^8.4.49"                // CSS processor
"autoprefixer": "^10.4.20"          // CSS vendor prefixing
"eslint": "^9.17.0"                 // Linter
"eslint-config-next": "^15.1.0"     // Next.js ESLint config
```

---

## 🗂️ Routes Map

### Public Routes
```
/                    → Landing page
/login               → Login page
/api/health          → Health check
/api/admin/seed      → Seed database (demo mode only)
```

### Protected Routes (Authentication Required)
```
/dashboard           → Dashboard (all authenticated users)
/audits/new          → Start new audit (OFFICER or ADMIN)
/audits/[id]         → View audit detail (all authenticated users)
```

### API Routes
```
/api/auth/[...nextauth]  → NextAuth endpoints
  ├── /api/auth/signin
  ├── /api/auth/signout
  └── /api/auth/session
```

---

## 🎨 Component Types

### Server Components (No JavaScript to Client)
- `src/app/page.tsx` - Landing
- `src/app/login/page.tsx` - Login page
- `src/app/dashboard/page.tsx` - Dashboard
- `src/app/audits/new/page.tsx` - New audit page
- `src/app/audits/[id]/page.tsx` - Audit detail
- `src/app/layout.tsx` - Root layout

### Client Components (Interactive)
- `src/app/login/LoginForm.tsx` - Login form
- `src/app/audits/new/NewAuditForm.tsx` - Audit form
- `src/app/error.tsx` - Error boundary

### Server Actions
- `src/app/audits/actions.ts` - All audit operations

---

## 📊 Database Tables

```
users
├── id (PK)
├── email (unique)
├── name
├── role (ADMIN | OFFICER)
├── password_hash
├── active
└── created_at

stores
├── id (PK)
├── name
├── unit_number
├── store_type (FB | RETAIL)
├── active
└── created_at

audit_templates
├── id (PK)
├── name
├── description
├── active
└── created_at

audits
├── id (PK)
├── store_id (FK → stores)
├── template_id (FK → audit_templates)
├── conducted_by_id (FK → users)
├── status (DRAFT | SUBMITTED)
├── audit_date
└── created_at
```

---

## 🔍 File Purposes

### Authentication & Authorization
| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth configuration, credentials provider |
| `src/lib/requireRole.ts` | Auth guard functions |
| `src/types/next-auth.d.ts` | TypeScript session/JWT extensions |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API routes |

### Pages & UI
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Public landing page |
| `src/app/login/page.tsx` | Login page (server) |
| `src/app/login/LoginForm.tsx` | Login form (client) |
| `src/app/dashboard/page.tsx` | Role-based dashboard |
| `src/app/error.tsx` | Error boundary (403, 500) |
| `src/app/not-found.tsx` | 404 page |

### Audit Functionality
| File | Purpose |
|------|---------|
| `src/app/audits/actions.ts` | Server actions (CRUD) |
| `src/app/audits/new/page.tsx` | New audit page (server) |
| `src/app/audits/new/NewAuditForm.tsx` | Audit creation form (client) |
| `src/app/audits/[id]/page.tsx` | Audit detail & submit |

### API & Utilities
| File | Purpose |
|------|---------|
| `src/app/api/health/route.ts` | Health check endpoint |
| `src/app/api/admin/seed/route.ts` | Database seed endpoint |
| `src/lib/db.ts` | Prisma client singleton |

### Database
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (4 models) |
| `prisma/seed.ts` | Seed script (demo data) |

---

## 🎯 Where to Start?

### Understanding the Code
1. Read `prisma/schema.prisma` - Database structure
2. Read `src/auth.ts` - Authentication setup
3. Read `src/lib/requireRole.ts` - Auth guards
4. Read `src/app/page.tsx` - Simple starting point
5. Read `src/app/audits/actions.ts` - Server actions

### Making Changes
1. **Add a new page** → Create `src/app/your-page/page.tsx`
2. **Add UI component** → Create in `src/components/`
3. **Add database model** → Edit `prisma/schema.prisma` + migrate
4. **Add server action** → Add to `src/app/[feature]/actions.ts`
5. **Add API route** → Create `src/app/api/[route]/route.ts`

---

**Last Updated:** February 19, 2026  
**Version:** 0.1.0  
**Status:** ✅ Complete
