# EventForge Backend API

EventForge is a robust corporate event and conference management platform REST API built with Node.js, Express.js, MongoDB, and Mongoose.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Token), bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** express-validator
- **Testing:** Jest + Supertest
- **AI Service:** Integrated AI service abstraction with fallback mock implementation

---

## Architecture Overview

```text
server/
├── src/
│   ├── config/             # Database & environment variables configuration
│   ├── controllers/        # Request handling logic
│   ├── middleware/         # Auth, role authorization & error handling
│   ├── models/             # 24 Mongoose schemas & indexes
│   ├── routes/             # Express API routes (/api/v1/...)
│   ├── services/           # Business logic (AI, Conflicts, Recommendations, Auth)
│   ├── validators/         # Request input validation rules
│   ├── utils/              # Custom Error classes & Response helpers
│   ├── seed/               # Database seeder script
│   ├── app.js              # Express app setup & middleware pipeline
│   └── server.js           # HTTP server listener
├── tests/                  # Automated integration tests
├── .env.example            # Environment variables template
├── package.json
└── README.md
```

---

## Core Application Roles

1. `PLATFORM_ADMIN`: Full system administrative access.
2. `EVENT_ORGANIZER`: Manages assigned events, sessions, venues, sponsors, ticket types, and announcements.
3. `EVENT_STAFF`: Manages attendee check-ins, QR scanning, session attendance, and operational support.
4. `SPEAKER`: Manages speaker profiles, presentation materials, and views assigned sessions.
5. `ATTENDEE`: Browses events, registers for tickets, views agenda, submits feedback, and receives AI recommendations.
6. `SPONSOR`: Manages sponsor profile, deliverables, and views sponsorship packages.

### Event-Scoped Authorization
User authorization is enforced both at the platform level (`User.role`) and at the event level (`EventMember` model). A user can be an **Organizer** of Event A, **Staff** of Event B, and an **Attendee** of Event C.

---

## Installation & Setup Instructions

1. **Clone & Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Environment Variables:**
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/eventforge
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   AI_API_KEY=your_optional_openai_or_gemini_key
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Seed Database:**
   Populate realistic initial development data:
   ```bash
   npm run seed
   ```

   **Default Seeded Login Credentials:**
   - **Platform Admin:** `admin@eventforge.dev` / `admin123`
   - **Event Organizer:** `organizer@eventforge.dev` / `organizer123`
   - **Event Staff:** `staff@eventforge.dev` / `staff123`
   - **Attendee:** `attendee@eventforge.dev` / `attendee123`

5. **Start Server:**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

6. **Run Tests:**
   ```bash
   npm test
   ```

---

## API Endpoints Overview

All endpoints use the `/api/v1` base URL.

| Route Group | Base Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | Register, Login, Logout, Current User (`/me`) |
| **Users** | `/api/v1/users` | User management |
| **Organizations** | `/api/v1/organizations` | Organization & Member management |
| **Events** | `/api/v1/events` | Event CRUD, publishing & event-scoped permissions |
| **Event Members** | `/api/v1/event-members` | Event-scoped user roles & permissions |
| **Venues** | `/api/v1/venues` | Physical venues |
| **Rooms** | `/api/v1/rooms` | Venue rooms |
| **Sessions** | `/api/v1/sessions` | Session management with Room & Speaker conflict detection |
| **Speakers** | `/api/v1/speakers` | Speaker profiles & materials |
| **Sponsors** | `/api/v1/sponsors` | Sponsor profiles |
| **Sponsorship Packages**| `/api/v1/sponsorship-packages` | Customizable sponsorship tiers |
| **Sponsor Assignments**| `/api/v1/sponsor-assignments` | Sponsor package allocation & deliverable tracking |
| **Ticket Types** | `/api/v1/ticket-types` | Early Bird, Regular, VIP ticket tiers |
| **Coupons** | `/api/v1/coupons` | Percentage & fixed discount coupons with usage validation |
| **Registrations** | `/api/v1/registrations` | Registration workflow with capacity check, coupon & ticket creation |
| **Tickets** | `/api/v1/tickets` | Ticket retrieval & unique QR codes |
| **Waitlists** | `/api/v1/waitlists` | Capacity waitlist management |
| **Check-Ins** | `/api/v1/checkins` | QR-based ticket scanning & validation |
| **Session Attendance**| `/api/v1/session-attendance` | Session check-ins and attendance records |
| **Staff Assignments** | `/api/v1/staff-assignments` | Staff responsibilities & room allocations |
| **Announcements** | `/api/v1/announcements` | Audience-targeted announcements |
| **Feedback** | `/api/v1/feedback` | Session ratings (1-5) and attendee comments |
| **Analytics** | `/api/v1/analytics` | MongoDB aggregation pipelines for Event, Session & Sponsor stats |
| **AI Content** | `/api/v1/ai` | AI-assisted descriptions, speaker bios, announcements & summaries |
| **Recommendations** | `/api/v1/recommendations` | Personalized attendee session recommendations |

---

## AI Features & Recommendations
- AI service (`src/services/aiService.js`) generates draft content (descriptions, speaker bios, announcements, session summaries). If `AI_API_KEY` is not present, it provides a clean mock implementation.
- Recommendation service (`src/services/recommendationService.js`) scores session relevance based on attendee interests, session tags, and event popularity.

---

## License
MIT License.
