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
  export BATS_COMMAND="$TEST_BIN/bats"
  export CALLS
  export README_CALLER_PWD="$BATS_TEST_TMPDIR"
}

@test "test runs both suites by default with four Rush jobs" {
  run readme test

  [ "$status" -eq 0 ]
  [ "$(wc -l < "$CALLS" | tr -d ' ')" -eq 2 ]
  grep -q '^bun <test> ' "$CALLS"
  grep -q "^bats <--jobs> <4> <--parallel-binary-name> <rush> <$REPO_DIR/test>$" "$CALLS"
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
  grep -q "<--jobs> <4> <--parallel-binary-name> <rush> <--filter> <lifecycle> <$REPO_DIR/test/pre-commit.bats>" "$CALLS"
  ! grep -q '^bun ' "$CALLS"
}

@test "test bats does not confuse a filter value with a suite name" {
  run readme test bats --filter pre-commit

  [ "$status" -eq 0 ]
  grep -q "<--filter> <pre-commit> <$REPO_DIR/test>" "$CALLS"
}

@test "test bats preserves explicit serial execution" {
  run readme test bats pre-commit --jobs 1

  [ "$status" -eq 0 ]
  grep -q "^bats <--jobs> <1> <$REPO_DIR/test/pre-commit.bats>$" "$CALLS"
  ! grep -q '<--jobs> <4>' "$CALLS"
  ! grep -q '<--parallel-binary-name>' "$CALLS"
}

@test "test bats runs tests within one file concurrently through the public wrapper" {
  local barrier_dir="$BATS_TEST_TMPDIR/public barrier"
  local barrier_suite="$BATS_TEST_TMPDIR/within-file-barrier.bats"
  mkdir -p "$barrier_dir"

  cat > "$barrier_suite" <<'BATS'
#!/usr/bin/env bats

wait_for_peer() {
  local peer="$1"
  local attempt=0
  while [ "$attempt" -lt 60 ]; do
    [ -f "$BARRIER_DIR/$peer" ] && return 0
    sleep 0.05
    attempt=$((attempt + 1))
  done
  return 1
}

@test "first reaches the shared barrier" {
  touch "$BARRIER_DIR/first"
  wait_for_peer second
}

@test "second reaches the shared barrier" {
  touch "$BARRIER_DIR/second"
  wait_for_peer first
}
BATS

  export BARRIER_DIR="$barrier_dir"
  unset BATS_COMMAND

  run readme test bats "$barrier_suite"

  [ "$status" -eq 0 ]
  [[ "$output" == *"1..2"* ]]
  [[ "$output" == *"ok 1 first reaches the shared barrier"* ]]
  [[ "$output" == *"ok 2 second reaches the shared barrier"* ]]
}

@test "test rejects an unknown suite" {
  run readme test unknown

  [ "$status" -eq 2 ]
  [[ "$output" == *"unknown suite"* ]]
  [ ! -s "$CALLS" ]
}
