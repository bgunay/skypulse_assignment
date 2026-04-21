# SkyPulse Backend

Production-oriented Node.js rewrite of the original SkyPulse backend. The service keeps the original API contract and adds safer configuration, logging, docs, tests, Docker packaging, and Terraform for a DigitalOcean Droplet.

## Repository Layout

```text
/original/          # Original Python code (copied unchanged from the provided app)
/src/               # Node.js/TypeScript rewrite
/terraform/         # DigitalOcean Droplet Terraform
Dockerfile
docker-compose.yml
README.md
```

The legacy Python files are also still present in `/py` because that is how the initial local repo was organized.

## API

- `GET /api/v1/activity-score?lat=40.71&lon=-74.01`
- `GET /api/v1/locations`

Additional operational endpoints:

- `GET /health`
- `GET /docs`
- `GET /docs/openapi.json`

Example:

```bash
curl "http://localhost:3000/api/v1/activity-score?lat=40.71&lon=-74.01"
```

## Local Run

```bash
npm install
npm run dev
```

The service runs on `http://localhost:3000`.
Swagger UI is available at `http://localhost:3000/docs`.
The OpenAPI document is available at `http://localhost:3000/docs/openapi.json`.

For a production-style local run:

```bash
npm run build
npm run start
```

## Docker

```bash
docker compose up --build
```

This exposes the service on port `3000` as required.

## Terraform

Files live in [`terraform/main.tf`](/Users/burhan/Desktop/workspace/rounds_assignment/terraform/main.tf) and [`terraform/variables.tf`](/Users/burhan/Desktop/workspace/rounds_assignment/terraform/variables.tf).

Example flow:

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
- `terraform plan -input=false -var 'do_token=dummy'` reaches a valid plan shape for 1 droplet resource

Expected deployment flow:

1. `terraform apply`
2. `ssh root@<droplet_ip>`
3. `git clone <repo>`
4. `docker compose up --build`

## Changes From The Original And Why

- Moved hardcoded secrets into environment-driven config so credentials are not committed.
- Kept the API shape identical for `/api/v1/activity-score` and `/api/v1/locations`.
- Parallelized weather and air-quality requests with `Promise.all` to reduce latency.
- Added upstream timeouts and explicit `502` handling so external provider failures are visible and bounded.
- Added structured JSON logging for requests, startup, DB initialization, and analytics failures.
- Added centralized Express error handling instead of scattered `console.error` calls.
- Added `/docs` and `/docs/openapi.json` so endpoint behavior is documented with Swagger/OpenAPI.
- Added `/health` for operational checks.
- Ensured the SQLite index on `user_preferences(location_id)` exists, which matters for the stated 2M+ row production table.
- Kept analytics fire-and-forget so user requests are not blocked by the analytics endpoint.
- Split startup from app construction so the app is easier to test and run in different contexts.
- Added build/start scripts and updated Docker to build TypeScript once and run compiled output.
- Expanded Terraform with provider/version constraints, variables, SSH key support, and a droplet IP output.

## Notes On Production Readiness

- SQLite is acceptable for the assignment, but a live multi-instance deployment would likely move to a managed relational database.
- `GET /api/v1/locations` still uses `SELECT DISTINCT ... LIMIT 100` to preserve behavior, but for large production usage it would likely need pagination and a clearer contract.
- User preferences are still fetched for compatibility with the original behavior, even though they are not yet applied to scoring.

## AI Tools Used

- OpenAI Codex for code review, refactoring assistance, and documentation drafting.

## Validation

- `npm run build` passes.
- `npm run dev` starts the server on port `3000`.
- Swagger UI is served at `http://localhost:3000/docs`.
- `npm test -- --runInBand` passes with 19 tests.
- Terraform `init`, `validate`, and `plan` were run successfully on macOS after installing Terraform with Homebrew.
