# AI Agent Team

**BMAD Method + OpenClaw Orchestration with Kanban Dashboard**

A self-hosted AI agent team that uses [OpenClaw](https://github.com/openclaw/openclaw) for multi-agent orchestration and [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) workflows for structured, agile AI-driven development. Includes a real-time Kanban dashboard, inter-agent communication, and integrations with Telegram, Slack, and Voice.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Communication Channels                 │
│              Telegram │ Slack │ Voice (ElevenLabs)       │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                 OpenClaw Gateway (:18789)                 │
│          Multi-Agent Routing │ Session Management        │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    Agent Team (BMAD)                      │
│                                                          │
│  ┌──────────┐  ┌────────┐  ┌───────────┐               │
│  │ Analyst  │→ │   PM   │→ │ Architect │  Opus 4.6     │
│  │(Opus 4.6)│  │(Sonnet)│  │(Opus 4.6) │  = Deep Think │
│  └──────────┘  └────────┘  └─────┬─────┘  Sonnet 4.6   │
│                                  │         = Routine     │
│  ┌──────────┐  ┌────────┐  ┌────▼──────┐               │
│  │  Scrum   │← │ Tester │← │ Developer │               │
│  │ Master   │  │(Sonnet)│  │ (Sonnet)  │               │
│  └──────────┘  └────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              QMD Memory Backend (Local)                   │
│       BM25 + Vectors + Reranking │ Session Memory        │
│           File-first │ Temporal Decay │ MMR Dedup        │
└─────────────────────────────────────────────────────────┘
```

## Agent Team

| Agent | Model | Role |
|-------|-------|------|
| **Business Analyst** | Opus 4.6 | Requirements gathering, project briefs, market research |
| **Product Manager** | Sonnet 4.6 | PRDs, roadmaps, sprint planning, prioritization |
| **Solutions Architect** | Opus 4.6 | System design, tech decisions, architecture docs |
| **Senior Developer** | Sonnet 4.6 | Implementation, code quality, integrations |
| **QA Engineer** | Sonnet 4.6 | Test plans, test execution, quality validation |
| **Scrum Master** | Sonnet 4.6 | Sprint facilitation, kanban board, blocker removal |

## BMAD Workflows

- **Project Kickoff** - Analyst -> PM -> Architect -> Developer -> Tester -> Scrum Master
- **Feature Development** - End-to-end feature implementation from spec to deployment
- **Bug Fix** - Triage -> Fix -> Verify -> Close
- **Code Review** - Multi-agent review with architecture and testing validation

## Project Structure

```
├── openclaw/                    # OpenClaw configuration
│   ├── config.yaml              # Multi-agent gateway config
│   ├── .env.example             # Environment variables template
│   ├── workspace/               # Shared workspace (AGENTS.md, SOUL.md, memory/)
│   └── agents/                  # Per-agent workspaces (6 agents)
│       ├── analyst/             # SOUL.md + AGENTS.md
│       ├── pm/
│       ├── architect/
│       ├── developer/
│       ├── tester/
│       └── scrum-master/
├── bmad/                        # BMAD workflow definitions
│   ├── workflows/               # 4 workflow definitions (YAML)
│   ├── tasks/                   # 5 task definitions
│   ├── templates/               # Document templates (brief, PRD, arch, test plan)
│   └── checklists/              # DoD, sprint review, architecture review
├── dashboard/                   # Kanban dashboard (React + Vite + Tailwind)
│   ├── src/components/          # KanbanBoard, TaskCard, AgentPanel, MessageFeed
│   ├── src/pages/               # Dashboard, Agents, Workflows pages
│   └── src/lib/                 # Zustand store, agent definitions
├── scripts/                     # Setup, init, and dev scripts
├── docker-compose.yml           # Full stack deployment
└── docs/architecture.md         # Architecture documentation
```

## Quick Start

### Prerequisites
- Node.js v22+
- npm
- Docker (optional, for containerized deployment)

### Setup

```bash
# Clone and install
git clone <repo-url> && cd Areeb
npm run setup

# Configure API keys
cp openclaw/.env.example openclaw/.env
# Edit openclaw/.env with your keys:
#   ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, SLACK_BOT_TOKEN, ELEVENLABS_API_KEY

# Initialize agents
npm run init-agents

# Start development
npm run dev
```

### Docker Deployment

```bash
docker compose up -d
# Gateway: ws://127.0.0.1:18789
# Dashboard: http://localhost:3000
# QMD: http://localhost:9876
```

## Dashboard

The Kanban dashboard at `http://localhost:3000` provides:
- **Kanban Board** - Drag-and-drop task management across 5 columns (Backlog to Done)
- **Agent Panel** - Real-time agent status, current tasks, and model info
- **Message Feed** - Inter-agent communication with filtering and compose
- **Workflow View** - Active workflow tracking with progress indicators
- **Agent Page** - Detailed agent management and message history
- **Workflow Page** - Workflow templates and active workflow monitoring

## Memory System

Uses OpenClaw's file-first memory with **QMD backend** for advanced retrieval:
- **Hybrid search**: 70% vector + 30% BM25 (configurable)
- **Temporal decay**: Penalizes stale notes, prioritizes recent context
- **MMR deduplication**: Eliminates near-duplicate snippets
- **Session memory**: Exports conversation transcripts for cross-session recall
- **Auto-compaction flush**: Saves context to memory before context window compaction

Memory files:
- `MEMORY.md` - Durable facts and decisions
- `memory/YYYY-MM-DD.md` - Daily progress notes
- Per-agent private memory in agent workspaces

## Channels

| Channel | Library | Config |
|---------|---------|--------|
| **Telegram** | grammY | Bot token via @BotFather |
| **Slack** | Bolt | Socket mode, bot + app tokens |
| **Voice** | ElevenLabs | Always-on speech, multilingual v2 |

## License

MIT