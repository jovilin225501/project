# EcoTrack — Smart Waste Management and Recycling Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-047857?style=for-the-badge&logo=mongodb)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/Tests-19%20Passing-10b981?style=for-the-badge)](https://github.com)
[![Node.js](https://img.shields.io/badge/Node.js-v24.x-064e3b?style=for-the-badge&logo=node.js)](https://nodejs.org)

> A modern, production-minded MERN stack platform that connects civic residents with municipal waste collection operations, introduces on-demand recyclable pickups, and rewards sustainable actions through a transparent community points ledger.

---

## 1. Problem Statement

Rapid urbanization and expanding consumer packaging have placed immense pressure on municipal waste collection systems. Common challenges include:
- **Lack of Civic Reporting Channels**: Residents encounter illegal dumping, overflowing bins, and hazardous waste without an easy, accountable way to notify authorities.
- **Low Recycling Participation**: Conventional recycling programs lack incentives, leaving citizens disengaged from sorting and disposal best practices.
- **Operational Inefficiencies**: Municipal dispatchers operate without real-time visibility into neighborhood waste hot spots, resulting in delayed hazardous waste cleanup.
- **Absence of Auditability**: Waste reports lack transparent chronological tracking, leaving residents unaware of whether their concerns were addressed.

---

## 2. Project Objectives

- **Connect Residents with Municipal Dispatch**: Provide an intuitive digital interface to report waste with GPS coordinates, photos, urgency levels, and categories.
- **Introduce Doorstep Collection**: Enable on-demand scheduling for bulky recyclables and electronic waste (e-waste).
- **Gamify Recycling**: Reward verified waste reporting and collections with points, community tier badges, and a neighborhood leaderboard.
- **Provide Actionable Operations Analytics**: Give municipal administrators real-time KPI metrics, Recharts visual breakdowns (category, status, monthly trends), and collector dispatch management.
- **Adhere to Production Engineering Standards**: Implement JWT security, role-based access control (RBAC), express-validator schema enforcement, rate-limiting, and 100% automated test coverage.

---

## 3. Architecture & Data Flow

```mermaid
graph TD
    Client["Vite + React 18 Frontend\n(Tailwind CSS, Recharts, Lucide)"]
    API["Express.js REST API Server\n(Helmet, CORS, Rate Limiting, JWT)"]
    AuthMW["Auth & Role Middleware\n(Bearer Token, Resident vs Admin)"]
    Validators["Input Validation Middleware\n(express-validator)"]
    Uploads["Local Upload Storage\n(/uploads - Multer disk storage)"]
    Atlas[("MongoDB Atlas Database\n(Mongoose ORM)")]

    Client -->|HTTP / JSON Requests| API
    Client -->|Multipart/Form-Data| Uploads
    API --> Validators
    Validators --> AuthMW
    AuthMW --> Atlas

    subgraph Database Collections
        Atlas --> Users["users"]
        Atlas --> WasteReports["wasteReports"]
        Atlas --> Pickups["pickupRequests"]
        Atlas --> Rewards["rewardTransactions"]
    end
```

---

## 4. Key Features

### For Residents
- **Interactive Sustainability Dashboard**: Live stats summary, recent report history, upcoming scheduled pickups, and recycling tier progress.
- **Waste Reporting Module**:
  - Categories: *Plastic, Paper, Glass, Organic, Electronic, Mixed*.
  - Urgency ratings: *Low, Medium, High, Critical*.
  - Geolocation helper (auto-detect current coordinates or type address).
  - Photographic evidence upload (PNG, JPG, WebP with preview).
- **My Reports Management**: Filter by status, category, urgency; search title/address; pagination; edit/delete pending reports.
- **Chronological Status Timeline**: View real-time municipal updates with timestamps, officer notes, and assigned collection crews.
- **On-Demand Doorstep Pickups**: Schedule time windows (`08:00 AM - 11:00 AM`, `11:00 AM - 02:00 PM`, etc.) with special pickup notes.
- **Recycling Rewards & Leaderboard**:
  - Transparent points policy.
  - Tier levels: *Eco Novice (0-99), Eco Advocate (100-249), Green Champion (250-499), Earth Guardian (500+)*.
  - Community leaderboard ranking top 20 civic contributors.
  - Complete immutable audit ledger of earned points.
- **Profile & Security**: Manage phone, address, and update password with current credential validation.

### For Municipal Administrators
- **Operations Analytics Dashboard**:
  - Total users, submitted reports, pending actions, active pickups, and completion rate %.
  - **Recharts Donut/Pie Chart**: Recyclable volume grouped by category.
  - **Recharts Bar Chart**: Reports distributed across lifecycle stages.
  - **Recharts Area Chart**: 6-month historical collection trends.
  - Live activity feed showing incoming reports and requests.
- **Report Lifecycle Management**:
  - Full report table with search and filters.
  - Update status: `Pending` → `Approved` → `Assigned` → `In Progress` → `Completed` / `Rejected`.
  - Assign vehicle units and field personnel.
  - Add administrative notes to public timelines.
  - **Automatic Reward Trigger**: Setting status to `Completed` automatically awards points to the resident and writes an audit transaction.
- **User Management**:
  - Search and filter all registered users.
  - Audit points and report counts per user.
  - Activate or suspend user accounts (with self-deactivation protection).

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js (v24+), Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `dotenv` |
| **Security** | `helmet`, `cors`, `express-rate-limit`, `express-validator`, input sanitization |
| **Database** | MongoDB Atlas (Cloud Managed NoSQL) |
| **Testing** | Vitest, React Testing Library, Supertest, `mongodb-memory-server` |

---

## 6. Project Folder Structure

```
project/
├── client/                      # React + Vite Frontend
│   ├── public/                  # Static web assets
│   ├── src/
│   │   ├── components/
│   │   │   └── common/          # Navbar, Sidebar, Footer, Badge, LoadingSkeleton, EmptyState, ProtectedRoute
│   │   ├── context/             # AuthContext, NotificationContext (Toast)
│   │   ├── layouts/             # MainLayout (responsive sidebar & topbar)
│   │   ├── pages/               # 14 complete application pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ResidentDashboard.jsx
│   │   │   ├── ReportWastePage.jsx
│   │   │   ├── MyReportsPage.jsx
│   │   │   ├── ReportDetailsPage.jsx
│   │   │   ├── PickupRequestsPage.jsx
│   │   │   ├── RewardsLeaderboardPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminReportsPage.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   ├── ProfileSettingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/            # Centralized Axios API client & endpoints
│   │   ├── tests/               # Vitest + React Testing Library component tests
│   │   ├── App.jsx              # Application router
│   │   ├── index.css            # Tailwind design system tokens
│   │   └── main.jsx             # React DOM root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                      # Express.js REST API Server
│   ├── src/
│   │   ├── config/              # db.js (Atlas Mongoose), constants.js, multer.js
│   │   ├── controllers/         # auth, user, report, pickup, reward, admin controllers
│   │   ├── middleware/          # authMiddleware, roleMiddleware, rateLimiter, errorMiddleware, validationMiddleware
│   │   ├── models/              # User, WasteReport, PickupRequest, RewardTransaction
│   │   ├── routes/              # auth, user, report, pickup, reward, admin, health routes
│   │   ├── services/            # rewardService (points engine & audit ledger)
│   │   ├── tests/               # Supertest + Vitest automated API test suite (14 tests)
│   │   ├── utils/               # seedData.js, createAdmin.js
│   │   ├── app.js               # Express application setup & middleware stack
│   │   └── server.js            # Server entry point & graceful shutdown
│   ├── uploads/                 # Local image upload storage
│   ├── package.json
│   └── vitest.config.js
├── docs/
│   └── INTERNSHIP_REPORT.md     # Academic and Internship project documentation
├── .env.example                 # Root environment template
├── .gitignore                   # Security exclusion rules
├── README.md                    # Platform documentation
└── package.json                 # Monorepo root script coordinator
```

---

## 7. MongoDB Data Models

### User (`User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false }, // bcrypt hash
  role: { type: String, enum: ['resident', 'admin'], default: 'resident' },
  points: { type: Number, default: 0, min: 0 },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### WasteReport (`WasteReport.js`)
```javascript
{
  title: { type: String, required: true, maxlength: 120 },
  category: { type: String, enum: ['plastic', 'paper', 'glass', 'organic', 'electronic', 'mixed'], required: true },
  description: { type: String, required: true, maxlength: 1000 },
  location: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['Pending', 'Approved', 'Assigned', 'In Progress', 'Completed', 'Rejected'], default: 'Pending' },
  resident: { type: ObjectId, ref: 'User', required: true, index: true },
  assignedCollector: { type: String, default: '' },
  pointsAwarded: { type: Boolean, default: false },
  pointsAmount: { type: Number, default: 0 },
  statusHistory: [
    {
      status: String,
      updatedBy: { type: ObjectId, ref: 'User' },
      note: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### PickupRequest (`PickupRequest.js`)
```javascript
{
  resident: { type: ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['plastic', 'paper', 'glass', 'organic', 'electronic', 'mixed'], required: true },
  address: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  instructions: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Assigned', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  assignedCollector: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date
}
```

### RewardTransaction (`RewardTransaction.js`)
```javascript
{
  resident: { type: ObjectId, ref: 'User', required: true, index: true },
  points: { type: Number, required: true },
  type: { type: String, enum: ['waste_report', 'pickup_collection', 'bonus', 'adjustment'], default: 'waste_report' },
  referenceId: { type: ObjectId, default: null },
  referenceType: { type: String, enum: ['WasteReport', 'PickupRequest', 'Manual'] },
  description: { type: String, required: true },
  createdAt: Date
}
```

---

## 8. API Endpoints Documentation

### Health & Information
- `GET /api/health` — Public health-check displaying uptime, database connectivity state without credentials.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a resident account (`role` strictly enforced to resident).
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Authenticated user details.

### Profile (`/api/users`)
- `GET /api/users/me` — Profile with participation stats.
- `PATCH /api/users/me` — Update name, phone, address.
- `POST /api/users/change-password` — Change password.

### Waste Reports (`/api/reports`)
- `POST /api/reports` — Submit report with optional multipart image upload.
- `GET /api/reports` — Paginated search, category, status, and urgency filter.
- `GET /api/reports/:id` — Full report details & status history.
- `PATCH /api/reports/:id` — Update report (permitted only when status is `Pending`).
- `DELETE /api/reports/:id` — Delete report (permitted only when status is `Pending`).

### Pickup Requests (`/api/pickups`)
- `POST /api/pickups` — Schedule doorstep collection.
- `GET /api/pickups` — Get logged-in resident's pickup requests.
- `GET /api/pickups/:id` — Individual pickup details.
- `PATCH /api/pickups/:id` — Update or cancel pending pickup.

### Rewards (`/api/rewards`)
- `GET /api/rewards/me` — Current points, tier level, and full ledger.
- `GET /api/rewards/leaderboard` — Community top-20 recyclers ranking.

### Administration (`/api/admin` - Admin Only)
- `GET /api/admin/dashboard` — Analytics KPIs, Recharts datasets, and recent feed.
- `GET /api/admin/reports` — All municipal reports with advanced search.
- `PATCH /api/admin/reports/:id/status` — Change status, assign collector, add timeline log, and trigger points award.
- `GET /api/admin/users` — User directory.
- `PATCH /api/admin/users/:id/status` — Toggle user activation status.

---

## 9. Environment Setup & Configuration

### Prerequisites
- **Node.js**: v18.x, v20.x, or v24.x
- **npm**: v9.x or higher
- **MongoDB Atlas** account: Create a free M0 sandbox cluster on [MongoDB Cloud](https://www.mongodb.com/cloud/atlas).
  - Add your IP address or `0.0.0.0/0` in Atlas **Network Access**.
  - Create a Database User with read/write privileges in **Database Access**.

### Backend Configuration
Create a file at `server/.env` with your settings:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/ecotrack?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional default seed administrator credentials
ADMIN_NAME=EcoTrack Administrator
ADMIN_EMAIL=admin@ecotrack.org
ADMIN_PASSWORD=AdminPassword123!
```

### Frontend Configuration
Create a file at `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 10. Installation & Local Development Commands

### 1. Install Dependencies
Run from root:
```bash
npm run install:all
```
*(On Windows systems where PowerShell execution policy is restricted, use `npm.cmd run install:all`)*

### 2. Seed Demonstration Data (Optional but Recommended)
Populates demo accounts, reports across all categories and statuses, scheduled pickups, and reward points:
```bash
npm run seed
```

### 3. Run Development Servers
Start both backend (Port 5000) and frontend (Port 5173) concurrently:
```bash
npm run dev
```

Or run individually:
```bash
# Terminal 1 - Backend Server
npm run dev:server

# Terminal 2 - Frontend Client
npm run dev:client
```

Access the application in your browser at:
`http://localhost:5173`

---

## 11. Demonstration Accounts for Evaluation

EcoTrack provides 1-click test credentials on the `/login` page for fast evaluation:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Demo Resident** | `sarah.jenkins@example.com` | `Password123!` | Waste reporting, pickup booking, personal ledger, dashboard |
| **Demo Administrator** | `admin@ecotrack.org` | `AdminPassword123!` | Analytics overview, report review, crew dispatch, user management |

---

## 12. Automated Test Execution

EcoTrack features a comprehensive test suite covering backend REST endpoints and frontend components.

### Run Backend API Tests
Runs 14 self-contained integration tests with an in-memory MongoDB server:
```bash
npm run test:server
```
**Test Cases Covered**:
- `GET /api/health` status verification.
- User registration with duplicate email prevention.
- Privilege escalation block (residents cannot register as admins).
- Invalid login credential rejection.
- Protected route 401 rejection for unauthenticated requests.
- Role-based 403 access control on administrative endpoints.
- Administrator 200 access to dashboard analytics.
- Waste report input validation.
- Waste report creation with default `Pending` status.
- Report ownership isolation (Resident B cannot read/edit Resident A's report).
- Status transition rules (non-pending reports cannot be deleted by residents).
- Pickup request scheduling.
- Completion reward award and prevention of duplicate points.
- Community leaderboard ranking calculation.

### Run Frontend Component Tests
```bash
npm run test:client
```
**Test Cases Covered**:
- StatusBadge lifecycle state rendering.
- CategoryBadge category rendering.
- UrgencyBadge hazard level mapping.
- EmptyState UI actions.
- LandingPage hero elements and reward matrix rendering.

---

## 13. Image Storage Configuration

EcoTrack handles photographic evidence using a secure local storage approach powered by **Multer**:
- Uploads are saved into `server/uploads/` with randomized unique timestamps (`report-<timestamp>-<hash>.ext`).
- Only safe image mime-types (`image/jpeg`, `image/png`, `image/webp`) are accepted.
- Files larger than 5MB are rejected with structured error feedback.
- Static assets are securely served via Express static middleware with CORS cross-origin resource policy configured in Helmet.
- MongoDB documents store only the sanitized relative URL string (e.g. `/uploads/report-1234.jpg`) rather than bulky binary Blobs or Base64 payloads, keeping Atlas document sizes lightweight and performant.

For cloud deployments (AWS S3, Cloudinary), the Multer disk engine can be swapped seamlessly for an S3/Cloudinary storage adapter by updating `server/src/config/multer.js`.

---

## 14. Deployment Guide

### Frontend Deployment (Vercel / Netlify / Render Static)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add environment variable: `VITE_API_URL=https://your-backend-domain.com/api`
4. Add SPA fallback rewrites (e.g. `/*` to `/index.html`) so refreshing nested routes does not trigger 404s.

### Backend Deployment (Render / Railway / Fly.io / AWS EC2)
1. Root directory: `server`
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Environment variables to configure on the hosting dashboard:
   - `PORT=5000` (or host assigned `$PORT`)
   - `MONGODB_URI=mongodb+srv://...` (your Atlas production URI)
   - `JWT_SECRET=your_secure_random_key_min_32_chars`
   - `CLIENT_URL=https://your-frontend-domain.com`
   - `NODE_ENV=production`

---

## 15. Security Considerations

- **Password Hashing**: Uses `bcryptjs` with salt rounds = 10; plaintext passwords are never stored.
- **JWT Protection**: Tokens are signed with strong keys, carry expiration lifespans, and are verified via Express middleware.
- **Privilege Separation**: Administrator routes are guarded by both `protect` and `requireAdmin` middlewares.
- **Ownership Verification**: Database queries explicitly verify `report.resident === req.user._id`, preventing insecure direct object reference (IDOR) attacks.
- **Sanitized Logging**: Atlas connection strings have credentials automatically masked (`mongodb+srv://user:***@cluster...`) to prevent credential leakage in deployment logs.
- **Rate Limiting**: Auth endpoints limit brute-force attacks (max 30 requests per 15 min window); general API endpoints are capped at 300 requests per 15 min window.
- **HTTP Security Headers**: Powered by `helmet` with configured cross-origin resource policies.

---

## 16. Future Roadmap

- **Push Notifications / SMS**: Real-time notifications when a collector is within 15 minutes of doorstep pickup.
- **AI Waste Classification**: Integrated image recognition model to recommend the waste category and recyclability grade upon photo upload.
- **Offline PWA Support**: Service worker caching to enable offline report draft creation in low-connectivity areas.
- **Partner Reward Redemptions**: Integration with municipal partner vouchers (public transit discounts, utility bill credits).

---

## 17. Academic & Internship Evaluation Credits

This project was developed as a comprehensive full-stack capstone demonstration for **B.Tech Computer Science and Engineering** and the **ICTAK Full-Stack Developer Internship Evaluation**.

For in-depth project documentation, methodology, implementation activities, and evaluation findings, refer to [docs/INTERNSHIP_REPORT.md](file:///c:/Users/jovil/OneDrive/Desktop/project/docs/INTERNSHIP_REPORT.md).
