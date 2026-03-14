#!/usr/bin/env bats
# readme pre-commit hook test suite

REPO_DIR="$BATS_TEST_DIRNAME/.."
INSTALL_TASK="$REPO_DIR/.mise/tasks/pre-commit/install"
REMOVE_TASK="$REPO_DIR/.mise/tasks/pre-commit/remove"

setup() {
  # Create a temporary git repo to test in
  export TEST_REPO="$BATS_TEST_TMPDIR/project"
  mkdir -p "$TEST_REPO"
  git -C "$TEST_REPO" init -q -b main
  git -C "$TEST_REPO" config user.email "test@test.com"
  git -C "$TEST_REPO" config user.name "Test"
  touch "$TEST_REPO/file.txt"
  git -C "$TEST_REPO" add .
  git -C "$TEST_REPO" commit -q -m "init"
}

# Helper: run install task targeting the test repo
run_install() {
  local build="${1:-false}"
  local check="${2:-false}"
  CALLER_PWD="$TEST_REPO" usage_build="$build" usage_check="$check" bash "$INSTALL_TASK" 2>&1
}

# Helper: run remove task targeting the test repo
run_remove() {
  CALLER_PWD="$TEST_REPO" bash "$REMOVE_TASK" 2>&1
}

hook_file() {
  echo "$TEST_REPO/.git/hooks/pre-commit"
}

# Helper: put a mock `readme` on PATH that delegates to mise
# This lets integration tests use the real installed hook (which calls `readme`)
# without depending on the shiv shim being installed.
setup_readme_on_path() {
  local mock_bin="$BATS_TEST_TMPDIR/mock-bin"
  mkdir -p "$mock_bin"
  cat > "$mock_bin/readme" <<MOCK
#!/usr/bin/env bash
export CALLER_PWD="\$PWD"
exec mise -C "$REPO_DIR" run -q "\$@"
MOCK
  chmod +x "$mock_bin/readme"
  export PATH="$mock_bin:$PATH"
}

# ============================================================================
# Flag validation
# ============================================================================

@test "install: errors with no flags" {
  run run_install
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "Usage:"
  echo "$output" | grep -q "\-\-build"
  echo "$output" | grep -q "\-\-check"
}

@test "install: errors with both flags" {
  run run_install "true" "true"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "Usage:"
}

# ============================================================================
# Install — build mode
# ============================================================================

@test "install: --build creates hook file" {
  run run_install "true"
  [ "$status" -eq 0 ]
  [ -f "$(hook_file)" ]
  [ -x "$(hook_file)" ]
}

@test "install: --build hook contains build command" {
  run_install "true"
  grep -q "readme build" "$(hook_file)"
  grep -q "git add README.md" "$(hook_file)"
}

@test "install: --build hook has error handling" {
  run_install "true"
  grep -q "readme build ||" "$(hook_file)"
  grep -q "commit aborted" "$(hook_file)"
}

@test "install: --build hook has shebang" {
  run_install "true"
  head -1 "$(hook_file)" | grep -q "#!/usr/bin/env bash"
}

@test "install: --build shows build mode message" {
  run run_install "true"
  echo "$output" | grep -q "build mode"
}

# ============================================================================
# Install — check mode
# ============================================================================

@test "install: --check creates hook file" {
  run run_install "false" "true"
  [ "$status" -eq 0 ]
  [ -f "$(hook_file)" ]
  [ -x "$(hook_file)" ]
}

@test "install: --check hook contains check command" {
  run_install "false" "true"
  grep -q "readme build --check" "$(hook_file)"
}

@test "install: --check hook does not stage README.md" {
  run_install "false" "true"
  ! grep -q "git add README.md" "$(hook_file)"
}

@test "install: --check shows check mode message" {
  run run_install "false" "true"
  echo "$output" | grep -q "check mode"
}

# ============================================================================
# Install — marker comments
# ============================================================================

@test "install: hook has begin and end markers" {
  run_install "true"
  grep -q "readme pre-commit hook begin" "$(hook_file)"
  grep -q "readme pre-commit hook end" "$(hook_file)"
}

@test "install: hook checks for staged README.tsx" {
  run_install "true"
  grep -q 'README.*tsx' "$(hook_file)"
}

# ============================================================================
# Idempotency
# ============================================================================

@test "install: idempotent — skips if already installed" {
  run_install "true"
  run run_install "true"
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "already installed"
}

@test "install: idempotent — does not duplicate hook block" {
  run_install "true"
  run_install "true"
  count=$(grep -c "readme pre-commit hook begin" "$(hook_file)")
  [ "$count" -eq 1 ]
}

# ============================================================================
# Append to existing hook
# ============================================================================

