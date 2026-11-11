# Verification record

Executed in the managed development environment on 11 November 2026.

| Check | Result |
| --- | --- |
| Rails migrations against a real PostgreSQL 16 database | Passed |
| Demo seed creating owner/staff, services, professionals and tomorrow's bookings | Passed |
| RSpec request/database suite | **12 examples, 0 failures** |
| Rails `zeitwerk:check` eager-loading check | Passed |
| Frontend `npm run format:check` | Passed |
| Frontend `npm run build` (TypeScript and Vite production compilation) | Passed |
| Playwright Chromium browser suite | **3 tests passed** |
| Desktop and 390px mobile screenshots | Captured from the running application |
| Screenshot browser page errors | None observed |
| Mobile horizontal overflow check | None at 390px width |
| Docker Compose configuration validation | Passed (`docker compose config --quiet`) |

## What the tests prove

The backend suite covers authenticated access, login/logout, expiry and invalid credentials; server-derived booking values; model-level overlap feedback and database-level exclusion when validations are bypassed; adjacent appointments; cancellation releasing a slot; cross-workspace read/write isolation; owner-only catalog writes; invalid times/emails/dates; terminal state rules; completion only after an appointment ends; the closing-time boundary; and simultaneous appointments for different professionals.

The browser suite uses the real Rails API. It creates a service/professional, books a customer, observes a conflict error, searches, filters, cancels and logs out. It also exercises staff restrictions, a 390px viewport, Escape dismissal and a failed login. These are integration checks, not mocked component tests.

## Scope of validation

The API and PostgreSQL ran in Docker containers, with Vite on the development host. The delivered Dockerfiles and full Compose startup were not built/exercised end-to-end in this session; only Compose configuration parsing was checked. The environment's limited disk required smaller runtime images. No claim of a passing production container build is made.

The CI workflow was authored for GitHub Actions. Remote run status, if available after publication, is recorded below; a local pass does not imply a remote pass.

Not performed: production deployment, real email/payment integrations, load testing, a security audit, exhaustive time-zone/DST coverage or manual testing on physical mobile devices. Rack emitted deprecation notices for the Rails/RSpec 422 status symbol; there were no failed assertions from those notices.

## Publication attempt

The authenticated GitHub CLI attempted to create `slotwise`, but GitHub rejected `createRepository` with `Resource not accessible by integration`. No repository was created and no GitHub-hosted workflow ran. Source delivery includes the workflow and local evidence only.

## Source publication confirmed

After the user created the public repository, Git push to `https://github.com/SamirGedeon/slotwise` succeeded on main. This confirms source publication, not a production application deployment or a passing remote CI run.
