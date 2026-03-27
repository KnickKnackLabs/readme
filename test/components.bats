#!/usr/bin/env bats
# Component rendering tests

REPO_DIR="$BATS_TEST_DIRNAME/.."

# Helper: render a TSX snippet and capture output
render() {
  local tsx="$BATS_TEST_TMPDIR/test.tsx"
  cat > "$tsx" <<TSX
/** @jsxImportSource jsx-md */
import { $1 } from "readme/src/components";
const out = $2;
console.log(out);
TSX

  local tsconfig="$BATS_TEST_TMPDIR/tsconfig.json"
  cat > "$tsconfig" <<CONF
{
  "compilerOptions": {
    "paths": {
      "jsx-md/jsx-runtime": ["$REPO_DIR/src/jsx-runtime.ts"],
      "jsx-md/jsx-dev-runtime": ["$REPO_DIR/src/jsx-dev-runtime.ts"],
      "readme/*": ["$REPO_DIR/*"]
    }
  }
}
CONF

  bun run --tsconfig-override "$tsconfig" "$tsx" 2>/dev/null
}

# ============================================================================
# Chat component
# ============================================================================

@test "Chat: renders children as-is" {
  run render "Chat" '<Chat>{"hello"}</Chat>'
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "hello"
}

@test "Chat: wraps multiple messages" {
  run render "Chat, Message" '<Chat><Message from="alice">hi</Message><Message from="bob">hey</Message></Chat>'
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "alice"
  echo "$output" | grep -q "bob"
}

# ============================================================================
# Message component
# ============================================================================

@test "Message: renders sender name in bold" {
  run render "Message" '<Message from="alice">hello</Message>'
  [ "$status" -eq 0 ]
  echo "$output" | grep -Fq '**alice**'
}

@test "Message: renders body as blockquote" {
  run render "Message" '<Message from="alice">hello world</Message>'
  [ "$status" -eq 0 ]
  echo "$output" | grep -q '> hello world'
}

@test "Message: renders badge prefix" {
  run render "Message" '<Message from="junior" badge="R">test</Message>'
  [ "$status" -eq 0 ]
  echo "$output" | grep -Fq '**R junior**'
}

@test "Message: renders timestamp" {
  run render "Message" '<Message from="alice" timestamp="10:58 PM">hi</Message>'
  [ "$status" -eq 0 ]
  echo "$output" | grep -q '<sub>10:58 PM</sub>'
}

@test "Message: works without optional props" {
  run render "Message" '<Message from="alice">just text</Message>'
  [ "$status" -eq 0 ]
  # No badge prefix
  echo "$output" | grep -Fq '**alice**'
  # No timestamp
  ! echo "$output" | grep -q '<sub>'
}
