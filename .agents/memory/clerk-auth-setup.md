---
name: Clerk Auth Setup
description: Clerk auth is provisioned and wired for this marketing-agent + api-server project.
---

Clerk is Replit-managed (status: managed). Provisioned via setupClerkWhitelabelAuth().

**Server (artifacts/api-server):**
- Packages: `http-proxy-middleware @clerk/express @clerk/shared ws @types/ws`
- `clerkProxyMiddleware` mounted in app.ts before body parsers
- `clerkMiddleware` wired with `publishableKeyFromHost`
- `requireAuth` middleware at `src/middlewares/requireAuth.ts` — checks `getAuth(req).userId`
- Applied in `routes/index.ts`: marketing and profile routers require auth; health is public

**Client (artifacts/marketing-agent):**
- Packages: `@clerk/react @clerk/themes`
- `ClerkProvider` in App.tsx with `publishableKeyFromHost` from `@clerk/react/internal`
- Routes: `/sign-in/*?` and `/sign-up/*?` with Clerk `routing="path"`
- `/gmb`, `/review`, `/social` redirect to `/sign-in` when signed out
- Header shows email + sign-out button when signed in; Sign in + Get started when signed out
- Logo at `public/logo.svg`

**CSS (Tailwind v4):**
- `@layer theme, base, clerk, components, utilities;` added before @import "tailwindcss"
- `@import "@clerk/themes/shadcn.css"` added
- `tailwindcss({ optimize: false })` in vite.config.ts (required for prod build correctness)

**Why:** Without auth, any visitor could burn Gemini/Supabase quota and access all profiles.
**How to apply:** When adding new API routes that need protection, import and apply `requireAuth` in routes/index.ts.
