# Code Style

Repository configuration and nearby source files are authoritative. Avoid applying formatting rules from another app or project without checking its local setup.

## Practical Rules

- Preserve the touched file's indentation, import organization, naming, and formatting conventions.
- Use explicit, readable control flow. Prefer braces for multi-step branches and avoid hiding side effects in complex expressions.
- Keep persistence, external calls, error handling, and returned results visually distinct in multi-step use cases.
- Await asynchronous operations before branching on their results; give important results descriptive names.
- Keep edits focused. Do not reformat unrelated code while implementing a behavior change.
- Add or update tests at the layer that owns the behavior. Prefer a focused test before broad validation.

## Validation

Use the app's own scripts. The API README documents `check-types`, `lint`, `test`, and `build` for `scholark-portal-api`; the web app scripts are in its `package.json`. Do not claim a check passed unless it was run.
