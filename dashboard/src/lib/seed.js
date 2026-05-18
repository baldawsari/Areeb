/**
 * Demo seed data for the dashboard.
 *
 * Used on first run (when localStorage has never been initialised) so the app
 * is immediately usable without a live OpenClaw gateway. Once the user edits,
 * clears, or syncs real data, the seed is no longer applied.
 */

const DAY = 86_400_000;

// Each entry: [agent, title, description, status, priority, workflow, createdDaysAgo, updatedDaysAgo]
const SEED = [
  ['analyst', 'Gather authentication requirements', 'Interview stakeholders and document functional + security requirements for the auth system.', 'done', 'high', 'Authentication System', 9, 7],
  ['pm', 'Write authentication PRD', 'Turn the requirements brief into a prioritised product requirements document.', 'done', 'high', 'Authentication System', 7, 5],
  ['architect', 'Design token + session flow', 'Decide between JWT and opaque tokens, define refresh strategy and session storage.', 'review', 'high', 'Authentication System', 5, 1],
  ['developer', 'Implement login & signup endpoints', 'Build the core /auth endpoints with password hashing and validation.', 'in-progress', 'critical', 'Authentication System', 4, 0],
  ['developer', 'Add Google OAuth2 provider', 'Wire up the OAuth2 authorization-code flow for Google sign-in.', 'todo', 'medium', 'Authentication System', 3, 3],
  ['tester', 'Write auth integration tests', 'Cover happy-path and edge-case auth flows with automated integration tests.', 'backlog', 'medium', 'Authentication System', 3, 3],
  ['scrum-master', 'Schedule auth sprint review', 'Coordinate the review meeting and prepare the demo agenda.', 'todo', 'low', 'Authentication System', 2, 2],

  ['analyst', 'Define dashboard KPIs', 'Identify the metrics the realtime dashboard should surface for operators.', 'done', 'medium', 'Realtime Dashboard', 8, 6],
  ['architect', 'Choose WebSocket vs SSE', 'Evaluate transport options for live updates and document the trade-offs.', 'done', 'medium', 'Realtime Dashboard', 6, 4],
  ['developer', 'Build live Kanban sync', 'Stream task and agent updates into the board over the gateway connection.', 'in-progress', 'high', 'Realtime Dashboard', 4, 0],
  ['orchestrator', 'Triage incoming dashboard feedback', 'Route user-reported dashboard issues to the right specialist agent.', 'todo', 'low', 'Realtime Dashboard', 2, 1],
  ['tester', 'Load-test 500 concurrent boards', 'Verify the gateway and dashboard hold up under realistic concurrent load.', 'backlog', 'medium', 'Realtime Dashboard', 2, 2],

  ['pm', 'Prioritise API Gateway backlog', 'Rank the API gateway epics against roadmap goals.', 'in-progress', 'medium', 'API Gateway', 5, 0],
  ['architect', 'Draft rate-limiting design', 'Design the per-client rate-limit and quota enforcement model.', 'todo', 'high', 'API Gateway', 3, 3],
  ['developer', 'Scaffold gateway service', 'Stand up the base service skeleton with health checks and config loading.', 'backlog', 'medium', 'API Gateway', 2, 2],
  ['tester', 'Define gateway smoke tests', 'Write a minimal smoke-test suite for post-deploy verification.', 'backlog', 'low', 'API Gateway', 1, 1],
];

export function getSeedTasks() {
  const now = Date.now();
  return SEED.map((row, i) => {
    const [agent, title, description, status, priority, workflow, createdDaysAgo, updatedDaysAgo] = row;
    return {
      id: `seed-${i + 1}`,
      title,
      description,
      status,
      agent,
      priority,
      workflow,
      createdAt: new Date(now - createdDaysAgo * DAY).toISOString(),
      updatedAt: new Date(now - updatedDaysAgo * DAY).toISOString(),
      source: 'demo',
    };
  });
}
