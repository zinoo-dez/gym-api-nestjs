# Gym Management Frontend

A React-based web application for managing gym operations including member registration, class scheduling, attendance tracking, and workout plan management.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Zod** - Runtime validation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
src/
├── api/          # API client and service functions
├── components/   # Reusable UI components
├── pages/        # Page components (route targets)
├── hooks/        # Custom React hooks
├── context/      # React Context providers
├── schemas/      # Zod validation schemas
└── utils/        # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure:

   ```bash
   cp .env.example .env
   ```

4. Update the `VITE_API_URL` in `.env` to point to your backend API

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: `http://localhost:3000/api`)

## Backend Integration

This frontend integrates with the `gym-api-nestjs` backend. Ensure the backend is running before starting the frontend application.

## Features

- User authentication (login/register)
- Member management
- Trainer management
- Class scheduling and booking
- Membership plan management
- Attendance tracking
- Workout plan management
- Responsive design for mobile, tablet, and desktop

## License

MIT
