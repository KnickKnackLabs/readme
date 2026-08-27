#!/usr/bin/env bats

bats_require_minimum_version 1.5.0

load test_helper

write_passing_test() {
  local path="$1" name="$2"
  local test_keyword='@test'
  mkdir -p "$(dirname "$path")"
  {
    printf '%s\n' '#!/usr/bin/env bats'
    printf '%s\n' "$test_keyword \"$name\" {"
    printf '%s\n' '  true' '}'
  } > "$path"
}

write_barrier_test() {
  local path="$1" name="$2" own="$3" peer="$4"
  local test_keyword='@test'
  mkdir -p "$(dirname "$path")"
  {
    printf '%s\n' '#!/usr/bin/env bats'
    printf '%s\n' "$test_keyword \"$name\" {"
    printf '  touch "$PROBE_DIR/%s"\n' "$own"
    printf '%s\n' \
      '  for _ in {1..50}; do' \
      "    [ ! -e \"\$PROBE_DIR/$peer\" ] || return 0" \
      '    sleep 0.05' \
      '  done' \
      '  false' \
      '}'
  } > "$path"
}

@test "options-only BATS calls use the configured default test directory" {
  run readme test bats --jobs 1 --filter '^build requires package-scoped caller cwd$'

  [ "$status" -eq 0 ]
  [[ "$output" == *'1..1'* ]]
  [[ "$output" == *'ok 1 build requires package-scoped caller cwd'* ]]
}

@test "an explicit BATS target takes precedence over the configured default" {
  local target="$BATS_TEST_TMPDIR/explicit.bats"
  write_passing_test "$target" 'explicit target only'

  run readme test bats --jobs 1 "$target"

  [ "$status" -eq 0 ]
  [[ "$output" == *'1..1'* ]]
  [[ "$output" == *'ok 1 explicit target only'* ]]
}

@test "relative BATS targets resolve from the repository root" {
  run readme test bats --jobs 1 test/build.bats --filter '^build requires package-scoped caller cwd$'

  [ "$status" -eq 0 ]
  [[ "$output" == *'1..1'* ]]
  [[ "$output" == *'ok 1 build requires package-scoped caller cwd'* ]]
}

@test "whitespace-bearing explicit BATS targets remain one argument" {
  local target="$BATS_TEST_TMPDIR/explicit target/passing test.bats"
  write_passing_test "$target" 'whitespace target'

  run readme test bats --jobs 2 "$target"

  [ "$status" -eq 0 ]
  [[ "$output" == *'1..1'* ]]
  [[ "$output" == *'ok 1 whitespace target'* ]]
}

@test "public Readme test path runs separate BATS files concurrently" {
  local suite_dir="$BATS_TEST_TMPDIR/across-file-probe"
  export PROBE_DIR="$BATS_TEST_TMPDIR/across-file-barrier"
  mkdir -p "$PROBE_DIR"
  write_barrier_test "$suite_dir/one.bats" 'first file observes second file' one two
  write_barrier_test "$suite_dir/two.bats" 'second file observes first file' two one

  run readme test bats "$suite_dir"

  [ "$status" -eq 0 ]
}

@test "public Readme test path runs tests within one BATS file concurrently" {
  local target="$BATS_TEST_TMPDIR/within-file-probe.bats"
  local first="$BATS_TEST_TMPDIR/first.bats"
  local second="$BATS_TEST_TMPDIR/second.bats"
  export PROBE_DIR="$BATS_TEST_TMPDIR/within-file-barrier"
  mkdir -p "$PROBE_DIR"
  write_barrier_test "$first" 'first test observes second test' one two
  write_barrier_test "$second" 'second test observes first test' two one
  {
    head -n 1 "$first"
    tail -n +2 "$first"
    tail -n +2 "$second"
  } > "$target"

  run readme test bats "$target"

  [ "$status" -eq 0 ]
}

@test "Bun suite selection forwards arguments only to Bun" {
  local calls="$BATS_TEST_TMPDIR/bun-calls"
  local mock_bun="$BATS_TEST_TMPDIR/bun"
  cat > "$mock_bun" <<'SH'
#!/usr/bin/env bash
printf 'bun <%s>\n' "$*" > "$BUN_CALLS"
SH
  chmod +x "$mock_bun"
  export BUN_CALLS="$calls"
  export PATH="$BATS_TEST_TMPDIR:$PATH"

  run readme test bun --test-name-pattern Badge

  [ "$status" -eq 0 ]
  grep -q 'bun <test .*src --test-name-pattern Badge>' "$calls"
}

@test "test rejects an unknown suite" {
  run readme test unknown

  [ "$status" -eq 2 ]
  [[ "$output" == *"unknown suite"* ]]
}
