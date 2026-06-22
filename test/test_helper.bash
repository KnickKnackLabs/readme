#!/usr/bin/env bash
# Shared fixtures for readme tests.

# Run a repo task through mise so tests exercise the real task path.
# Stderr is redirected to $BATS_TEST_TMPDIR/stderr so tests can check
# error messages without warnings polluting $output.
readme() {
  if [ -z "${README_CALLER_PWD:-}" ]; then
    echo "README_CALLER_PWD not set" >&2
    return 1
  fi
  cd "$REPO_DIR" && README_CALLER_PWD="$README_CALLER_PWD" mise run -q "$@" 2>"$BATS_TEST_TMPDIR/stderr"
}
export -f readme

setup() {
  export README_CALLER_PWD="$BATS_TEST_TMPDIR"
}
