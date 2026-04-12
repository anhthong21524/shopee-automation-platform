#!/bin/bash
# Block destructive operations that could cause data loss.
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# Block rm -rf on project root or src directories
if echo "$command" | grep -qE 'rm\s+-rf?\s+(\.|/|src|apps|packages|node_modules\/[^@])'; then
  echo "ERROR: Destructive rm blocked. Confirm and run manually if intentional." >&2
  exit 2
fi

# Block force push to main/master
if echo "$command" | grep -qE 'git push.*--force.*(main|master)|git push.*-f.*(main|master)'; then
  echo "ERROR: Force push to main/master is not allowed." >&2
  exit 2
fi

exit 0
