# Beyond the Pyramids — Backend API

Node.js + Express.js + MongoDB backend for the Beyond the Pyramids tourism website.  
Course: SWE230 — Web Application Programming | Spring 2026

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (running locally on port 27017)

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` — the defaults work for local development:
```
MONGO_URL=mongodb://localhost:27017/beyondpyramids
PORT=3000
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

### 3. Seed the database
```bash
npm run seed
```
This creates 14 users, 9 packages, 8 bookings, 8 reviews, and 8 support tickets.

### 4. Start the server
```bash
npm run dev      # development (nodemon auto-restart)
npm start        # production
```

Open **http://localhost:3000** — the full website loads with real data from MongoDB.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Tourist | user@egypt.com | user123 |
| Admin | admin@egypt.com | admin123 |
| Planner | planner@egypt.com | planner123 |
| Booking Manager | booking@egypt.com | booking123 |
| Customer Support | support@egypt.com | support123 |

---

## Project Structure

```
backend/
├── app.js              # Express app setup (middleware + routes)
├── server.js           # HTTP server + MongoDB connection
├── config/
│   └── db.js           # Mongoose connection
├── controllers/        # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── packageController.js
│   ├── bookingController.js
│   ├── reviewController.js
│   ├── contactController.js
│   ├── adminController.js
│   └── pageController.js   # EJS page rendering
├── middleware/
│   ├── auth.js             # JWT protect middleware
│   ├── authorize.js        # RBAC role check
│   ├── errorHandler.js     # Global error handler (4-arg)
│   ├── validate.js         # express-validator chains
│   └── upload.js           # multer config
├── models/
│   ├── User.js
│   ├── Package.js
│   ├── Booking.js
│   ├── Review.js
│   ├── Contact.js
│   └── CustomTrip.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── packageRoutes.js
│   ├── bookingRoutes.js
│   ├── reviewRoutes.js
│   ├── contactRoutes.js
│   ├── adminRoutes.js
│   └── pageRoutes.js
├── seeds/
│   └── seed.js
├── utils/
│   ├── AppError.js
│   ├── catchAsync.js
│   ├── generateToken.js
│   └── apiFeatures.js
├── views/              # EJS templates (all HTML pages converted)
│   ├── index.ejs
│   ├── auth/
│   ├── packages/
│   ├── bookings/
│   ├── user/
│   ├── reviews/
│   ├── admin/
│   └── errors/
└── uploads/            # Multer file storage
```

---

## REST API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Public | Logout (clears JWT cookie) |
| GET | `/api/auth/me` | Protected | Get current user |
| PUT | `/api/auth/update-password` | Protected | Change password |

**Login response:**
```json
{
  "status": "success",
  "token": "eyJ...",
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "Tourist" }
  }
}
```

---

### Packages — `/api/packages`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/packages` | Public | List packages (filter: `?type=day\|week\|single`) |
| GET | `/api/packages/:id` | Public | Get single package |
| POST | `/api/packages` | Admin/Planner | Create package |
| PUT | `/api/packages/:id` | Admin/Planner | Update package |
| DELETE | `/api/packages/:id` | Admin | Soft-delete package |
| POST | `/api/packages/:id/image` | Admin/Planner | Upload package image |

---

### Bookings — `/api/bookings`

Two-phase booking flow: **draft → confirm**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings/draft` | Tourist | Create draft booking |
| GET | `/api/bookings/draft/:id` | Owner | Get draft booking |
| PUT | `/api/bookings/draft/:id` | Owner | Add traveller details |
| PUT | `/api/bookings/draft/:id/confirm` | Owner | Confirm & pay |
| GET | `/api/bookings` | Tourist | My confirmed bookings |
| GET | `/api/bookings/:id` | Owner/Admin | Get booking details |
| PUT | `/api/bookings/:id/cancel` | Owner/Admin | Cancel booking |

---

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin+ | Dashboard statistics |
| GET | `/api/admin/activity` | Admin+ | Recent 10 bookings |
| GET | `/api/admin/bookings` | Admin/BM | All bookings (paginated) |
| PATCH | `/api/admin/bookings/:id/status` | Admin/BM | Update booking status |
| GET | `/api/admin/users` | Admin | All users |

---

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | Tourist | Get my profile |
| PUT | `/api/users/profile` | Tourist | Update my profile |
| PUT | `/api/users/avatar` | Tourist | Upload avatar |
| DELETE | `/api/users/account` | Tourist | Delete my account |
| GET | `/api/users` | Admin | All users |
| PATCH | `/api/users/:id/status` | Admin | Suspend/activate user |
| PATCH | `/api/users/:id/role` | Admin | Change user role |
| DELETE | `/api/users/:id` | Admin | Delete user |

---

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | Tourist | Submit review |
| GET | `/api/reviews/package/:packageId` | Public | Reviews for a package |
| PUT | `/api/reviews/:id` | Owner | Edit review |
| DELETE | `/api/reviews/:id` | Owner/Admin | Delete review |

---

### Contact — `/api/contact`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | Public | Submit support ticket |
| GET | `/api/contact` | Admin/Support | List all tickets |
| PATCH | `/api/contact/:id/status` | Admin/Support | Update ticket status |

---

## Page Routes (EJS)

| URL | Page | Auth Required |
|-----|------|---------------|
| `/` | Landing page | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/packages/day` | Day packages | No |
| `/packages/week` | Week packages | No |
| `/packages/single` | Single locations | No |
| `/packages/:id` | Package details + booking | No |
| `/dashboard` | User dashboard | Tourist |
| `/profile` | User profile | Tourist |
| `/my-bookings` | My bookings | Tourist |
| `/booking/summary?draftId=` | Booking summary | Tourist |
| `/booking/travellers?draftId=` | Traveller details | Tourist |
| `/booking/:id` | Booking receipt | Tourist |
| `/reviews/write` | Write review | Tourist |
| `/custom-trip` | Custom trip builder | Tourist |
| `/admin` | Admin dashboard | Admin+ |
| `/admin/bookings` | Booking management | Admin/BM |
| `/contact` | Contact form | No |
| `/about` | About us | No |
| `/faq` | FAQ | No |
| `/terms` | Terms & Conditions | No |

---

## Architecture

- **MVC Pattern**: Models → Controllers → Views (EJS templates)
- **JWT Auth**: Token stored in httpOnly cookie (server) + localStorage (client)
- **RBAC**: Roles — Tourist, Admin, Planner, Booking Manager, Customer Support
- **Error Handling**: Centralized 4-argument middleware (as per course lectures)
- **Validation**: express-validator chains on all write endpoints
- **File Uploads**: multer with disk storage (2MB limit, images only)
