# Backend Implementation Summary

This document describes what has been implemented so far for the backend foundation, authentication, and team access.

## What Exists Now

### 1) Core Server Setup
- Express server with security and JSON middleware.
- CORS configured to allow the frontend origin and send cookies.
- Cookie parser enabled for refresh token handling.
- Centralized error handler attached.
- MongoDB connection is established before the server starts.

Files:
- `server.js`
- `config/db.js`
- `middleware/errorHandler.js`

### 2) Database Connection
- `MONGO_URI` is read from environment variables.
- Connection errors are logged and stop the process to avoid a half-started server.

Files:
- `config/db.js`

### 3) User Model
- `User` schema with `email`, `password`, `name`, `role`, profile fields, OAuth identifiers, and `tokenVersion`.
- Passwords are hashed automatically before save using `bcrypt`.
- Password field is not returned by default (`select: false`).
- `tokenVersion` is used to invalidate refresh tokens on logout.
- `role` defaults to `member` and supports `admin` and `member`.

Files:
- `models/User.js`

### 4) Auth Tokens
- Access token: short-lived JWT.
- Refresh token: long-lived JWT stored in httpOnly cookie.
- Both token signing and verification are centralized in helpers.

Files:
- `utils/tokens.js`

### 5) Authentication Routes
Routes under `/auth`:
- `POST /auth/register` — create user + return access token
- `POST /auth/login` — verify user + return access token
- `POST /auth/refresh` — rotate refresh token + return access token
- `POST /auth/logout` — invalidate refresh token by bumping `tokenVersion`
- `GET /auth/google` — start Google OAuth2
- `GET /auth/google/callback` — finish OAuth2 and return access token

Files:
- `routes/auth.js`
- `controllers/authController.js`

### 6) Auth Controller Behavior
- Validates required fields and basic password length.
- Prevents duplicate emails.
- Sets refresh token cookie (httpOnly, secure in production).
- Returns access token and basic user info on success.

Files:
- `controllers/authController.js`

### 7) Auth Middleware
- `protect` middleware verifies `Authorization: Bearer <token>` and attaches `req.user`.
- `authorizeRoles` enforces role-based access (`admin`, `member`).

Files:
- `middleware/auth.js`

### 8) Environment Template
- `.env.example` includes all required environment variables for local dev.

Files:
- `.env.example`

### 9) Profile and User Routes
Routes under `/users`:
- `GET /users/me` — fetch current user profile
- `PUT /users/me` — update profile fields
- `PUT /users/:userId/role` — admin-only role update

Files:
- `routes/users.js`
- `controllers/usersController.js`

### 10) Teams and Invitations
Routes under `/teams`:
- `POST /teams` — create team (admin only)
- `POST /teams/:teamId/invite` — create invitation (admin only)
- `POST /teams/invitations/:token/accept` — accept invitation

Files:
- `models/Team.js`
- `models/TeamInvitation.js`
- `routes/teams.js`
- `controllers/teamsController.js`

### 11) OAuth2 Support
- Google OAuth2 flow via Passport, issuing the same JWTs as normal login.

Files:
- `config/passport.js`
- `routes/auth.js`

### 12) Dependencies Added
- `bcryptjs`, `cookie-parser`, `helmet`, `jsonwebtoken`, `passport`, `passport-google-oauth20`, `socket.io`

Files:
- `package.json`

## Required Environment Variables

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
REFRESH_COOKIE_DAYS=7
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

## How the Auth Flow Works

1. **Register / Login**
   - User submits email + password.
   - Server hashes password (register) or compares hash (login).
   - Returns access token in JSON.
   - Sets refresh token as httpOnly cookie.

2. **Refresh**
   - Client sends request with refresh cookie.
   - Server verifies refresh token and token version.
   - Issues new access + refresh tokens.

3. **Logout**
   - Server increments `tokenVersion` to invalidate existing refresh tokens.
   - Clears refresh token cookie.

## Profile and Roles

- `GET /users/me` returns the logged-in user profile.
- `PUT /users/me` updates profile fields: `name`, `avatarUrl`, `bio`.
- `PUT /users/:userId/role` is restricted to `admin` role.

## Team Invitations

1. **Create team**
   - Admin creates a team and becomes team owner and admin member.
2. **Invite**
   - Admin generates an invitation token for an email address.
   - Token is returned in the response for now (no email sending yet).
3. **Accept**
   - Authenticated user accepts invite by token and becomes a team member.

## Next Steps (Pending)
- Add input validation library (e.g., zod or express-validator).
- Add API documentation and sample requests.
- Add email delivery for invitations.
