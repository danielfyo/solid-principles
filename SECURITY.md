# Security Policy

This repository contains educational examples; it is not a deployed product. Still, the examples
should never teach insecure practices, and the build pipeline and dependencies are kept secure.

## Supported versions

Only the latest release on `main` receives fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private reporting instead: go to the **Security** tab of this repository and choose
**Report a vulnerability**. You will receive an answer within 7 days, and a fix or mitigation plan as
soon as the issue is confirmed.

Examples of what to report:

- Example code that demonstrates an insecure practice (injection, secrets in code, unsafe deserialisation…).
- A vulnerable dependency that Dependabot has not flagged.
- A weakness in the GitHub Actions workflows (for example, script injection or excessive permissions).

## Automated checks

- **CodeQL** scans every pull request and `main` weekly.
- **Dependabot** opens weekly pull requests for NuGet, pip, Go modules, npm and GitHub Actions.
