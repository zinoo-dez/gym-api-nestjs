# Gym Management Monorepo

A full-stack gym management system built with NestJS (backend) and React (frontend), managed as a pnpm workspace monorepo.

## Overview

This monorepo contains two workspaces:

- **Backend** (`backend`): NestJS REST API with PostgreSQL and Prisma ORM
- **Frontend** (`frontend`): React web application with Vite and TanStack Query

## Features

### Backend

- JWT-based authentication with role-based access control
- Member, trainer, class, attendance, payment, and membership management
- Prisma ORM with PostgreSQL
- Swagger/OpenAPI documentation

### Frontend

- Role-based dashboards (admin, member, trainer, staff)
- React Router + TanStack Query
- Tailwind CSS based UI

### Roadmap (Upcoming)

#### 4. Inventory & Product Sales

- Sell supplements, merchandise, and protein shakes
- Point of Sale (POS) integration
- Stock management
- Low stock alerts
- Sales reports

## Prerequisites

- **Node.js** 18 or higher
- **pnpm** 10 or higher
- **PostgreSQL** 14 or higher

Install pnpm if needed:

```bash
npm install -g pnpm@10
```

## Getting Started

### 1. Install Dependencies

From the repo root:

```bash
pnpm install
```

### 2. Configure Environment Files

#### Backend

```bash
cd backend
cp .env.example .env
```

Example required values:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gym_api"
JWT_SECRET="your-secret-key"
PORT=3000
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://localhost:3001"
```

#### Frontend

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Set Up Database

From the repo root:

```bash
pnpm prisma:generate
pnpm prisma:migrate
npm --prefix backend run prisma:seed
```

## Development

### Run Servers

```bash
# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend

# Both
pnpm dev
```

Default URLs:

- Backend API: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`
- Frontend app: `http://localhost:5173`

### Useful Commands

```bash
# Lint backend + frontend
pnpm lint

# Build backend + frontend
pnpm build

# Build only one workspace
pnpm build:backend
pnpm build:frontend
```

## Project Structure

```text
.
├── backend/                 # NestJS API
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/                # React app (Vite)
│   ├── src/
│   └── package.json
├── pnpm-workspace.yaml      # Workspace list (backend, frontend)
├── package.json             # Root scripts
└── README.md
```

## Troubleshooting

### Backend database connection errors

Verify PostgreSQL is running and `backend/.env` has a valid `DATABASE_URL`.

### Frontend cannot call API

Check:

1. Backend is running on port `3000` (or your configured `PORT`)
2. `frontend/.env` uses the same backend base URL
3. Backend `CORS_ORIGINS` includes your frontend origin

### Port already in use

```bash
# Backend (3000)
lsof -ti:3000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Dependency/cache issues

```bash
rm -rf node_modules backend/node_modules frontend/node_modules pnpm-lock.yaml
pnpm install
```

### Prisma client out of sync

```bash
pnpm prisma:generate
```

## Default Seed Credentials

After running `npm --prefix backend run prisma:seed`:

- Admin: `admin@gym.com` / `Password123!`
- Trainer: `john.trainer@gym.com` / `Password123!`
- Member: `alice.member@gym.com` / `Password123!`

## Additional Resources

- [Backend documentation](backend/README.md)
- [Frontend documentation](frontend/README.md)
- [pnpm workspaces](https://pnpm.io/workspaces)

## License

MIT
