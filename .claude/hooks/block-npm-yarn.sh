#!/bin/bash
# Block npm install and yarn install — this project uses pnpm only.
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

if echo "$command" | grep -qE '^\s*(npm install|npm i |yarn install|yarn add|yarn remove)'; then
  echo "ERROR: Use pnpm instead of npm/yarn. This is a pnpm workspace." >&2
  exit 2
fi

exit 0
