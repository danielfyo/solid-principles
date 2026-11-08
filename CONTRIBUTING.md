# Contributing

Thanks for helping improve this SOLID master class! Contributions of every size are welcome:
typo fixes, clearer explanations, new exercises, or better examples.

## Ground rules

- **Equivalence across languages.** Every example exists in C#, Python, Go, TypeScript, React and Angular.
  A change to one example must be mirrored in the other five, with equivalent tests.
- **Bad and good versions.** Each principle shows a ❌ `bad` and a ✅ `good` version. Tests prove both
  behave the same and show what the good design makes possible.
- **The README is generated from the code.** Never edit code blocks in `README.md` by hand; edit the
  source files and run `python3 scripts/sync_readme.py`.
- **English only** for code, comments, docs, commits and pull requests.

## Prerequisites

| Toolchain | Version |
| --- | --- |
| .NET SDK | 8.0 |
| Python | 3.12+ |
| Go | 1.22+ |
| Node.js | 22.22+ (required by Angular 22) |

## Running the checks

Run the checks of every project you touched before opening a pull request:

```bash
# .NET
cd dotnet && dotnet test

# Python
cd python && pip install -e ".[dev]" && ruff check . && ruff format --check . && mypy && pytest

# Go
cd go && gofmt -l . && go vet ./... && go test ./...

# TypeScript
cd typescript && npm ci && npm run typecheck && npm test

# React
cd react && npm ci && npm run typecheck && npm test && npm run build

# Angular
cd angular && npm ci && npm run typecheck && npm test && npm run build

# README snippets
python3 scripts/sync_readme.py --check
```

Each project also has a coverage command (`dotnet test --collect:"XPlat Code Coverage"`,
`pytest --cov`, `go test -cover ./...`, `npm run coverage`). CI publishes a coverage summary for every run.

## Commit messages and pull request titles

This repository follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
Releases and `CHANGELOG.md` are generated from them, and CI rejects pull request titles that don't comply.

```text
<type>(<optional scope>): <lowercase description>

feat(go): add an example of the decorator pattern for OCP
fix(react): forward refs in IconButton
docs: clarify the difference between DIP and dependency injection
```

| Type | Use it for | Release impact |
| --- | --- | --- |
| `feat` | a new example, section or exercise | minor |
| `fix` | a bug in code or an error in the docs | patch |
| `docs` | documentation only | none |
| `test`, `refactor`, `perf`, `style` | code changes without new behaviour | none |
| `build`, `ci`, `chore` | tooling, dependencies, pipelines | none |

Useful scopes: `dotnet`, `python`, `go`, `typescript`, `react`, `angular`, `readme`, `ci`.
Add `!` after the type (`feat!:`) for breaking changes.

## Pull request process

Nobody pushes to `main` directly, maintainers included: every change arrives through a pull request.

1. **Fork** the repository and create a branch from `main` (`feat/<topic>`, `fix/<topic>`, `docs/<topic>`).
2. Make your change in all six languages, with tests, and run the checks above.
3. Open a pull request from your fork using the template. Its title must be a Conventional Commit.
4. **Workflow approval.** For security, GitHub Actions do not run on pull requests from outside
   contributors until a maintainer approves them. Expect a short wait before CI starts.
5. **Merge requirements** on `main`:
   - CI, CodeQL and the PR title check are green, with no high-severity code scanning alerts.
   - A code owner has approved the latest changes and every review conversation is resolved.
   - **Commits are signed** ([how to sign commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)).
   - Pull requests are merged with a merge commit or squashed (no rebase merges).

## Code of Conduct

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
