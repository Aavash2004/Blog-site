# Our Nepal

A modern full-stack web application for stories, culture, travel, and experiences across Nepal. Built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and PostgreSQL.

## Getting Started

### 1. Database Setup

This project uses PostgreSQL (via Neon in production or Docker Compose locally).

To start a local PostgreSQL database using Docker:

```bash
docker compose up -d
```

This will run PostgreSQL on `localhost:5432` with database `ournepal_db`, user `postgres`, and password `postgrespassword`.

Configure your `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/ournepal_db
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string (Neon or local Docker).
- `JWT_SECRET`: Minimum 32-character secret for signing session tokens.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads.

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Admin Bootstrap

To promote an existing registered user to `admin`, run the seed script:

```bash
pnpm run seed:admin <email>
```

