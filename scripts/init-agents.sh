#!/usr/bin/env bash
set -euo pipefail

echo "Initializing AI Agent Team..."

AGENTS=("analyst" "pm" "architect" "developer" "tester" "scrum-master")

for agent in "${AGENTS[@]}"; do
    echo "Registering agent: $agent"
    openclaw agents add "$agent" \
        --workspace "./openclaw/agents/$agent" \
        --config "./openclaw/config.yaml" 2>/dev/null || echo "  Agent $agent may already exist"
done

echo ""
echo "Agent team initialized. Verify with: openclaw agents list --bindings"
