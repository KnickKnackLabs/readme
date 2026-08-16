#!/usr/bin/env bash

readme() {
  if [ -z "${README_CALLER_PWD:-}" ]; then
    echo "README_CALLER_PWD not set" >&2
    return 1
  fi

  (cd "$REPO_DIR" && README_CALLER_PWD="$README_CALLER_PWD" mise run "$@")
}
export -f readme

setup() {
  export README_CALLER_PWD="$BATS_TEST_TMPDIR"
}
