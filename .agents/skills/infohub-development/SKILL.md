---
name: infohub-development
description: Develop and maintain the InfoHub repository using its architecture, security, validation, and Git conventions. Use for implementation, bug fixes, refactors, tests, and maintenance in InfoHub.
---

# InfoHub Development

## Before changes

1. Inspect Git status.
2. Read the relevant project documentation.
3. Locate the existing implementation before designing a replacement.
4. Identify security and production implications.

## During changes

- Prefer the smallest change that solves the task.
- Preserve existing contracts unless intentionally changing them.
- Keep secrets out of code and logs.
- Validate external input.
- Use parameterized SQL.
- Keep pipeline stages explicit and recoverable.
- Avoid destructive shortcuts.

## After changes

Run relevant tests and checks.

For application changes, normally run:

- `npm run lint`
- `npm run build`
- relevant tests
- `git diff --check`

Review the diff before committing.

Report:

- what changed;
- what was validated;
- any remaining risks;
- any human decision still required.
