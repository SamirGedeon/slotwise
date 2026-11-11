# Project research — 11 November 2026

This is a small, purposive sample, not a market census. Stars/forks measure attention, not maintainability or hiring value. All implementation in this repository was written for this project; references supplied product context, not copied application code.

## Job evidence

| Source | Observation | Consequence for this project |
| --- | --- | --- |
| [Sylision — Rails Júnior](https://www.sylision.com/vagas/desenvolvedor-rails-junior-401) | Page displayed “vaga aberta”, published 26 Sep 2026. Ruby/Active Record, relational database constraints, SQL, Git; RSpec and transaction/isolation knowledge are differentiators. Contracting company confidential. | Show a real integrity invariant plus a test that invalid data is rejected by PostgreSQL. |
| [Shopra — Junior Full Stack](https://jobs.polymer.co/shopra/38374) | Page accessible with application link; posted 21 Jan 2026, Canada preferred. Rails API, React/TypeScript, PostgreSQL, RSpec, Docker. It asks for 1–3 years. | Exercise the requested stack end-to-end. Remote does not mean every Brazilian candidate is eligible. |
| [JetThoughts — Junior Rails](https://jetthoughts.com/careers/junior-ruby-on-rails-developer/) | Page accessible with application link. Ruby/Rails, JavaScript, Git, testing, English; uses MySQL/minitest and mentions CI/CD. | Learn transferable testing and database fundamentals, and practice explaining decisions in English. |
| [Brajan — React Júnior/Pleno](https://github.com/frontendbr/vagas/issues/8473) | GitHub issue **closed** at retrieval. React, JavaScript/HTML/CSS, REST, Git; TypeScript a differentiator. | Build responsive UI and explicit frontend/API integration. Historical requirements only. |
| [Ferreri — Backend/Fullstack](https://github.com/backend-br/vagas/issues/12220) | GitHub issue **closed** at retrieval; includes Júnior among levels. Rails, React/TypeScript, PostgreSQL, Docker, automated tests and data modeling. | Align features with demonstrable engineering, not just framework keywords. |
| [Web-Engenharia — Frontend](https://github.com/frontendbr/vagas/issues/8453) | **Closed** issue; multiple seniorities. Responsive/accessibility, REST, JS/TS, Git and English. | Include keyboard-usable dialogs, mobile checks and English documentation. |

Open/accessibility status is an observation on the research date, not a guarantee of an active selection process. No applications were sent. The unrelated jobs in the initial Arbeitnow API sample were discarded rather than treated as evidence of junior Rails demand.

## Product and community references

| Platform | Source and observation | Limitations |
| --- | --- | --- |
| GitHub | [Cal.com repository URL](https://github.com/calcom/cal.com) resolved to [calcom/cal.diy](https://github.com/calcom/cal.diy) through the API. Observed 49,930 stars and 15,614 forks. Scheduling is a recognized product category. | Different stack and vastly larger scope; no code copied and no quality inference from popularity. Counts change. |
| GitHub | [Chatwoot](https://github.com/chatwoot/chatwoot): 39,633 stars, 9,624 forks at retrieval. Relevant Rails product reference for business workflows. | It is an omnichannel support product, not the project to reproduce. |
| Product Hunt | [Cal.com product page](https://www.producthunt.com/products/cal-com) was accessible. | Product positioning reference only. No unverified vote/rank or popularity comparison is claimed. |
| GitLab | [Public appointment project search](https://gitlab.com/api/v4/projects?search=appointment&simple=true&per_page=3) returned booking projects, including a salon app describing PostgreSQL and a different backend stack. | Presence of examples does not validate their code or market adoption. |
| Hacker News | [Algolia scheduling-software search](https://hn.algolia.com/api/v1/search?query=scheduling%20software&tags=story&hitsPerPage=3) returned community discussions about scheduling apps. | Search-by-relevance includes old posts. It is not evidence of a current trend. |
| Dev.to | [Rails articles API](https://dev.to/api/articles?tag=rails&per_page=3) returned current articles, including a GitLab refactoring/RSpec discussion. | Editorial context, not job-market data. |
| Stack Overflow | [Rails tag API](https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&inname=ruby-on-rails&site=stackoverflow) reported 337,896 questions for ruby-on-rails. | Historical question volume is not hiring demand. |
| Reddit | Direct r/rails JSON access returned HTTP 403. Search indexing found [a September 2026 market discussion](https://www.reddit.com/r/rails/comments/1w4lhi6/has_the_rails_job_market_completely_died/). | Anecdotal and selectively indexed. No broad conclusions or counts inferred. |

## Candidate comparison

These ratings are planning judgments based on the features we can finish and demonstrate, not a numerical ranking of products.

| Candidate | Professional relevance | Relative MVP complexity | Distinctive rule | Decision |
| --- | --- | --- | --- | --- |
| Appointment manager | High for APIs, relations, permissions, date handling and integrity | Medium | Concurrent double-booking prevention | Choose first |
| Financial dashboard | High for SQL aggregation, imports and reporting | Medium/high | Idempotent imports, money precision | Proposed second project |
| Team SaaS | High for tenant isolation, async workflows and deployment | High | Invitations, quotas, jobs | Proposed third project |

## Why Slotwise is defensible in an interview

A recruiter can inspect a concrete rule, its implementation and its tests. The project lets the candidate discuss why frontend validation is insufficient, why money uses cents, how local dates become UTC ranges, how workspace access is enforced and how the UI reacts to a failed save. Those demonstrations align with the sampled job requirements; they do not guarantee hiring outcomes.
