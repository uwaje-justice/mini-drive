# Mini Drive

Mini Drive is a personal file storage app. The Express API handles accounts,
folders, uploads, previews, downloads, search, activity, and expiring share
links. The React client is the only browser UI.

## Live deployment

- App: https://mini-drive-0.netlify.app
- Source: https://github.com/uwaje-justice/mini-drive

## Features

- Register, sign in, and manage an account.
- Upload up to 10 files per request, with a 5 MB limit per file.
- Store files on the local filesystem or Cloudinary.
- Create nested folders and move, rename, or delete files and folders.
- Browse photos, documents, and other files across the whole drive.
- Preview images, PDFs, and plain text without downloading.
- Search file and folder names across the whole drive.
- Review activity history and clear one event or all history.
- Create revocable, expiring folder share links.
- Download or preview files from public share pages without signing in.

## Stack

- Node.js 22+, Express 5, ES modules
- Prisma 7 with PostgreSQL
- Passport.js with session-based auth
- Multer for uploads
- express-validator for request validation
- Local filesystem or Cloudinary storage
- React 19, React Router 7, TanStack Query, React Hook Form
- Tailwind CSS 4, Motion, React Icons, PDF.js, Vite 8
- Vitest with Supertest for API and backend tests

## Project structure

```text
file-uploader/
├── api/
│   ├── prisma/                 Prisma schema and PostgreSQL migrations
│   ├── src/
│   │   ├── app.js              Express app exported for tests
│   │   ├── server.js           HTTP server entry point
│   │   ├── config/             Passport and session setup
│   │   ├── controllers/        Request handlers and responses
│   │   ├── errors/             HTTP-aware errors
│   │   ├── lib/                Database, storage, previews, and helpers
│   │   ├── middleware/         CORS, CSRF, auth, upload, and errors
│   │   ├── routes/             API route definitions
│   │   ├── services/           Database access and business rules
│   │   └── validators/         Request validation chains
│   ├── tests/                  Vitest and Supertest tests
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/                API client and resource modules
│   │   ├── app/                Providers and router
│   │   ├── components/         Shared layout, routing, and UI
│   │   ├── features/           Auth, drive, search, and shares
│   │   ├── lib/                Query client and query keys
│   │   ├── pages/              Screen components
│   │   └── styles/             Tailwind theme tokens
│   ├── .env.example
│   └── vite.config.js
├── netlify.toml                Netlify build and SPA routing
├── render.yaml                 Render web service blueprint
└── package.json                Workspace scripts
```

## Local setup

### 1. Install dependencies

Run all commands from the repository root.

```bash
npm install
```

### 2. Create PostgreSQL databases

Mini Drive uses one database for development and a separate database for
tests. Tests reset their database before every run.

```bash
createdb mini_drive
createdb mini_drive_test
```

### 3. Configure the API

```bash
cp api/.env.example api/.env
```

Set `DATABASE_URL` and `TEST_DATABASE_URL` to your local PostgreSQL URLs.
Generate a long random value for `SESSION_SECRET`.

Local example:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_drive"
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_drive_test"
DIRECT_URL=""
SESSION_SECRET="replace-with-a-long-random-string"
CLIENT_ORIGINS="http://localhost:5173"
PORT=3000
STORAGE_DRIVER="local"
```

`DIRECT_URL` is only needed when your database provider gives a separate
migration URL. When it is empty, the API uses `DATABASE_URL`.

### 4. Generate Prisma and apply migrations

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

### 5. Start the app

```bash
npm run dev
```

Vite runs on `http://localhost:5173` by default and proxies `/api` to
`http://localhost:3000`.

### 6. Run the checks

```bash
npm run lint
npm test
npm run build
```

## Environment variables

### API

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Runtime PostgreSQL connection URL. |
| `TEST_DATABASE_URL` | Tests | Test database. Its name must end in `_test`. |
| `DIRECT_URL` | No | Migration and Prisma CLI URL. Falls back to `DATABASE_URL`. |
| `SESSION_SECRET` | Yes | Session signing secret. |
| `CLIENT_ORIGINS` | Production | Comma-separated browser origins allowed by CORS. |
| `PORT` | No | API port. Defaults to `3000`. |
| `STORAGE_DRIVER` | No | `local` or `cloudinary`. Defaults to `local`. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Cloudinary | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary | Cloudinary API secret. |

### Client

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Production | API origin, such as `https://mini-drive-api.onrender.com`. Empty uses the Vite proxy locally. |

