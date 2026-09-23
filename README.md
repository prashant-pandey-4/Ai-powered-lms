
<div align="center">

# 🔥 SkillUP — AI-Powered LMS

### *A Structured, AI-Powered Learning Experience*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-skillup--ailms.vercel.app-f97316?style=for-the-badge&logo=vercel&logoColor=white)](https://skillup-ailms.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%20AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Clerk Auth](https://img.shields.io/badge/Clerk%20Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)

<p align="center">
  <strong>SkillUP</strong> is a production-grade, zero-paywall Open-Source Learning Management System (LMS) designed for software engineers. It features curated computer science video curricula, an in-player 24/7 <strong>Google Gemini AI Coding Mentor</strong> grounded in the active lecture, progress tracking, and downloadable technical notes.
</p>

[🌐 Live Platform](https://skillup-ailms.vercel.app) • [📖 Documentation](#table-of-contents) • [⚡ Quickstart](#getting-started) • [🛠️ Tech Stack](#tech-stack)

</div>

---

## 📸 Key Highlights

- **🤖 24/7 In-Player AI Mentor**: Powered by Google Gemini Flash. It understands the exact concepts being taught in the active video episode and resolves programming doubts instantly.
- **📚 Curated Engineering Tracks**: Structured roadmaps across Data Structures & Algorithms, Fullstack Development, Backend Engineering, System Design, and DevOps.
- **🎓 Student Learning Room**: Dedicated progress tracking, episode checklists, and instant 1-click lecture resume.
- **🌗 Obsidian & Glowing Amber Theme**: Tailored sleek dark & light mode with high-contrast accessibility tokens.
- **🛡️ Secure Clerk Authentication**: Zero-friction sign-in with auto-synced PostgreSQL student profiles.
- **🛠️ Dedicated Admin Studio**: Full course lifecycle management, video extractor, and technical blog publisher.

---

## 🏗️ Architecture Overview

```
                        ┌────────────────────────┐
                        │   Browser Client       │
                        │   (Next.js 16 / React) │
                        └──────────┬─────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
     ┌──────────────────────┐             ┌──────────────────────┐
     │  Vercel Frontend     │             │  Clerk Auth Engine   │
     │  (skillup-ailms)     │             │  (JWT / Sessions)    │
     └──────────┬───────────┘             └──────────┬───────────┘
                │ REST API                           │
                ▼                                    │
     ┌───────────────────────────────────────────────┴──────────┐
     │  Render Backend (Express 5 + TypeScript)                 │
     │  ├── Course & Lecture Controllers                        │
     │  ├── Enrollment & Progress Tracker                       │
     │  └── Google Gemini AI Engine (Dynamic Fallback)          │
     └──────────┬─────────────────────────────┬─────────────────┘
                ▼                             ▼
     ┌──────────────────────┐     ┌──────────────────────┐
     │  Neon PostgreSQL     │     │  Google Gemini       │
     │  (Prisma ORM Server) │     │  (1.5 / 2.0 Flash)   │
     └──────────────────────┘     └──────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & State**: React 19, TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables Design System (HSL tokens)
- **Icons & Polish**: Lucide React, Sonner (Minimal Toasts)
- **Authentication**: `@clerk/nextjs`
- **Hosting**: [Vercel](https://vercel.com/)

### Backend
- **Runtime**: Node.js & Express 5 (TypeScript)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [Neon](https://neon.tech/) (Serverless Cloud PostgreSQL)
- **AI Integration**: `@google/generative-ai` (Gemini with multi-model fallback)
- **Auth Middleware**: `@clerk/express` & `svix`
- **Validation**: Zod
- **Hosting**: [Render](https://render.com/)

---

## 📂 Project Structure

```bash
Ai-powered-lms/
├── frontend/               # Next.js 16 Client Application
│   ├── app/                # App Router Pages
│   │   ├── page.tsx        # Smart Switcher (Landing vs Home)
│   │   ├── landing/        # Standalone Public Landing Page
│   │   ├── courses/        # Course Catalog & Detail [courseId]
│   │   │   └── [id]/learn/ # Classroom Player + AI Tutor Chat
│   │   ├── dashboard/      # Enrolled Tracks & Progress
│   │   └── admin/          # Admin Management Studio
│   ├── components/         # UI Components, App Shell & Sidebars
│   ├── lib/                # API Client & Utility Functions
│   └── public/             # Transparent Mascot & Assets
│
├── backend/                # Express + TypeScript REST API
│   ├── prisma/             # Database Schema & Migrations
│   │   └── schema.prisma   # PostgreSQL Models (User, Course, Lecture, etc.)
│   └── src/
│       ├── config/         # Environment, Prisma & Gemini Setup
│       ├── controllers/    # Route Business Logic (Courses, AI, Enrollment)
│       ├── middleware/     # Clerk Auth, Role Guards & Error Handler
│       └── routes/         # Express API Route Declarations
```

---

## ⚡ Getting Started Locally

### Prerequisites
- Node.js >= 18.x
- npm or pnpm
- A free [Neon](https://neon.tech/) PostgreSQL Database
- A [Clerk](https://clerk.com/) account
- A [Google Gemini API Key](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/prashant-pandey-4/Ai-powered-lms.git
cd Ai-powered-lms
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your-neon-postgres-connection-string"

CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:3000"
ADMIN_EMAIL="your-email@gmail.com"
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

Start the backend:
```bash
npm run dev
# Server running on http://localhost:5000
```

---

### 3. Configure Frontend
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_ADMIN_EMAIL="your-email@gmail.com"
```

Start the frontend:
```bash
npm run dev
# App running on http://localhost:3000
```

---

## 🚀 Deployment Guide

### Deploying Backend to Render
1. Create a **New Web Service** on [Render](https://render.com).
2. Set Root Directory to `backend`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm run start`
5. Add all Backend Environment Variables.

### Deploying Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (`https://your-api.onrender.com/api`) *(Type: Config)*
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_...`
   - `CLERK_SECRET_KEY`: `sk_...`
4. Hit **Deploy**!

---

## 🌟 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help make computer science education accessible to everyone.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for passionate developers worldwide.</sub>
</div>
```
