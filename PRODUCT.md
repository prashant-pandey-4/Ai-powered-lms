# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Primary: Tech & engineering students, self-taught developers, and professionals upskilling in modern software development (Frontend, Backend, System Design, DevOps, AI).
- Secondary: Course instructors and creators authoring structured video curriculums, uploading resources, and managing students.

## Product Purpose
SkillUP is a full-featured AI-powered learning management platform that provides structured video courses, downloadable lesson reference materials, live calendar scheduling, and instant 24/7 AI tutor doubt-solving grounded in specific course syllabi.

## Positioning
Unlike generic video-hosting sites or disconnected MOOCs, SkillUP integrates a context-aware Gemini AI tutor right inside the video learning player that knows the exact lecture and course syllabus, answering student doubts with zero latency.

## Operating Context
- Students watch video lessons, mark progress, take notes, and clear doubts simultaneously in split-view studios.
- Instructors create multi-lesson courses, upload unlisted video modules, set pricing (Free / Paid via Razorpay), and view student analytics.
- Web-first responsive desktop & mobile layout with high-contrast matte dark aesthetic and purposeful design hierarchy.

## Capabilities and Constraints
- **Video Player**: YouTube embedded player with sequential playlist navigation and completion status tracking.
- **AI Doubt Tutor**: Gemini Flash 1.5/2.0 API integration with course syllabus context injection and chat history.
- **Authentication**: Clerk SDK (Email, Social OAuth, session tokens).
- **Database & Backend**: Express.js + PostgreSQL (Neon Serverless) + Prisma ORM.
- **Payments**: Razorpay gateway integration for paid courses.

## Brand Commitments
- **Name**: SkillUP
- **Aesthetic**: Modern Matte Dark Canvas (`#0d0d10`), Clean Elevated Cards (`#16161a`), Electric Lime Accent (`#d4f76d`) used with restraint on active tabs and primary CTA, with crisp typography hierarchy.
- **Tone**: Focused, empowering, technical, modern engineering platform.

## Evidence on Hand
- Full backend API with Course CRUD, Lecture Management, Enrollment tracking, and AI Doubt endpoints in `backend/src/`.
- Next.js 16 App Router frontend with complete routes for Dashboard, Library, Course Details, Video Player Studio, and Instructor Studio in `frontend/app/`.

## Product Principles
1. **Active Comprehension over Passive Watching**: Every video lesson is paired with immediate AI doubt clarification and downloadable reference notes.
2. **Scanability & Ergonomic Focus**: Dark matte interface designed to reduce visual fatigue during long learning sessions.
3. **No Fluff or Fake Placeholders**: Clean, functional data representation with purposeful progress tracking.
