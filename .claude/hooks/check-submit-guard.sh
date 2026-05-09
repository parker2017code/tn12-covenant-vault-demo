#!/usr/bin/env bash
# Reads the tool input from stdin (JSON). Checks two guards:
# 1. Block any Bash command containing --submit (prevent accidental TN12 transaction submission)
# 2. Block any git commit that has .local/ files staged (prevent private key leakage)
# Exit 2 = block + show message. Exit 0 = allow.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null)

# Guard 1: --submit without explicit user intent
if echo "$COMMAND" | grep -q -- '--submit'; then
  echo "BLOCKED: command contains --submit which submits a real transaction to TN12."
  echo "Only proceed if the user has explicitly asked to submit. Use dry-run (no --submit) first."
  exit 2
fi

# Guard 2: git commit with .local/ staged
if echo "$COMMAND" | grep -qE '^git (commit|add .*)'; then
  STAGED=$(git -C /home/parker2017/tn12-covenant-vault-demo diff --cached --name-only 2>/dev/null)
  if echo "$STAGED" | grep -q '\.local/'; then
    echo "BLOCKED: .local/ files are staged for commit. This directory contains private keys."
    echo "Run: git reset HEAD .local/ to unstage them."
    exit 2
  fi
fi

exit 0