Never put API secrets in a `VITE_` variable. Vite exposes them to the browser.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and Vite together. |
| `npm run dev:api` | Start the API with nodemon. |
| `npm run dev:client` | Start the Vite dev server. |
| `npm start` | Start the API server. |
| `npm run build` | Build the client into `client/dist`. |
| `npm test` | Reset and test against `mini_drive_test`. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run lint` | Lint the API and client. |
| `npm run lint:fix` | Fix lint issues and sort imports. |
| `npm run prisma:migrate` | Create and apply a development migration. |
| `npm run prisma:migrate:deploy` | Apply existing migrations. |
| `npm run prisma:generate` | Regenerate Prisma Client. |
| `npm run prisma:studio` | Open Prisma Studio. |

## Database

Prisma uses PostgreSQL in development, tests, and production.

- Development database: `mini_drive` by default.
- Test database: `mini_drive_test` by default.
- Tests run with `NODE_ENV=test` and read `TEST_DATABASE_URL`.
- `npm test` resets the test database before running.
- The test guard rejects any URL whose database name does not end in `_test`.

To create a new migration:

```bash
npm run prisma:migrate -- --name describe_the_change
```

To apply committed migrations:

```bash
npm run prisma:migrate:deploy
```

## Storage

`STORAGE_DRIVER=local` stores files under `api/uploads/` and is intended for
local development.

`STORAGE_DRIVER=cloudinary` stores files in Cloudinary and is required on
Render because the service filesystem is temporary. Every file row records its
own storage provider, so local and Cloudinary files can coexist.

Cloudinary previews and downloads are proxied through Express. The browser
never receives a direct Cloudinary URL.

## API overview

All API routes start with `/api`. Success responses use `{ data }`. Failures
use `{ error: { code, message, fields? } }`.

Auth uses an HTTP-only session cookie. Every mutation also requires the
`x-csrf-token` header. `GET /api/auth/session` returns the current user or
`null` and a CSRF token.

Main routes:

- `/api/auth` for registration, login, logout, email, password, and session.
- `/api/drive` for the root listing, overview, activity, and categories.
- `/api/folders` for folders, folder contents, and share management.
- `/api/files` for uploads, file details, moves, previews, and downloads.
- `/api/search` for whole-drive name search.
- `/api/public/shares` for public share browsing, previews, and downloads.

See `AGENTS.md` for the full API contract.

## Tests

The API tests use a real PostgreSQL database. They do not use Cloudinary and
do not touch the development database.

```bash
npm test
```

Before the test run, `npm test` runs `prisma migrate reset --force --skip-seed`
against `TEST_DATABASE_URL`.

## Deploying to Render and Netlify

The API runs on Render. The client runs on Netlify. They use separate origins,
so the API enables CORS with credentials and sends cross-site session cookies.

### 1. Create the database

Create a Prisma Postgres or other PostgreSQL database.

Prisma Postgres currently provides two connection strings:

- pooled URL for application traffic,
- direct URL for migrations and Prisma CLI commands.

Set `DATABASE_URL` to the pooled URL and `DIRECT_URL` to the direct URL. If
your database only provides one URL, set both variables to that URL and verify
that migrations succeed. A pooled URL can fail during migrations with lock or
prepared-statement errors.

### 2. Deploy the API on Render

Use the repository root and `render.yaml`, or create a Node web service with:

```text
Build command: npm ci && npm run prisma:generate
Start command: npm run prisma:migrate:deploy && npm start
Health check path: /api/health
```

Migrations run before the server starts on every deploy. This works on the
free plan, which does not support pre-deploy commands. On a paid plan, move
`npm run prisma:migrate:deploy` into a pre-deploy command instead.

Set these Render environment variables:

```text
NODE_ENV=production
STORAGE_DRIVER=cloudinary
DATABASE_URL=...
DIRECT_URL=...
SESSION_SECRET=...
CLIENT_ORIGINS=https://your-client.netlify.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Deploy the client on Netlify

Import the repository into Netlify. Leave the base directory at the repository
root. `netlify.toml` runs `npm run build`, publishes `client/dist`, and rewrites
unknown paths to `index.html` so React Router deep links work.

Set the API URL in **Site configuration → Environment variables**:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

Vite reads this value at build time. Trigger a new deploy after changing it.

Do not set the base directory to `client`. That would make Netlify look for the
configuration and build output in the wrong place.

### 4. Connect the two origins

Add the exact Netlify production origin to `CLIENT_ORIGINS` on Render, then
redeploy the API.

Example:

```text
CLIENT_ORIGINS=https://mini-drive.netlify.app
```

If you use Netlify deploy previews, add each preview origin explicitly. Do not
use a wildcard origin with credentials.

### Cross-site cookies

Production cookies use `SameSite=None` and `Secure` so the Netlify client can
send them to the Render API.

Some browsers, especially Safari and iOS browsers, may block third-party
cookies. If sign-in does not persist on a phone, use one of these alternatives:

- serve the client from the same Express service as the API,
- use `app.example.com` and `api.example.com` under one custom domain.

## Troubleshooting

### `Tests must use a TEST_DATABASE_URL ending in _test`

Set `TEST_DATABASE_URL` in `api/.env` and make sure the database name ends in
`_test`.

### `CLIENT_ORIGINS is required in production`

Set `CLIENT_ORIGINS` on Render to the exact Netlify origin. Include the scheme
and do not add a trailing slash.

### Login works locally but not from Netlify

Check all of these:

1. `VITE_API_URL` points at the Render API.
2. `CLIENT_ORIGINS` contains the exact Netlify origin.
3. The API uses HTTPS so the secure cookie can be stored.
4. The browser allows third-party cookies for the Netlify site.
5. The Render service restarted after changing environment variables.

### Migrations fail on Render

Make sure `DIRECT_URL` points at a direct database connection, not the pooled
connection. The Prisma CLI needs a direct connection for migrations.

### Uploads disappear after a Render restart

Set `STORAGE_DRIVER=cloudinary`. Render's local filesystem is temporary.

### PDF preview fails

The browser must be allowed to send the session cookie to the API. Check CORS,
`VITE_API_URL`, and third-party cookie settings.

## Known limitations

- Uploads are limited to 10 files per request and 5 MB per file.
- Previews support images, PDF, and plain text only.
- Cross-site session cookies can be blocked by some browsers.
- Local storage is not persistent on Render.
- The client has no automated test suite; lint and build are checked.

## License

ISC. See `package.json`.
