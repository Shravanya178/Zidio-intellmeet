# IntellMeet — Frontend

> AI-Powered Enterprise Meeting & Collaboration Platform  
> React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Folder Reference](#folder-reference)
- [Routing](#routing)
- [State Management](#state-management)
- [API & Data Fetching](#api--data-fetching)
- [Environment Variables](#environment-variables)
- [Naming Conventions](#naming-conventions)
- [Contributing](#contributing)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible UI component library |
| Zustand | Lightweight global state management |
| TanStack Query | Server state, caching & data fetching |
| Socket.io Client | Real-time WebSocket communication |
| WebRTC | Peer-to-peer video conferencing |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Backend server running (see `/backend/README.md`)

### Installation

```bash
# Clone the repo
git clone https://github.com/Shravanya178/Zidio-intellmeet.git

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start dev server
npm run dev
```

The app will run at `http://localhost:5173`.

---

## Project Structure

```
frontend/
├── public/                  # Static assets (favicon, images)
├── src/
│   ├── pages/               # Route-level page components
│   ├── router/              # React Router config & guards
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand global stores
│   ├── services/            # API call functions (TanStack Query)
│   ├── lib/                 # Utility functions & helpers
│   └── types/               # TypeScript interfaces & types
├── index.html
├── vite.config.ts
├── .env
└── package.json
```

---

## Folder Reference

### `src/pages/`
Route-level components. Each file maps directly to a URL. Pages are thin — they import components and pass data down. **No business logic here.**

```
pages/
├── auth/
│   ├── LoginPage.tsx          # /login — unauthenticated entry point
│   └── RegisterPage.tsx       # /register — new account creation
├── dashboard/
│   ├── DashboardPage.tsx      # /dashboard — overview, recent meetings, KPIs
│   ├── MeetingsPage.tsx       # /meetings — meeting history & scheduling
│   ├── TeamsPage.tsx          # /teams — workspaces, members, kanban boards
│   └── AnalyticsPage.tsx      # /analytics — charts, trends, productivity metrics
└── meeting/
    └── MeetingRoomPage.tsx    # /meeting/:id — live video room (WebRTC + chat)
```

---

### `src/router/`
All routing logic lives here. Do not define routes elsewhere.

```
router/
├── index.tsx              # Root router — defines all app routes
├── ProtectedRoute.tsx     # Auth guard — redirects to /login if unauthenticated
└── AppLayout.tsx          # Shared layout wrapper for dashboard routes (sidebar, navbar)
```

> **Rule:** Every authenticated route must be wrapped in `<ProtectedRoute>`.

---

### `src/components/`
Reusable components organized by domain. Components must be stateless or use local state only — global state belongs in `store/`.

```
components/
├── ui/                    # shadcn/ui base components (Button, Dialog, Input, etc.)
│                          # Do not edit these directly — re-export and extend if needed
├── meeting/               # Components used inside the live meeting room
│   ├── VideoGrid.tsx      # Participant video tiles layout
│   ├── ChatPanel.tsx      # Real-time in-meeting chat
│   ├── ParticipantList.tsx # Live participant list with presence indicators
│   └── MeetingControls.tsx # Mute, camera, screen share, leave buttons
├── dashboard/             # Post-meeting & overview components
│   ├── MeetingSummary.tsx # AI-generated meeting summary card
│   ├── ActionItems.tsx    # Extracted action items with assignees
│   └── RecentMeetings.tsx # Meeting history list
├── teams/                 # Team workspace & project management
│   ├── KanbanBoard.tsx    # Drag-and-drop task board
│   ├── TeamCard.tsx       # Team workspace card
│   └── MemberList.tsx     # Team member list with roles
└── shared/                # App-wide layout components
    ├── Navbar.tsx         # Top navigation bar
    ├── Sidebar.tsx        # Left sidebar with navigation links
    └── PageHeader.tsx     # Reusable page title + breadcrumb
```

---

### `src/hooks/`
Custom React hooks. Each hook encapsulates a single concern.

```
hooks/
├── useSocket.ts           # Socket.io connection & event listeners
├── useWebRTC.ts           # Peer connection, stream management, WebRTC logic
├── useAuth.ts             # Current user session, login/logout helpers
├── useMeeting.ts          # Meeting state, join/leave actions
└── useMediaDevices.ts     # Camera & microphone device selection
```

> **Rule:** Hooks must start with `use`. Never import hooks inside components from outside `hooks/` — always use the abstraction.

---

### `src/store/`
Zustand global stores. One file per domain. Only store data that needs to be shared across multiple components.

```
store/
├── useAuthStore.ts        # Authenticated user, token, session status
├── useMeetingStore.ts     # Active meeting state, participants, recording status
├── useChatStore.ts        # In-meeting chat messages
└── useNotificationStore.ts # In-app notifications & alerts
```

---

### `src/services/`
All API call functions, organized with TanStack Query hooks. No raw `fetch` or `axios` calls outside this folder.

```
services/
├── auth.service.ts        # login(), register(), logout(), refreshToken()
├── meeting.service.ts     # getMeetings(), createMeeting(), getMeetingById()
├── team.service.ts        # getTeams(), createTeam(), inviteMember()
├── task.service.ts        # getTasks(), createTask(), updateTaskStatus()
├── ai.service.ts          # getSummary(), getActionItems(), getTranscript()
└── analytics.service.ts   # getDashboardStats(), getMeetingMetrics()
```

> **Rule:** Service functions return raw data. TanStack Query hooks (`useQuery`, `useMutation`) wrap them inside components or hooks.

---

### `src/lib/`
Pure utility functions and configuration helpers. No React, no side effects.

```
lib/
├── utils.ts               # cn() for Tailwind class merging, date formatters, etc.
├── api.ts                 # Axios instance with base URL & auth interceptors
└── constants.ts           # App-wide constants (API endpoints, config values)
```

---

### `src/types/`
Shared TypeScript interfaces and types. Import from here — never define types inline in components.

```
types/
├── user.ts                # User, UserRole, UserProfile
├── meeting.ts             # Meeting, MeetingStatus, Participant
├── message.ts             # ChatMessage, MessageType
├── task.ts                # Task, TaskStatus, TaskPriority
└── team.ts                # Team, TeamMember, Workspace
```

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/login` | `LoginPage.tsx` | Public |
| `/register` | `RegisterPage.tsx` | Public |
| `/dashboard` | `DashboardPage.tsx` | Protected |
| `/meetings` | `MeetingsPage.tsx` | Protected |
| `/teams` | `TeamsPage.tsx` | Protected |
| `/analytics` | `AnalyticsPage.tsx` | Protected |
| `/meeting/:id` | `MeetingRoomPage.tsx` | Protected |

---

## State Management

We use **Zustand** for global client state and **TanStack Query** for server state.

| What | Where |
|---|---|
| Auth session, user info | `useAuthStore` (Zustand) |
| Active meeting, participants | `useMeetingStore` (Zustand) |
| API data (meetings list, teams) | TanStack Query via `services/` |
| Local component state | `useState` inside the component |

> **Rule:** If data comes from the API, use TanStack Query. If it's UI state shared across pages, use Zustand. If it's local to one component, use `useState`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=IntellMeet
```

> All environment variables must be prefixed with `VITE_` to be accessible in the browser.

---

## Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Page component | PascalCase + `Page.tsx` | `MeetingRoomPage.tsx` |
| UI component | PascalCase + `.tsx` | `ChatPanel.tsx` |
| Custom hook | `use` + PascalCase | `useSocket.ts` |
| Zustand store | `use` + Name + `Store` | `useMeetingStore.ts` |
| Service file | kebab-case + `.service.ts` | `meeting.service.ts` |
| Type file | kebab-case + `.ts` | `meeting.ts` |
| Git commit | `type: description` | `feat: add chat panel component` |

---

## Contributing

1. Create a branch from `main` — `feat/your-feature` or `fix/your-fix`
2. Keep commits semantic — `feat:`, `fix:`, `chore:`, `refactor:`
3. One component per file — no multi-component files
4. No business logic in pages — delegate to hooks and services
5. Open a PR with a clear description before merging

---

*IntellMeet — Zidio Development · Web Development Domain · April 2026*

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

