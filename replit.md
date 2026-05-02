# Priority Banking Management System (PBMS)

## Overview

A full-stack React + Express web application for Priority Banking Management. Built for Bank Asia's Relationship Managers to manage customers, service requests, appointments, tasks, and reporting.

## Architecture

- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4 + React Router v7
- **Backend**: Express 5 (TypeScript via `tsx`) serving both API routes and the Vite dev middleware
- **Database**: Firebase Firestore (project: `gen-lang-client-0330716857`)
- **Auth**: Firebase Authentication (client-side, email/password)
- **AI**: Google Gemini API (`@google/genai`)

## Project Structure

```
/
├── server.ts          # Express server with API routes + Vite middleware
├── vite.config.ts     # Vite config (host: 0.0.0.0, port: 5000, allowedHosts: true)
├── firebase-applet-config.json  # Firebase client config
├── src/
│   ├── App.tsx        # Root app with auth guard and routing
│   ├── main.tsx       # React entry point
│   ├── index.css      # Global styles
│   ├── components/    # Shared UI components (Layout, etc.)
│   ├── views/         # Page-level components (Dashboard, UserManagement, etc.)
│   └── lib/           # Utilities (ThemeContext, etc.)
```

## Key Features

- **Dashboard**: Overview metrics and widgets
- **User Management**: RBAC-based staff/user administration
- **Customer Management**: Customer profiles and data
- **Service Requests**: Banking service workflow management
- **Appointments**: Calendar-based RM visit scheduling
- **Task Management**: Task tracking and assignment
- **Reports**: Analytics and reporting
- **Bill Management**: Bill tracking
- **SMS Gateway**: SMS notifications
- **System Setup**: Configuration and parameter entry

## API Endpoints

- `POST /api/v1/users/onboard` — Onboard new staff with temp credentials
- `POST /api/v1/users/reset-password` — Admin-triggered password reset
- `GET /api/v1/users/:staffId/rights` — Fetch RBAC rights for a staff member

## Dev Server

- Runs on port `5000` (both frontend and backend via Express + Vite middleware)
- Start: `npm run dev` (uses `tsx server.ts`)
- The server listens on `0.0.0.0:5000`

## Environment Variables

See `.env.example`:
- `NODE_ENV` — development or production
- `PORT` — defaults to 5000
- `GEMINI_API_KEY` — Google Gemini API key (optional)

## Deployment

- Target: `autoscale`
- Build: `npm run build`
- Run: `npx tsx server.ts`