@test "install: appends to existing pre-commit hook" {
  # Create an existing hook
  mkdir -p "$TEST_REPO/.git/hooks"
  cat > "$(hook_file)" <<'HOOK'
#!/usr/bin/env bash
echo "existing hook"
HOOK
  chmod +x "$(hook_file)"

  run_install "true"
  grep -q "existing hook" "$(hook_file)"
  grep -q "readme pre-commit hook begin" "$(hook_file)"
}

# ============================================================================
# Remove
# ============================================================================

@test "remove: removes hook block" {
  run_install "true"
  [ -f "$(hook_file)" ]

  run run_remove
  [ "$status" -eq 0 ]
  [ ! -f "$(hook_file)" ]
}

@test "remove: deletes file when no other hooks remain" {
  run_install "true"
  run run_remove
  [ ! -f "$(hook_file)" ]
  echo "$output" | grep -q "file deleted"
}

@test "remove: preserves other hooks" {
  # Create existing hook, then install readme hook
  mkdir -p "$TEST_REPO/.git/hooks"
  cat > "$(hook_file)" <<'HOOK'
#!/usr/bin/env bash
echo "other hook"
HOOK
  chmod +x "$(hook_file)"
  run_install "true"

  run run_remove
  [ "$status" -eq 0 ]
  [ -f "$(hook_file)" ]
  grep -q "other hook" "$(hook_file)"
  ! grep -q "readme pre-commit hook begin" "$(hook_file)"
  echo "$output" | grep -q "other hooks preserved"
}

@test "remove: no-ops when no hook installed" {
  run run_remove
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "No readme hook found"
}

@test "remove: no-ops when hook file exists but no readme block" {
  mkdir -p "$TEST_REPO/.git/hooks"
  echo '#!/usr/bin/env bash' > "$(hook_file)"
  chmod +x "$(hook_file)"

  run run_remove
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "No readme hook found"
  [ -f "$(hook_file)" ]
}

# ============================================================================
# Install → remove → clean state
# ============================================================================

@test "lifecycle: install and remove leaves no trace" {
  run_install "true"
  [ -f "$(hook_file)" ]
  run_remove
  [ ! -f "$(hook_file)" ]
}

@test "lifecycle: can reinstall after remove" {
  run_install "true"
  run_remove
  run run_install "false" "true"
  [ "$status" -eq 0 ]
  grep -q "readme build --check" "$(hook_file)"
}

# ============================================================================
# Integration — build mode
# ============================================================================

@test "integration: build mode rebuilds README.md on commit" {
  setup_readme_on_path

  # Set up a minimal README.tsx
  cat > "$TEST_REPO/README.tsx" <<'TSX'
/** @jsxImportSource jsx-md */
import { Heading } from "readme/src/components";
const readme = <Heading level={1}>Hello</Heading>;
console.log(readme);
TSX

  # Build initial README.md and commit
  (cd "$TEST_REPO" && readme build)
  git -C "$TEST_REPO" add .
  git -C "$TEST_REPO" commit -q -m "add readme"

  # Install hook via the actual install task
  run_install "true"

  # Modify README.tsx
  cat > "$TEST_REPO/README.tsx" <<'TSX'
/** @jsxImportSource jsx-md */
import { Heading } from "readme/src/components";
const readme = <Heading level={1}>Updated</Heading>;
console.log(readme);
TSX

  # Stage only the TSX, commit — hook should rebuild and stage README.md
  git -C "$TEST_REPO" add README.tsx
  (cd "$TEST_REPO" && git commit -q -m "update readme")

  # Verify README.md was updated
  grep -q "Updated" "$TEST_REPO/README.md"
}

# ============================================================================
# Integration — check mode
# ============================================================================

@test "integration: check mode blocks commit with stale README.md" {
  setup_readme_on_path

  # Set up a minimal README.tsx
  cat > "$TEST_REPO/README.tsx" <<'TSX'
/** @jsxImportSource jsx-md */
import { Heading } from "readme/src/components";
const readme = <Heading level={1}>Hello</Heading>;
console.log(readme);
TSX

  # Build initial README.md and commit
  (cd "$TEST_REPO" && readme build)
  git -C "$TEST_REPO" add .
  git -C "$TEST_REPO" commit -q -m "add readme"

  # Install hook via the actual install task
  run_install "false" "true"

  # Modify README.tsx without rebuilding
  cat > "$TEST_REPO/README.tsx" <<'TSX'
/** @jsxImportSource jsx-md */
import { Heading } from "readme/src/components";
const readme = <Heading level={1}>Changed</Heading>;
console.log(readme);
TSX

  git -C "$TEST_REPO" add README.tsx

  # Commit should fail because README.md is stale
  run bash -c "cd '$TEST_REPO' && git commit -m 'should fail'"
  [ "$status" -ne 0 ]

  # README.md should still have the old content
  grep -q "Hello" "$TEST_REPO/README.md"
}
