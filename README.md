# EventForge 🎪

**Corporate Event & Conference Management Platform**

Full-stack event management application built with React (Vite) + Node.js/Express + MongoDB.

---

## 🗂 Project Structure

```
EventForge/
├── frontend/   # React + Vite (deploy to Vercel)
└── backend/    # Node.js + Express API (deploy to Render)
```

---

## 🚀 Deployment

### Backend → Render

1. Connect the GitHub repo to [Render](https://render.com)
2. Create a **New Web Service**, set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add these **Environment Variables** in the Render dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your Vercel frontend URL (e.g. `https://eventforge.vercel.app`) |

### Frontend → Vercel

1. Connect the GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add this **Environment Variable** in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://eventforge-api.onrender.com`) |

---

## 💻 Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run seed           # seed demo data
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Platform Admin | admin@eventforge.dev | admin123 |
| Organizer | organizer@eventforge.dev | organizer123 |
| Staff | staff@eventforge.dev | staff123 |
| Attendee | attendee@eventforge.dev | attendee123 |

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v7, Axios, Lucide Icons
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, express-validator
- **Database:** MongoDB (Atlas in production)
- **Deployment:** Vercel (frontend) + Render (backend)
- **Deployment link:https://event-forge-3yuu.vercel.app/events
