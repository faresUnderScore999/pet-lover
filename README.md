# StreetAnimals.TN

## Run frontend and backend with Docker Compose

1. Create `server/.env` from `server/.env.example` and set the Neon `DATABASE_URL`
   and a strong `JWT_SECRET`. Do not commit or upload this file.
2. From the project root, run:

   ```sh
   docker compose up --build
   ```

3. Open <http://localhost:5176/map>. The API health endpoint is
   <http://localhost:5000/api/health>.

The Compose setup uses the PostgreSQL database configured in `server/.env`; it
does not start a separate database container.

## Deploy as multiple Vercel services

Import the repository root as one Vercel project and keep its Root Directory
set to the repository root. The root `vercel.json` defines two services:

- `client` builds the Vite frontend from `client/` and serves the SPA.
- `server` deploys the Express API from `server/`.

The public `/api/*` and `/uploads/*` paths are routed to `server`; all other
paths go to `client`. The frontend calls the API using the same-origin `/api`
path. The API does not call the frontend service, so no internal service
binding is needed.

In **Project Settings → Environment Variables**, set `DATABASE_URL`,
`JWT_SECRET`, `JWT_EXPIRES_IN` (for example, `7d`), and `CLIENT_URL` to the
production site origin. Use rotated production credentials; do not upload
`server/.env` or place secrets in `VITE_*` variables.

The backend's local `/uploads` static directory is not persistent storage on
Vercel. Use object storage for files that must survive deployments or be shared
across instances.

Never put secrets in `VITE_*` variables, frontend source, or the Vercel build
output. `.env` files are for local development only; configure production values
in Vercel's environment-variable settings.
