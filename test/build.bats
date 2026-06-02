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
