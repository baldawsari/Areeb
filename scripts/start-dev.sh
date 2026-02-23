#!/usr/bin/env bash
set -euo pipefail

echo "Starting AI Agent Team (Development Mode)..."
echo ""

# Start gateway in background
echo "Starting OpenClaw Gateway..."
cd openclaw
openclaw gateway start &
GATEWAY_PID=$!
cd ..
echo "Gateway PID: $GATEWAY_PID"

# Start dashboard
echo "Starting Dashboard..."
cd dashboard
npm run dev &
DASHBOARD_PID=$!
cd ..
echo "Dashboard PID: $DASHBOARD_PID"

echo ""
echo "Services running:"
echo "  Gateway: ws://127.0.0.1:18789"
echo "  Dashboard: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap cleanup
cleanup() {
    echo "Stopping services..."
    kill $GATEWAY_PID 2>/dev/null
    kill $DASHBOARD_PID 2>/dev/null
    echo "Done."
}
trap cleanup EXIT INT TERM

wait
