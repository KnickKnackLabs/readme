#!/usr/bin/env bats
# readme docs task test suite

REPO_DIR="$BATS_TEST_DIRNAME/.."

setup() {
  export TARGET_REPO="$BATS_TEST_TMPDIR/project"
  mkdir -p "$TARGET_REPO/.mise/tasks"

  # Create a minimal mise task to document
  cat > "$TARGET_REPO/.mise/tasks/build" <<'TASK'
#!/usr/bin/env bash
#MISE description="Build the project"
#USAGE flag "--check" help="Verify output is up to date"
TASK
  chmod +x "$TARGET_REPO/.mise/tasks/build"
}

mtime() {
  stat -c "%Y" "$1" 2>/dev/null || stat -f "%m" "$1"
}

@test "docs requires README_CALLER_PWD even when mise -C runs from the package" {
  run bash -c "cd '$TARGET_REPO' && mise -C '$REPO_DIR' run -q docs"
  [ "$status" -ne 0 ]
  echo "$output" | grep -q "README_CALLER_PWD is not set"
}

@test "docs generates docs/index.html in the target directory" {
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q docs

  [ -f "$TARGET_REPO/docs/index.html" ]
  grep -q "<h1>project</h1>" "$TARGET_REPO/docs/index.html"
  grep -q "build" "$TARGET_REPO/docs/index.html"
  grep -q "Build the project" "$TARGET_REPO/docs/index.html"
}

@test "docs is content-aware — skips rewrite when content unchanged" {
  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q docs
  mtime_before=$(mtime "$TARGET_REPO/docs/index.html")

  sleep 1
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q docs"
  mtime_after=$(mtime "$TARGET_REPO/docs/index.html")

  [ "$status" -eq 0 ]
  echo "$output" | grep -q "already up to date"
  [ "$mtime_before" -eq "$mtime_after" ]
}

@test "docs uses --name flag for the h1 title" {
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q docs --name 'My Awesome Tool'"
  [ "$status" -eq 0 ]
  grep -q "<h1>My Awesome Tool</h1>" "$TARGET_REPO/docs/index.html"
}

@test "docs uses --tagline flag" {
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q docs --name 'tool' --tagline 'A fantastic CLI'"
  [ "$status" -eq 0 ]
  grep -q "A fantastic CLI" "$TARGET_REPO/docs/index.html"
}

@test "docs uses --repo flag for footer links" {
  run bash -c "README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q docs --name 'tool' --repo 'https://github.com/user/tool'"
  [ "$status" -eq 0 ]
  grep -q "https://github.com/user/tool" "$TARGET_REPO/docs/index.html"
  grep -q "Issues" "$TARGET_REPO/docs/index.html"
}

@test "docs defaults repo URL from git remote" {
  git -C "$TARGET_REPO" init -q -b main
  git -C "$TARGET_REPO" remote add origin git@github.com:KnickKnackLabs/readme.git

  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q docs

  grep -q "https://github.com/KnickKnackLabs/readme" "$TARGET_REPO/docs/index.html"
  grep -q "https://github.com/KnickKnackLabs/readme/issues" "$TARGET_REPO/docs/index.html"
}

@test "docs without flags ignores stale usage env" {
  run bash -c "usage_name='Wrong Tool' usage_tagline='Wrong tagline' usage_repo='https://example.com/wrong' README_CALLER_PWD='$TARGET_REPO' mise -C '$REPO_DIR' run -q docs"
  [ "$status" -eq 0 ]
  grep -q "<h1>project</h1>" "$TARGET_REPO/docs/index.html"
  ! grep -q "Wrong Tool" "$TARGET_REPO/docs/index.html"
  ! grep -q "Wrong tagline" "$TARGET_REPO/docs/index.html"
  ! grep -q "https://example.com/wrong" "$TARGET_REPO/docs/index.html"
}

@test "docs shows noop message when target has no .mise/tasks" {
  TARGET_WITHOUT_TASKS="$BATS_TEST_TMPDIR/empty"
  mkdir -p "$TARGET_WITHOUT_TASKS"

  run bash -c "README_CALLER_PWD='$TARGET_WITHOUT_TASKS' mise -C '$REPO_DIR' run -q docs"
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "nothing to document"
}

@test "docs renders flags with value placeholders" {
  # Add a task with value flag
  cat > "$TARGET_REPO/.mise/tasks/deploy" <<'TASK'
#!/usr/bin/env bash
#MISE description="Deploy to environment"
#USAGE flag "--env <name>" help="Target environment" required=#true
TASK
  chmod +x "$TARGET_REPO/.mise/tasks/deploy"

  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q docs

  grep -q "deploy" "$TARGET_REPO/docs/index.html"
  grep -q "required" "$TARGET_REPO/docs/index.html"
}

@test "docs renders args" {
  # Add a task with args
  cat > "$TARGET_REPO/.mise/tasks/run" <<'TASK'
#!/usr/bin/env bash
#MISE description="Run a command"
#USAGE arg "<cmd>" help="Command to run"
#USAGE arg "[args]" help="Additional arguments"
TASK
  chmod +x "$TARGET_REPO/.mise/tasks/run"

  README_CALLER_PWD="$TARGET_REPO" mise -C "$REPO_DIR" run -q docs

  grep -q "run" "$TARGET_REPO/docs/index.html"
  grep -q "(optional)" "$TARGET_REPO/docs/index.html"
}
