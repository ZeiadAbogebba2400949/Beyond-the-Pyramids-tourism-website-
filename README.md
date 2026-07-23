# Beyond the Pyramids — Egypt Tourism Booking Platform

**[🔗 Live Demo](https://beyond-the-pyramids.onrender.com)**

`Node.js` · `Express` · `MongoDB` / `Mongoose` · `EJS` · `JWT` · `Cloudinary`

A full-stack tourism booking platform for Egypt — travelers browse curated day trips, week-long itineraries, and single-attraction tickets, build fully custom trips, and book end-to-end; admins run the catalog, bookings, and support desk from a dedicated dashboard. Built as a server-rendered MVC application from scratch (no scaffolding/starter kit), covering the full stack: schema design, auth, file uploads, external API integration, and production deployment.

---

## The Problem

Booking a trip in Egypt today usually means bouncing between several disconnected surfaces — a tour operator's static brochure site for day trips, a separate travel agent for multi-day packages, and yet another channel for single-attraction tickets, with no unified way to compare, customize, or manage a booking afterward. **Beyond the Pyramids** consolidates that into one hub: one catalog, one booking flow, and one dashboard to track a trip from selection to check-out — plus a "Custom Trip Architect" for travelers who want to assemble their own itinerary instead of picking from a fixed package.

---

## Key Features

**For Travelers**
- Browse day trips, week packages, and single-attraction tickets, each with tier-based pricing (Standard / Deluxe / Full)
- **Custom Trip Architect** — compose a personalized itinerary from destinations, accommodations, and room types, priced live from a data-driven options table rather than a fixed price list
- A 3-step booking flow (select → traveler details → confirm) with a persistent draft, so an abandoned booking never leaves half-written data behind
- Booking history, cancellation, and post-trip reviews (one review per traveler per package)
- Profile management with avatar upload
- Live weather widget (per destination) and an EGP → USD/EUR/GBP converter on the booking summary, both backed by external APIs

**For Admins**
- Dashboard KPIs: users, bookings, revenue, open support tickets
- Full CRUD for packages, including image upload
- User management: suspend, change role, delete
- Booking lifecycle management (confirmed → checked-in → checked-out)
- Support ticket inbox with replies
- Analytics & reporting page

**Security**
- JWT held in an httpOnly cookie (7-day expiry) with server-side invalidation on password change
- bcrypt password hashing
- Helmet security headers, MongoDB-injection sanitization, rate limiting
- Role-based access control (Tourist / Admin) enforced at the middleware layer

---

## Architecture

The app follows a classic **MVC** structure — `models/` → `controllers/` → `routes/` → `views/` — server-rendered with EJS rather than a client-side SPA framework. Every request flows through the same pipeline in `app.js`: Helmet → mongo-sanitize → rate limiting on `/api` → body parsing → static assets → the eight feature routers, with a single centralized error handler at the tail.

**Authentication** is handled by a small, composable middleware chain rather than one monolithic guard:
- `protect` — requires a valid JWT (read from either an httpOnly cookie *or* an `Authorization: Bearer` header, so the same middleware serves both the browser app and, potentially, a future API client), rejects suspended accounts, and invalidates tokens issued before the user's last password change
- `optionalAuth` — attaches `req.user` if a valid session exists, without blocking anonymous visitors (used on every public page so the nav bar/CTAs can adapt to logged-in state)
- `authorize(...roles)` — a role gate composed on top of `protect` for Admin-only routes

**Error handling** is centralized: a single `AppError` class carries an HTTP status and message, and one error-handling middleware normalizes Mongoose `CastError` / `ValidationError` / duplicate-key errors and JWT errors into consistent responses — then branches automatically between a JSON payload for `/api/*` requests and a rendered HTML error page (`error403` / `404` / `500`) for everything else.

**Data layer**: the six core Mongoose models (`User`, `Package`, `Booking`, `Review`, `Contact`, `TripOption`) push business logic down into the schema layer where it belongs — see [Engineering Highlights](#engineering-highlights) — keeping controllers focused on request/response plumbing rather than domain rules.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime / Framework | Node.js, Express | Minimal, unopinionated — full control over the middleware pipeline |
| Database / ODM | MongoDB, Mongoose | Flexible schema for heterogeneous package types (see [Technical Decisions](#key-technical-decisions)) |
| Views | EJS (server-rendered) | Full HTML on first response, no client build step |
| Auth | JSON Web Tokens (httpOnly cookie) | Stateless — no session store to run or scale |
| File Storage | Cloudinary + Multer | Persistent, CDN-backed storage on ephemeral hosting, with on-upload image transforms |
| Validation | express-validator | Declarative validation chains, mirrored client-side for instant feedback |
| Security | Helmet, express-mongo-sanitize, express-rate-limit, bcryptjs | Defense-in-depth against common HTTP/NoSQL-injection/brute-force vectors |
| External APIs | OpenWeatherMap, exchangerate-api.com | Live per-destination weather and currency conversion |
| Deployment | Render (HTTPS), MongoDB Atlas | See [Deployment](#deployment) |

---

## Engineering Highlights

A few implementation details that go beyond basic CRUD:

- **Self-maintaining ratings.** `Review` documents trigger a Mongoose aggregation pipeline (`calcAverageRating`) in `post('save')` / `post('findOneAndDelete')` hooks that recomputes a package's average rating and review count directly in MongoDB. No controller ever manually recalculates a rating — it's structurally impossible for `Package.rating` to drift out of sync with its reviews.
- **Context-aware image pipelines.** Rather than storing raw uploads and resizing on every request, three separate `CloudinaryStorage` configurations apply purpose-built transforms *at upload time* — avatars are cropped to 400×400, package hero images capped at 1200px wide, review photos at 1000px, all with `quality: auto`. Every subsequent page load serves an already-optimized asset with zero runtime cost.
- **A real booking state machine**, not a boolean flag: `draft → confirmed → checked-in → checked-out`, with `cancelled` reachable from most states. Drafts are real `Booking` documents from the first API call, so a user can leave mid-flow without losing progress, while `getMyBookings` filters drafts out so incomplete flows never pollute booking history or admin analytics.
- **Data-driven custom pricing.** The Trip Architect doesn't hardcode a price table — destinations, accommodations, and room types live in a `TripOption` lookup collection with a `price`/`mult` (multiplier) pair, so adding a new destination or room tier is a database insert, not a code change.
- **Human-readable, collision-safe booking numbers.** A `pre('save')` hook stamps every confirmed booking with an `EG-<year>-<random5>` identifier at the model layer, so every controller that creates a booking gets one for free.
- **Graceful external-API degradation.** The weather and currency widgets are additive: if `OPENWEATHER_API_KEY` is missing or the upstream API is down, the endpoint fails silently and the widget simply doesn't render — it never breaks the page it lives on.
- **Soft deletes for packages** (`status: inactive`) instead of destructive deletion, so historical bookings and reviews that reference a package keep working after it's pulled from the public catalog.

---

## Key Technical Decisions

**Why MongoDB over a relational database.** Day, week, and single-attraction packages share a core shape but diverge in the details — week packages need a `dailyItinerary` array of `{day, title, activities}`, day/single packages need a flat `itinerary` of `{time, activity}`, plus type-specific extras like `hotelName` or `guidedTour`. Modeling that relationally means either a wide table full of nullable columns or several join tables for what is, conceptually, one entity. A single flexible Mongoose schema fits the actual data shape.

**Why server-rendered EJS over a client-side SPA framework.** The app is content- and form-heavy rather than state-heavy, so a full client bundler/router bought little — EJS keeps the MVC boundary explicit (controllers own data, views own presentation), ships working HTML on the first response with no hydration step, and is trivially crawlable. The one page that *is* highly interactive (Package Details, with live tier pricing and widgets) uses a thin server-rendered shell that a page-specific script populates over `fetch` — SPA-style interactivity scoped to exactly the one page that needs it.

**Why JWT-in-httpOnly-cookie over server-side sessions.** No session store (Redis, etc.) to provision or scale — the token itself is the source of truth, verified per-request. The httpOnly cookie keeps the token out of reach of any injected script, while the same middleware also accepts a `Bearer` header, leaving the door open for a non-browser client later without touching the auth layer.

**Why Cloudinary over local disk storage.** Free-tier hosts (Render, and previously Railway) run containers with ephemeral filesystems — anything written to local disk disappears on the next deploy or restart. Offloading uploads to Cloudinary at request time, with transforms applied server-side via `multer-storage-cloudinary`, means uploaded images survive redeploys and are served from a CDN instead of the app server.

---

## Data Model

| Collection | Purpose |
|---|---|
| `User` | Accounts, bcrypt-hashed passwords, role (`Tourist`/`Admin`) and status (`active`/`suspended`) |
| `Package` | Day/week/single-attraction listings, pricing, itinerary data, auto-maintained rating |
| `Booking` | Draft → confirmed → checked-in/out lifecycle, traveler details, auto-generated booking number |
| `Review` | One rating+review per user per package (compound unique index), drives `Package.rating` |
| `Contact` | Support tickets with status and admin replies |
| `TripOption` | Destination / accommodation / room lookup rows that price the Custom Trip Architect |

---

## API Overview

REST endpoints are organized by resource, each behind role-appropriate middleware (`protect`, `authorize('Admin')`, or public):

| Resource | Base path | Highlights |
|---|---|---|
| Auth | `/api/auth` | Register, login (sets JWT cookie), logout, password update — rate-limited |
| Packages | `/api/packages` | Public listing/filtering by type, Admin CRUD + image upload |
| Bookings | `/api/bookings` | Draft → traveler details → confirm, cancellation, trip options for the Architect |
| Reviews | `/api/reviews` | Create/edit/delete, auto-triggers rating recalculation |
| Users | `/api/users` | Profile self-service + Admin user management |
| Contact | `/api/contact` | Ticket submission, status tracking, Admin replies |
| Admin | `/api/admin` | Dashboard KPIs and recent-activity feed |
| External | `/api/external` | Weather (OpenWeatherMap) and currency conversion, both keyless-fallback-safe |

Every form and admin action in the UI calls these endpoints via `fetch()` and updates the page without a full reload.

---

## Deployment

The app is served over **HTTPS** on **[Render](https://render.com)**, with data on **MongoDB Atlas** and media on **Cloudinary** — both already off-server, so the app container itself is fully stateless and disposable.

It was originally deployed on **Railway**; that move to Render happened because Railway's "free tier" turned out to be a 30-day trial rather than an ongoing free plan. Since the app was already 12-factor-friendly (all state in Atlas/Cloudinary, config via environment variables, no local disk dependency), the migration was a same-day swap: point a new host at the same repo, copy over the same environment variables, and redeploy — no code changes required.

---

## Getting Started

```bash
git clone <repo-url>
cd beyond-the-pyramids
npm install
cp .env.example .env   # fill in MONGO_URL, JWT_SECRET, CLOUDINARY_*, OPENWEATHER_API_KEY
npm run dev             # or: npm start
```

Open **http://localhost:3000**. `.env.example` lists every variable the app reads, with free-tier signup links for MongoDB Atlas, Cloudinary, and OpenWeatherMap in the comments there.

---

*Originally built for SWE230 (Web Application Programming), then taken further and deployed independently.*
