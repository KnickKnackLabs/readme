#!/usr/bin/env bats

load test_helper

setup() {
  TEST_BIN="$BATS_TEST_TMPDIR/bin"
  CALLS="$BATS_TEST_TMPDIR/calls"
  mkdir -p "$TEST_BIN"
  : > "$CALLS"

  cat > "$TEST_BIN/bun" <<'SH'
#!/usr/bin/env bash
printf 'bun' >> "$CALLS"
printf ' <%s>' "$@" >> "$CALLS"
printf '\n' >> "$CALLS"
SH
  cat > "$TEST_BIN/bats" <<'SH'
#!/usr/bin/env bash
printf 'bats' >> "$CALLS"
printf ' <%s>' "$@" >> "$CALLS"
printf '\n' >> "$CALLS"
SH
  chmod +x "$TEST_BIN/bun" "$TEST_BIN/bats"
  export BUN="$TEST_BIN/bun"
  export BATS="$TEST_BIN/bats"
  export CALLS
  export README_CALLER_PWD="$BATS_TEST_TMPDIR"
}

@test "test runs both suites by default" {
  run readme test

  [ "$status" -eq 0 ]
  [ "$(wc -l < "$CALLS" | tr -d ' ')" -eq 2 ]
  grep -q '^bun <test> ' "$CALLS"
  grep -q '^bats ' "$CALLS"
}

@test "test bun forwards arguments only to Bun" {
  run readme test bun --test-name-pattern Badge

  [ "$status" -eq 0 ]
  grep -q '<--test-name-pattern> <Badge>' "$CALLS"
  ! grep -q '^bats ' "$CALLS"
}

@test "test bats resolves a suite name and forwards BATS flags" {
  run readme test bats pre-commit --filter lifecycle

  [ "$status" -eq 0 ]
  grep -q "<--filter> <lifecycle> <$REPO_DIR/test/pre-commit.bats>" "$CALLS"
  ! grep -q '^bun ' "$CALLS"
}

@test "test bats does not confuse a filter value with a suite name" {
  run readme test bats --filter pre-commit

  [ "$status" -eq 0 ]
  grep -q "<--filter> <pre-commit> <$REPO_DIR/test>" "$CALLS"
}

@test "test rejects an unknown suite" {
  run readme test unknown

  [ "$status" -eq 2 ]
  [[ "$output" == *"unknown suite"* ]]
  [ ! -s "$CALLS" ]
}
