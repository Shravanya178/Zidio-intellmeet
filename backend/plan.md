# Backend Plan: Foundations + Auth

Deliver MongoDB connection and secure auth (signup/login with JWT refresh tokens) on top of the existing Express scaffold, keeping backend-only scope and secure defaults.

## Steps
1. Confirm the backend folder layout to add config, models, routes, middleware, and utils without reworking the existing entry point.
2. Add a MongoDB connection helper and wire it into `server.js`; load env vars and surface clean startup errors.
3. Expand middleware in `server.js`: security headers, cookie parsing for refresh tokens, and centralized error handling.
4. Create a `User` model with unique email and bcrypt hashing (pre-save hook).
5. Implement auth routes and controllers for `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
6. Issue short-lived access tokens plus long-lived refresh tokens stored in httpOnly cookies; define a refresh token rotation strategy.
7. Add input validation and consistent error responses for auth flows.
8. Update `package.json` scripts and document required env vars.

## Relevant files
- `server.js` — DB hookup, middleware stack, and route mounting
- `package.json` — add missing dependencies and scripts

## Verification
1. Start backend and confirm successful MongoDB connection on boot.
2. Use a REST client to register, login, refresh, and logout; confirm cookies and token behavior.
3. Validate error responses for invalid credentials and expired tokens.

## Decisions
- Backend-only scope (frontend auth UI/routing excluded).
- Refresh tokens in httpOnly cookies for better security; access tokens in response body.
- bcrypt for hashing and JWT for access/refresh tokens.

## Further considerations
1. Refresh token revocation: token version on user vs. allowlist collection (recommend token version for simplicity unless per-device revocation is needed).
