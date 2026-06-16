#!/usr/bin/env bats
# readme build task test suite

REPO_DIR="$BATS_TEST_DIRNAME/.."

setup() {
  export TARGET_REPO="$BATS_TEST_TMPDIR/project"
  mkdir -p "$TARGET_REPO"
  cat > "$TARGET_REPO/README.tsx" <<'TSX'
/** @jsxImportSource jsx-md */
import { Heading } from "readme/src/components";
const readme = <Heading level={1}>Hello</Heading>;
console.log(readme);
TSX
}

mtime() {
  stat -f "%m" "$1" 2>/dev/null || stat -c "%Y" "$1"
}

@test "build requires package-scoped caller cwd even when mise -C runs from the package" {
  run bash -c "cd '$TARGET_REPO' && mise -C '$REPO_DIR' run -q build --check"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "README_CALLER_PWD is not set"
}

@test "build writes README.md in README_CALLER_PWD target" {
  run bash -c "cd /tmp && README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build"
  [ "$status" -eq 0 ]
  grep -q "Hello" "$TARGET_REPO/README.md"
}

@test "check validates README.md in README_CALLER_PWD target" {
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q build

  run bash -c "cd /tmp && README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --check"
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "README.md is up to date"
}

@test "build skips rewriting README.md when rendered content matches" {
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q build
  before=$(mtime "$TARGET_REPO/README.md")

  sleep 1
  run bash -c "cd /tmp && README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build"
  after=$(mtime "$TARGET_REPO/README.md")

  [ "$status" -eq 0 ]
  echo "$output" | grep -q "README.md already up to date"
  [ "$before" = "$after" ]
}

@test "build --check fails after manual README edit even when README.md is newest" {
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q build
  printf '\nBROKEN MANUAL EDIT\n' >> "$TARGET_REPO/README.md"
  touch "$TARGET_REPO/README.md"

  run bash -c "cd /tmp && README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --check"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "README.md is out of date"
  echo "$output" | grep -q "BROKEN MANUAL EDIT"
}

@test "build without --check ignores stale usage_check env" {
  run bash -c "cd /tmp && usage_check=true README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build"
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "Generated README.md"
  grep -q "Hello" "$TARGET_REPO/README.md"
}
