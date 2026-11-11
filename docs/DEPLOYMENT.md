# Deployment and GitHub preparation

## Current status

Local source and documentation are prepared. No public deployment or GitHub URL is asserted. The GitHub connector in this session does not expose repository creation, and this workspace has no configured publishing credentials. Source can be downloaded and published from an authenticated local CLI.

Suggested repository name: **slotwise**

Description: `Workspace-based appointment management with Rails, React, TypeScript and PostgreSQL. Prevents double bookings with database constraints.`

Suggested topics: `ruby-on-rails`, `react`, `typescript`, `postgresql`, `rspec`, `appointment-scheduling`, `portfolio`, `docker`.

## Publish from your computer

The source ZIP excludes the development machine's Git metadata and dependencies. After extracting it, from the project folder:

```sh
git init -b main
git add .
git commit -m "feat: deliver appointment management MVP"
gh auth login
gh repo create slotwise --public --source=. --remote=origin --push
```

If the repository already exists, use its verified URL rather than creating another. Review files before the first public push. GitHub Actions can only be called successful after its actual remote run passes. The provided workflow performs backend tests, formatting/types/build and browser integration tests; it does not deploy production.

## Production topology

A practical target is a Rails-capable container/PaaS host plus managed PostgreSQL, with the React build served from an HTTPS reverse proxy on the same origin:

- `/api/*` → Rails service.
- Other paths → `frontend/dist`, with SPA fallback to index.html for /agenda, /services and /team.
- Rails `RAILS_ENV=production`, `SECRET_KEY_BASE`, `DATABASE_URL`, `APP_HOST` and `FRONTEND_ORIGIN` supplied through the host's secret/runtime settings.
- Generate a secret with `bundle exec rails secret`. Do not put it in source control.
- Keep FORCE_SSL=true and ensure the reverse proxy sends the correct HTTPS forwarding headers. The API assumes TLS termination when SSL is enabled.
- Run `bundle exec rails db:migrate` as a release command. The DB user must be allowed to install btree_gist, or an administrator must enable it first.
- Use a non-superuser runtime DB role and appropriate migration privileges.
- Build React with `npm ci && npm run build`. Do not expose the Vite development server as production hosting.

Create a production owner with the bootstrap task. Supply WORKSPACE_NAME, OWNER_NAME, OWNER_EMAIL and OWNER_PASSWORD through the platform's protected environment settings, then run:

```sh
bundle exec rails workspace:bootstrap
```

The task creates an account and owner in one transaction, fails on duplicate email and never prints credentials. It is not a recurring seed command. Staff provisioning currently requires a trusted administrator; self-signup and invitation UI are outside this release.

Before serving real users, configure backups/restore procedures, monitoring, persistent shared login rate limiting, session expiry cleanup and a customer-data retention process. No operational SLA, security audit or external service billing is claimed.

The Compose setup deliberately uses development mode and fictional seeds. A production hosting subscription/account and a verified target are still needed; no paid resources were created.

## Enterprise/cloud CA for image builds

Dockerfiles accept an optional BuildKit secret `proxy_ca`. On an executor that supplies a CA bundle:

```sh
docker build --secret id=proxy_ca,src=/path/to/trusted-ca-bundle.pem -t slotwise-api ./backend
docker build --secret id=proxy_ca,src=/path/to/trusted-ca-bundle.pem -t slotwise-web ./frontend
```

The certificate is mounted only during dependency installation; TLS checks stay enabled. Standard local builds do not need this secret. If apt package installation itself needs a custom enterprise CA, provision trusted OS certificates through your organization's approved base-image workflow.
