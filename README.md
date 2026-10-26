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

## Deploy the frontend and API together on Vercel

1. Import the repository root as one Vercel project. Keep the project root set
   to the repository root so Vercel uses the root `package.json` and
   `vercel.json`.
2. In **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` — the Neon connection URL
   - `JWT_SECRET` — a strong random secret
   - `JWT_EXPIRES_IN` — for example `7d`
   - `CLIENT_URL` — the deployed Vercel origin (for example,
     `https://your-project.vercel.app`)
3. Deploy. Vercel builds the Vue client and serves the Express API from the
   serverless function in `api/`. The client uses the same-origin `/api` path.

Never put secrets in `VITE_*` variables, frontend source, or the Vercel build
output. `.env` files are for local development only; configure production values
in Vercel's environment-variable settings.
