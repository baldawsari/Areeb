#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "  AI Agent Team - Setup Script"
echo "  BMAD Method + OpenClaw Orchestration"
echo "================================================"
echo ""

# Check prerequisites
check_prereq() {
    if ! command -v "$1" &> /dev/null; then
        echo "ERROR: $1 is required but not installed."
        exit 1
    fi
    echo "✓ $1 found"
}

echo "Checking prerequisites..."
check_prereq "node"
check_prereq "npm"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "ERROR: Node.js v22+ is required. Found: $(node -v)"
    exit 1
fi
echo "✓ Node.js version OK: $(node -v)"
echo ""

# Install OpenClaw
echo "Installing OpenClaw..."
npm install -g openclaw@latest
echo "✓ OpenClaw installed"
echo ""

# Setup environment
if [ ! -f "./openclaw/.env" ]; then
    echo "Creating .env from template..."
    cp ./openclaw/.env.example ./openclaw/.env
    echo "⚠ Please edit ./openclaw/.env with your API keys"
    echo ""
fi

# Install dashboard dependencies
echo "Installing dashboard dependencies..."
cd dashboard && npm install && cd ..
echo "✓ Dashboard dependencies installed"
echo ""

# Initialize OpenClaw workspace
echo "Initializing OpenClaw workspace..."
mkdir -p ~/.openclaw/agents/{analyst,pm,architect,developer,tester,scrum-master}
echo "✓ Agent directories created"
echo ""

# Install QMD (optional)
echo "Installing QMD for advanced memory..."
if command -v bun &> /dev/null; then
    bunx qmd --version 2>/dev/null && echo "✓ QMD available" || echo "⚠ QMD install may need manual setup"
else
    echo "⚠ Bun not found. QMD requires Bun. Install from: https://bun.sh"
fi
echo ""

echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Edit ./openclaw/.env with your API keys"
echo "  2. Run: docker compose up -d"
echo "  3. Or manually:"
echo "     - openclaw gateway start (in openclaw/ dir)"
echo "     - cd dashboard && npm run dev"
echo "  4. Open http://localhost:3000 for the dashboard"
echo ""
echo "To add channels:"
echo "  - Telegram: openclaw channels add telegram"
echo "  - Slack: openclaw channels add slack"
echo ""
