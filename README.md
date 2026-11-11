# Slotwise

A workspace-based appointment manager for small service businesses. Built with a Ruby on Rails API, PostgreSQL and React + TypeScript.

**Portfolio project 01 · Functional local MVP · No hosted deployment yet**

Slotwise addresses double bookings and scattered schedules. Owners define services and professionals; owners and staff can book, browse, filter, cancel and complete appointments. PostgreSQL enforces non-overlapping time ranges even when application validation is bypassed.

## Screenshots

![Schedule dashboard](docs/screenshots/agenda-desktop.png)

![Mobile schedule](docs/screenshots/agenda-mobile.png)

All names, appointments and financial values in the screenshots are fictional seed data.

## Implemented

- Password authentication with BCrypt, expiring opaque bearer sessions and server-side logout.
- Workspace isolation and owner/staff authorization; only owners create catalog entries.
- Services with duration and BRL pricing; professionals with specialties.
- Date-based schedule, weekly navigation, client/service search, status and professional filters.
- Booking creation with server-calculated price and duration snapshots.
- Opening hours: 08:00–18:00 every day, in the workspace's IANA time zone.
- Friendly validation plus a PostgreSQL GiST exclusion constraint against overlapping appointments.
- Confirmed → cancelled/completed transitions; completion requires the appointment to have ended. Terminal states cannot be reopened.
- Day totals for appointments, confirmed/completed counts and **expected value**, not collected revenue.
- Responsive interface, loading/error/empty states, keyboard-accessible native dialogs.
- RSpec request/database coverage and Playwright browser integration tests.
- OpenAPI 3.0 specification, Docker development configuration and GitHub Actions workflow.

## Stack

Ruby 3.3 · Rails 7.2 · Active Record · PostgreSQL 16 · RSpec · React 19 · TypeScript · Vite · Tailwind CSS 4 with custom CSS · React Router · TanStack Query · Luxon · Playwright.

Redis and Sidekiq are intentionally absent: this MVP has no background work that requires them.

## Run locally with Docker

Install Docker Engine/Desktop and the Compose plugin. From this repository:

```sh
cp .env.example .env
docker compose up --build
```

Open **http://localhost:5173**. API health: http://localhost:3000/up.

The Compose configuration is for local development: it runs Vite, seeds fictional data and binds published ports to loopback. **Do not use it unchanged for public hosting.** On a cloud executor, use its supported preview/port-forwarding interface; localhost is not a public URL.

Local demo accounts (same password: `Slotwise-demo-2026!`):

| Email | Role |
| --- | --- |
| owner@slotwise.test | Owner |
| staff@slotwise.test | Staff |

The development login page can fill the owner credentials. Sample appointments are created for **tomorrow in America/Sao_Paulo**. Select tomorrow in the schedule to see them. Seed scripts are idempotent for the existing demo records; they never run in production. Setting DEMO_PASSWORD only affects newly created demo accounts.

The database persists in a Docker volume. To stop: `docker compose down`. Avoid `down -v` unless you intend to delete local data.

Corporate proxy users can supply a trusted CA through the optional Docker BuildKit `proxy_ca` secret described in [deployment notes](docs/DEPLOYMENT.md). TLS verification remains enabled.

## Run without Docker

Install Ruby 3.3, Bundler, PostgreSQL 16, Node 22.12+ and npm. Native Ruby gems may need a C compiler, libpq headers, libyaml headers and pkg-config.

Create a PostgreSQL login with permission to create the local development/test databases and enable the `btree_gist` extension. Set real connection strings for your machine:

```sh
export DATABASE_URL=postgres://slotwise:slotwise@localhost:5432/slotwise_development
export TEST_DATABASE_URL=postgres://slotwise:slotwise@localhost:5432/slotwise_test
cd backend
bundle install
bundle exec rails db:prepare db:seed
bundle exec rails server -b 0.0.0.0
```

In another terminal, from the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` to http://localhost:3000. Set API_PROXY_TARGET when the backend uses another address. There is no mock backend or local-storage booking database.

## Verify

With the application and database running:

```sh
docker compose exec api bundle exec rspec
```

Or use the native setup:

```sh
cd backend
RAILS_ENV=test bundle exec rails db:prepare
bundle exec rspec
```

Frontend checks (from `frontend`):

```sh
npm ci
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests need the Rails development API and seeded demo accounts. They create uniquely named fictional records in the development database. Use a dedicated local/CI database; do not point them at production. Playwright starts Vite if it is not already running.

See [verification record](docs/VERIFICATION.md) for checks actually executed here and any unverified delivery configuration. A workflow file is not evidence of a successful GitHub-hosted run.

## Architecture and API

- [Requirements, data model and decisions](docs/ARCHITECTURE.md)
- [OpenAPI 3.0 JSON](docs/openapi.json) — import into Swagger Editor or an OpenAPI client.
- [Research and job evidence](docs/RESEARCH.md)
- [Deployment preparation](docs/DEPLOYMENT.md)
- [30-day learning roadmap](docs/ROADMAP-30-DAYS.md)
- [Progress log](docs/PROGRESS.md)
- [Learning exercises in Portuguese](docs/LEARNING.md)
- [LinkedIn draft, not published](docs/LINKEDIN-DRAFT.md)

## Scope and limitations

This is a deliberately bounded appointment MVP. Public self-service booking, rescheduling, service/professional editing or deletion, configurable hours/holidays, email delivery, reminders, payments, user invitations and password reset are not implemented. Owners are provisioned through a task; staff provisioning currently requires a trusted administrator. A professional is a scheduling resource, not a user account. Staff may manage all appointments in their workspace.

Sessions use sessionStorage instead of cookies, expire after 12 hours and are revocable on logout. This avoids cookie-based CSRF but makes XSS prevention important. Login rate limiting is per IP in a process-local memory cache; use a shared limiter before scaling to multiple API instances. Workspace isolation is enforced in application queries, not PostgreSQL row-level security. No penetration test or load test has been performed. Production operation also needs backups, monitoring and a retention policy.

Financial totals represent scheduled value only. There are no payment transactions or claims of commercial usage.

## Publish the repository

This folder is ready for its own Git repository named `slotwise`. Publication commands and a suggested description/topics are in [deployment notes](docs/DEPLOYMENT.md). No GitHub repository URL or deployment URL is claimed until the remote actually exists.

MIT license. Developed with AI assistance as a learning project; only claim personal mastery after understanding and modifying the implementation.
