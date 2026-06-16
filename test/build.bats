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

# Write a second TSX source under the target repo (optionally in a subdir).
make_guide() {
  local rel="$1" word="${2:-Guide}"
  mkdir -p "$TARGET_REPO/$(dirname "$rel")"
  cat > "$TARGET_REPO/$rel" <<TSX
/** @jsxImportSource jsx-md */
import { Heading } from "readme/src/components";
const readme = <Heading level={1}>$word</Heading>;
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

# --- --file / --output ---

@test "build --file renders the named TSX to the auto-mapped .md" {
  make_guide "docs/Guide.tsx" "GuideDoc"

  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --file docs/Guide.tsx"
  [ "$status" -eq 0 ]
  grep -q "GuideDoc" "$TARGET_REPO/docs/Guide.md"
  # default README.md must not be created as a side effect
  [ ! -f "$TARGET_REPO/README.md" ]
}

@test "build --output overrides the destination" {
  make_guide "Guide.tsx" "GuideDoc"

  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --file Guide.tsx --output out/custom.md"
  [ "$status" -eq 0 ]
  grep -q "GuideDoc" "$TARGET_REPO/out/custom.md"
  [ ! -f "$TARGET_REPO/Guide.md" ]
}

@test "build --file skips rewriting the resolved output when content matches" {
  make_guide "docs/Guide.tsx" "GuideDoc"
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q build --file docs/Guide.tsx
  before=$(mtime "$TARGET_REPO/docs/Guide.md")

  sleep 1
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --file docs/Guide.tsx"
  after=$(mtime "$TARGET_REPO/docs/Guide.md")

  [ "$status" -eq 0 ]
  echo "$output" | grep -q "Guide.md already up to date"
  [ "$before" = "$after" ]
}

@test "build --check on a --file target is fail-closed" {
  make_guide "docs/Guide.tsx" "GuideDoc"
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q build --file docs/Guide.tsx

  # fresh -> up to date
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --file docs/Guide.tsx --check"
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "Guide.md is up to date"

  # stale -> exit 1
  printf '\nBROKEN MANUAL EDIT\n' >> "$TARGET_REPO/docs/Guide.md"
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --file docs/Guide.tsx --check"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "Guide.md is out of date"
}

@test "build --file errors when the source is missing" {
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build --file docs/Missing.tsx"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "No Missing.tsx found"
}

@test "build without --file ignores stale usage_file env" {
  make_guide "Other.tsx" "OtherDoc"

  run bash -c "usage_file=Other.tsx README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build"
  [ "$status" -eq 0 ]
  grep -q "Hello" "$TARGET_REPO/README.md"
  [ ! -f "$TARGET_REPO/Other.md" ]
}

@test "build without --output ignores stale usage_output env" {
  run bash -c "usage_output=out/stale.md README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q build"
  [ "$status" -eq 0 ]
  grep -q "Hello" "$TARGET_REPO/README.md"
  [ ! -f "$TARGET_REPO/out/stale.md" ]
}
