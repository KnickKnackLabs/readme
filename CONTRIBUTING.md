# Contributing

`readme` turns JSX components into Markdown with Bun and exposes its user-facing commands through Mise and Shiv.

## Repository map

- `src/` owns the JSX runtime, components, and TypeScript tests.
- `.mise/tasks/` owns the public command surface.
- `libexec/` owns task workflows that need more structure than a thin entry point.
- `test/` exercises shell and Mise behavior with BATS.
- `README.tsx` is the source for the generated `README.md`.
- `action.yml` exposes the generated-README check to GitHub Actions consumers.

## Setup

```bash
mise trust
mise install
```

## Validation

Run both maintained test systems through the stable aggregate task:

```bash
mise run test
```

During iteration, select one system or one BATS suite explicitly:

```bash
mise run test bun
mise run test bats pre-commit
mise run test bats --filter lifecycle
```

Before merge, also run the configured convention lints and verify generated output:

```bash
codebase lint "$PWD"
README_CALLER_PWD="$PWD" mise run build --check
README_CALLER_PWD="$PWD" mise run docs
git diff --exit-code -- docs/index.html
git diff --check
```

Regenerate checked-in output after changing its source:

```bash
README_CALLER_PWD="$PWD" mise run build # README.tsx → README.md
README_CALLER_PWD="$PWD" mise run docs  # .mise/tasks → docs/index.html
```

Public task tests should use the Mise path so they cover routing, argument parsing, and package-scoped caller context. Keep TypeScript behavior in Bun tests and shell/task behavior in BATS.
