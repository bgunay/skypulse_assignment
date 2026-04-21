# SkyPulse Backend

Production-oriented Node.js rewrite of the original SkyPulse backend. The API contract stays compatible with the Python app, while the internals are improved for clearer structure, safer configuration, better observability, and easier deployment.

## Reviewer Guide

If you want to evaluate the submission quickly:

```bash
npm install
npm run dev
```

Then check:

- API docs: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs/openapi.json`
- Health check: `http://localhost:3000/health`
- Example endpoint: `http://localhost:3000/api/v1/activity-score?lat=40.71&lon=-74.01`

Validation commands:

```bash
npm test -- --runInBand
npm run build

cd terraform
terraform init
terraform validate
terraform plan -input=false -var "do_token=YOUR_TOKEN"
```

## Repository Layout

```text
/original/          # Original Python code (kept unchanged)
/src/               # Node.js/TypeScript rewrite
/terraform/         # DigitalOcean Droplet Terraform
Dockerfile
docker-compose.yml
README.md
```

## API Compatibility

The original API contract is preserved:

- `GET /api/v1/activity-score?lat=40.71&lon=-74.01`
- `GET /api/v1/locations`

Additional operational endpoints added for production-readiness:

- `GET /health`
- `GET /docs`
- `GET /docs/openapi.json`

Example:

```bash
curl "http://localhost:3000/api/v1/activity-score?lat=40.71&lon=-74.01"
```

## How To Run

Local development:

```bash
npm install
npm run dev
```

Production-style local run:

```bash
npm run build
npm run start
```

Docker:

```bash
docker compose up --build
```

This exposes the service on port `3000` as required by the assignment.

Verified locally:

- `docker compose up --build -d` passes
- the container starts successfully on port `3000`
- the health endpoint returns `{"status":"ok"}` from inside the running container

## Terraform

Terraform files live in [`terraform/main.tf`](/Users/burhan/Desktop/workspace/rounds_assignment/terraform/main.tf) and [`terraform/variables.tf`](/Users/burhan/Desktop/workspace/rounds_assignment/terraform/variables.tf).

Example workflow:

```bash
cd terraform
terraform init
terraform validate
terraform plan \
  -var "do_token=YOUR_TOKEN" \
  -var 'ssh_key_fingerprints=["YOUR_SSH_KEY_FINGERPRINT"]'
```

Verified locally on macOS:

- `terraform init` passes
- `terraform validate` passes
- `terraform plan -input=false -var 'do_token=dummy'` reaches a valid plan for one droplet resource

Expected deployment flow:

1. `terraform apply`
2. `ssh root@<droplet_ip>`
3. `git clone <repo>`
4. `docker compose up --build`

## What I Changed And Why

- Migrated the backend to Node.js with TypeScript and kept the external API shape compatible with the original service.
- Split the code into controllers, services, DB access, middleware, docs, and utility layers to make the code easier to test and reason about.
- Replaced hardcoded secrets with environment-based config.
- Added structured JSON logging for requests, startup, DB initialization, and background analytics failures.
- Added centralized Express error handling instead of relying on ad hoc `console.error` usage.
- Added Swagger/OpenAPI documentation at `/docs` and `/docs/openapi.json`.
- Added a `/health` endpoint for operational checks.
- Parallelized upstream weather and air-quality calls with `Promise.all` to reduce latency.
- Added upstream HTTP timeouts and explicit `502` responses when provider calls fail.
- Kept analytics asynchronous so external analytics latency does not block user responses.
- Ensured an index exists on `user_preferences(location_id)` because the assignment explicitly notes 2M+ rows in production.
- Added unit, controller, and integration tests.
- Added Docker packaging and Terraform for the DigitalOcean droplet workflow in the prompt.

## Engineering Tradeoffs

- I kept the `user_preferences` lookup for compatibility with the original behavior, even though the current scoring logic does not yet apply those preferences.
- I used lightweight in-repo structured logging instead of adding a heavier logging dependency, since the assignment benefits more from clarity than framework churn.
- Integration tests mock external weather APIs but use the real Express app and local SQLite database, which keeps the tests deterministic while still exercising real application wiring.
- I kept SQLite for the assignment because it matches the provided app, but I would not use it unchanged for a horizontally scaled production deployment.

## Notes On Production Readiness

- `GET /api/v1/locations` still uses `SELECT DISTINCT ... LIMIT 100` to preserve the original behavior. In a real production API I would add pagination and define the contract more explicitly.
- The app is now safer to operate locally and easier to deploy, but a real production rollout would also add metrics, tracing, rate limiting, and stronger request validation.

## If I Had More Time

- Add schema-based request validation for query params and environment variables.
- Add metrics and tracing in addition to logs.
- Add retries/circuit-breaking strategy for upstream weather providers.
- Paginate `/api/v1/locations`.
- Move from SQLite to Postgres for a real multi-instance deployment.
- Apply user preferences to the score if that is intended product behavior.

## AI Tools Used

- OpenAI Codex for code review, refactoring assistance, test additions, and documentation drafting.

## Validation

- `npm test -- --runInBand` passes with 19 tests.
- `npm run build` passes.
- `npm run dev` starts the server on port `3000`.
- Swagger UI is served at `http://localhost:3000/docs`.
- `docker compose up --build -d` was tested locally and the containerized app starts successfully.
- Terraform `init`, `validate`, and `plan` were run successfully on macOS after installing Terraform with Homebrew.
