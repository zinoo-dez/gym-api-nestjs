# Change: Add GitHub Actions CI Pipeline

## Why
To automate testing and building of the NestJS gym API, ensuring code quality, preventing regressions, and streamlining deployment preparation.

## What Changes
- Add `.github/workflows/ci.yml` with steps for installing dependencies, linting, running unit tests, running e2e tests, building the application, and running Prisma migrations
- Workflow triggers on pushes and pull requests to the main branch
- Configure PostgreSQL service for e2e tests
- Set required environment variables: DATABASE_URL and JWT_SECRET

## Impact
- Affected specs: New `ci-cd` capability
- Affected code: New `.github/workflows/ci.yml` file
- No breaking changes to existing functionality</content>
<parameter name="filePath">/Users/htooaunglynn/GitHub/gym/openspec/changes/add-github-actions-ci/proposal.md
