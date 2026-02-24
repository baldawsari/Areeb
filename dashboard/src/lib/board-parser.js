/**
 * Parse board/task data from an agent's MEMORY.md (or standalone board file).
 *
 * The parser looks for recognizable board sections (Sprint, Backlog, Done)
 * within a larger markdown file and ignores unrelated sections.
 *
 * Expected board sections:
 *   ## 🏃 Sprint N (Active) — Started: YYYY-MM-DD
 *   | # | Task | Added | Status |
 *   |---|------|-------|--------|
 *   | 1 | Task description | 2026-02-24 | 🏃 In Progress |
 *
 *   ## 🗂️ Backlog
 *   (same table format)
 *
 *   ## ✅ Done
 *   (same table format or "Nothing completed yet.")
 */

// Map BOARD.md status emojis/text to dashboard column statuses
const STATUS_MAP = {
  'in progress': 'in-progress',
  'to do': 'todo',
  'todo': 'todo',
  'done': 'done',
  'review': 'review',
  'blocked': 'in-progress',
  'backlog': 'backlog',
};

function normalizeStatus(raw, section) {
  const cleaned = raw.replace(/[🏃✅📋🗂️⏳🔄⬜🔲]/gu, '').trim().toLowerCase();
  if (STATUS_MAP[cleaned]) return STATUS_MAP[cleaned];
  // Infer from section context
  if (section === 'done') return 'done';
  if (section === 'backlog') return 'backlog';
  if (cleaned.includes('progress')) return 'in-progress';
  if (cleaned.includes('review')) return 'review';
  if (cleaned.includes('block')) return 'in-progress';
  return 'todo';
}

function parseTableRows(lines) {
  const rows = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed
      .split('|')
      .slice(1, -1) // drop empty first/last from leading/trailing |
      .map((c) => c.trim());
    // Skip header and separator rows
    if (cells.length < 2) continue;
    if (cells.every((c) => /^[-:]+$/.test(c))) continue;
    if (cells[0] === '#' || cells[0].toLowerCase() === 'id') continue;
    rows.push(cells);
  }
  return rows;
}

/**
 * Extract an agent ID from an "Assigned To" column value.
 * Handles formats like "@analyst", "analyst", "@scrum-master", "developer".
 * Returns the cleaned agent ID or null if not parseable.
 */
function extractAgentFromAssignment(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^@/, '').toLowerCase();
  // Known agent IDs
  const KNOWN_AGENTS = ['orchestrator', 'analyst', 'pm', 'architect', 'developer', 'tester', 'scrum-master'];
  if (KNOWN_AGENTS.includes(cleaned)) return cleaned;
  return null;
}

/**
 * Parse BOARD.md content into an array of task objects.
 * @param {string} markdown - Raw BOARD.md content
 * @param {string} agentId - The agent that owns this board (e.g. "scrum-master")
 * @returns {Array<{id, title, status, agent, priority, createdAt, updatedAt, source, sprint}>}
 */
export function parseBoard(markdown, agentId = 'scrum-master') {
  if (!markdown || typeof markdown !== 'string') return [];

  const lines = markdown.split('\n');
  const tasks = [];
  let currentSection = null;
  let currentSprint = null;
  let sectionLines = [];

  const flushSection = () => {
    if (!sectionLines.length) return;
    const rows = parseTableRows(sectionLines);
    for (const cells of rows) {
      // Expected columns: # | Task | Added | Status | [Assigned To]
      // The 5th column (Assigned To) is optional — if present, use it for agent assignment
      const num = cells[0];
      const title = cells[1] || '';
      const added = cells[2] || '';
      const statusRaw = cells[3] || '';
      const assignedRaw = cells[4] || '';

      if (!title) continue;

      const status = statusRaw
        ? normalizeStatus(statusRaw, currentSection)
        : currentSection === 'done'
          ? 'done'
          : currentSection === 'backlog'
            ? 'backlog'
            : 'todo';

      // Use "Assigned To" column if present, otherwise fall back to the board owner agent
      const assignedAgent = extractAgentFromAssignment(assignedRaw) || agentId;

      tasks.push({
        id: `agent-${assignedAgent}-${currentSprint || 'board'}-${num}`,
        title: title.trim(),
        description: '',
        status,
        agent: assignedAgent,
        priority: 'medium',
        workflow: currentSprint === '0' ? 'Active' : currentSprint ? `Sprint ${currentSprint}` : 'Backlog',
        createdAt: added ? new Date(added + 'T00:00:00Z').toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'agent',
        sprint: currentSprint,
      });
    }
    sectionLines = [];
  };

  for (const line of lines) {
    // Detect section headers
    const sprintMatch = line.match(/##\s*.*Sprint\s+(\d+)/i);
    const backlogMatch = line.match(/##\s*.*Backlog/i);
    const doneMatch = line.match(/##\s*.*Done/i);
    // Individual agents use "## 📋 Current Tasks" as their active task section
    const currentTasksMatch = line.match(/##\s*.*Current\s+Tasks/i);

    if (sprintMatch) {
      flushSection();
      currentSection = 'sprint';
      currentSprint = sprintMatch[1];
    } else if (currentTasksMatch) {
      // Treat "Current Tasks" as an active sprint section so individual agent tasks
      // are parsed with in-progress context (status comes from the table itself)
      flushSection();
      currentSection = 'sprint';
      currentSprint = '0'; // virtual sprint number for individual agent boards
    } else if (backlogMatch) {
      flushSection();
      currentSection = 'backlog';
      currentSprint = null;
    } else if (doneMatch) {
      flushSection();
      currentSection = 'done';
      currentSprint = null;
    } else if (line.match(/^##\s/)) {
      // Other H2 section — flush
      flushSection();
      currentSection = null;
    } else {
      sectionLines.push(line);
    }
  }
  flushSection();

  return tasks;
}

/**
 * Merge agent-sourced tasks with localStorage tasks.
 * Agent tasks replace any existing agent task with the same ID.
 * Local tasks (source !== 'agent') are preserved.
 */
export function mergeTaskSources(localTasks, agentTasks) {
  const localOnly = localTasks.filter((t) => t.source !== 'agent');
  // Deduplicate agent tasks by ID
  const agentMap = new Map();
  for (const t of agentTasks) {
    agentMap.set(t.id, t);
  }
  return [...localOnly, ...agentMap.values()];
}
