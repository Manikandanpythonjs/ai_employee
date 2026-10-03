/**
 * Single-page navigation. Every entry is an `#id` on the home page rather than
 * a route — the whole site is one document, so clicking a nav item scrolls.
 * Order is editorial and does not have to match document order; `Tools` sits
 * before `Features` in the nav but appears after it on the page.
 */
export const NAV_LINKS = [
  { label: "Workforce", href: "#one-employee" },
  { label: "Features", href: "#features" },
  { label: "Agents", href: "#agents" },
  { label: "Orchestration", href: "#orchestration-ladder" },
  { label: "Tools", href: "#tools" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
  { label: "Writing", href: "#writing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const FOOTER_LINKS = [
  {
    title: "Product",
    items: [
      { label: "Workforce", href: "#one-employee" },
      { label: "Features", href: "#features" },
      { label: "Agents", href: "#agents" },
      { label: "Orchestration", href: "#orchestration" },
      { label: "Tools", href: "#tools" },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Use Cases", href: "#use-cases" },
      { label: "Pricing", href: "#pricing" },
      { label: "Writing", href: "#writing" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "#colophon" },
      { label: "Terms", href: "#colophon" },
      { label: "Status", href: "#colophon" },
    ],
  },
];

/**
 * Narrative backbone for the scroll progress rail. The rail divides total
 * document scroll into equal bands, so this list must stay in document order
 * and its length must match the number of bands the rail divides by — see
 * `ScrollProgress`, which maps `id` to real section offsets rather than
 * assuming an even split.
 */
export const CHAPTERS = [
  { n: "01", label: "Perception", id: "intro" },
  { n: "02", label: "Reasoning", id: "reasoning" },
  { n: "03", label: "Delegation", id: "one-employee" },
  { n: "04", label: "Execution", id: "execution" },
  { n: "05", label: "Verification", id: "verification" },
  { n: "06", label: "Recovery", id: "recovery" },
  { n: "07", label: "Human", id: "human" },
  { n: "08", label: "Field", id: "field" },
  { n: "09", label: "Films", id: "films" },
  { n: "10", label: "Tools", id: "tools" },
  { n: "11", label: "Features", id: "features" },
  { n: "12", label: "Agents", id: "agents" },
  { n: "13", label: "Orchestration", id: "orchestration-ladder" },
  { n: "14", label: "Use Cases", id: "use-cases" },
  { n: "15", label: "Pricing", id: "pricing" },
  { n: "16", label: "Writing", id: "writing" },
  { n: "17", label: "About", id: "about" },
  { n: "18", label: "Contact", id: "contact" },
];

export const WORKFORCE_PANELS = [
  {
    n: "01",
    title: "Perceive",
    line: "Reads the request, the context and the state of every system it touches.",
    metric: "INPUT",
    accent: "ink",
  },
  {
    n: "02",
    title: "Plan",
    line: "Decomposes one goal into a dependency graph of executable steps.",
    metric: "PLAN",
    accent: "cobalt",
  },
  {
    n: "03",
    title: "Delegate",
    line: "Routes each step to the specialist best suited to complete it.",
    metric: "ROUTE",
    accent: "cobalt",
  },
  {
    n: "04",
    title: "Execute",
    line: "Acts across browsers, codebases, inboxes, databases and APIs.",
    metric: "ACTION",
    accent: "signal",
  },
  {
    n: "05",
    title: "Verify",
    line: "Checks every result against the goal before it is allowed out.",
    metric: "CHECK",
    accent: "acid",
  },
  {
    n: "06",
    title: "Repair",
    line: "Detects failure, diagnoses the cause and replans without stopping.",
    metric: "RETRY",
    accent: "blood",
  },
  {
    n: "07",
    title: "Learn",
    line: "Remembers the outcome, so the next run starts smarter.",
    metric: "MEMORY",
    accent: "ink",
  },
  {
    n: "08",
    title: "Deliver",
    line: "Hands back finished work, with the evidence attached.",
    metric: "OUTPUT",
    accent: "signal",
  },
];

export const STACK_CARDS = [
  { n: "01", title: "Intent", meta: "A goal, stated once" },
  { n: "02", title: "Plan", meta: "A dependency graph" },
  { n: "03", title: "Agents", meta: "Specialists assigned" },
  { n: "04", title: "Tools", meta: "Capabilities connected" },
  { n: "05", title: "Execution", meta: "Work performed" },
  { n: "06", title: "Verification", meta: "Output validated" },
  { n: "07", title: "Recovery", meta: "Failures handled" },
  { n: "08", title: "Outcome", meta: "Delivered, evidenced" },
];

export const AGENTS = [
  {
    id: "planner",
    name: "Planner",
    role: "Decomposition",
    capability: "Turns an ambiguous goal into an ordered, dependency-aware plan.",
    tools: ["Notion", "Linear", "Search"],
    color: "#2447e8",
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Gathering",
    capability:
      "Reads across sources, extracts claims and cites where each one came from.",
    tools: ["Browser", "Search", "Documents"],
    color: "#121317",
  },
  {
    id: "browser",
    name: "Browser Agent",
    role: "Navigation",
    capability:
      "Operates real pages: fills forms, extracts structured fields, completes flows.",
    tools: ["Chrome", "APIs", "Auth"],
    color: "#ff4a1c",
  },
  {
    id: "coding",
    name: "Coding Agent",
    role: "Implementation",
    capability:
      "Writes, edits and refactors code, then runs the test suite against it.",
    tools: ["GitHub", "Terminal", "CI"],
    color: "#121317",
  },
  {
    id: "data",
    name: "Data Agent",
    role: "Analysis",
    capability:
      "Queries warehouses, builds models and validates the numbers before use.",
    tools: ["Database", "SQL", "Analytics"],
    color: "#2447e8",
  },
  {
    id: "communication",
    name: "Communication Agent",
    role: "Outreach",
    capability:
      "Drafts, personalises and sends messages in the tone of your organisation.",
    tools: ["Gmail", "Slack", "Calendar"],
    color: "#121317",
  },
  {
    id: "verification",
    name: "Verification Agent",
    role: "Quality gate",
    capability:
      "Acts as the adversary of the output — it is incentivised to find the flaw.",
    tools: ["Browser", "Assertions", "History"],
    color: "#c8f432",
  },
  {
    id: "memory",
    name: "Memory Agent",
    role: "Continuity",
    capability:
      "Keeps context that matters between runs, and forgets what does not.",
    tools: ["Vector store", "Notes", "Prefs"],
    color: "#121317",
  },
  {
    id: "repair",
    name: "Repair Agent",
    role: "Recovery",
    capability:
      "Owns failure. Diagnoses the break, proposes a fix and re-verifies it.",
    tools: ["Logs", "Git", "Runbooks"],
    color: "#d81e31",
  },
];

export const TOOLS = [
  { name: "Gmail", cat: "Communication", glyph: "M" },
  { name: "Slack", cat: "Communication", glyph: "S" },
  { name: "Calendar", cat: "Communication", glyph: "C" },
  { name: "Notion", cat: "Productivity", glyph: "N" },
  { name: "Linear", cat: "Productivity", glyph: "L" },
  { name: "Figma", cat: "Productivity", glyph: "F" },
  { name: "GitHub", cat: "Development", glyph: "G" },
  { name: "Terminal", cat: "Development", glyph: "T" },
  { name: "Vercel", cat: "Development", glyph: "V" },
  { name: "Postgres", cat: "Data", glyph: "P" },
  { name: "BigQuery", cat: "Data", glyph: "B" },
  { name: "Snowflake", cat: "Data", glyph: "S" },
  { name: "Perplexity", cat: "Research", glyph: "P" },
  { name: "Arxiv", cat: "Research", glyph: "A" },
  { name: "Drive", cat: "Files", glyph: "D" },
  { name: "Dropbox", cat: "Files", glyph: "D" },
  { name: "Salesforce", cat: "Business", glyph: "S" },
  { name: "HubSpot", cat: "Business", glyph: "H" },
  { name: "Chrome", cat: "Browser", glyph: "C" },
  { name: "Playwright", cat: "Browser", glyph: "P" },
  { name: "Zapier", cat: "Automation", glyph: "Z" },
  { name: "Webhooks", cat: "Automation", glyph: "W" },
];

export const DELEGATION_CHAIN = [
  { id: "task", label: "TASK", sub: "Research the competitive landscape" },
  { id: "research", label: "RESEARCH AGENT", sub: "Find 40 sources" },
  { id: "web", label: "WEB AGENT", sub: "Read + extract" },
  { id: "data", label: "DATA AGENT", sub: "Normalise + enrich" },
  { id: "analysis", label: "ANALYSIS AGENT", sub: "Compare + cluster" },
  { id: "writer", label: "WRITER", sub: "Draft the brief" },
  { id: "verifier", label: "VERIFIER", sub: "Check every claim" },
  { id: "result", label: "FINAL RESULT", sub: "Cited report, 6 pages" },
];

export const HEAL_CHAIN = [
  { id: "detect", label: "SYSTEM DETECTS FAILURE" },
  { id: "diagnose", label: "DIAGNOSE" },
  { id: "replan", label: "REPLAN" },
  { id: "repair", label: "REPAIR" },
  { id: "retry", label: "RETRY" },
  { id: "verify", label: "VERIFY" },
  { id: "continue", label: "CONTINUE" },
];

export const USE_CASES = [
  {
    id: "research",
    role: "Research",
    headline: "A market report, not a search result.",
    body: "The employee scopes the market, reads every credible source, extracts positioning, cross-checks claims and returns a cited brief with a clear confidence rating.",
    steps: ["Scope", "Collect", "Extract", "Cross-check", "Cite"],
    agent: "Research Agent",
  },
  {
    id: "sales",
    role: "Sales",
    headline: "Pipeline that fills itself.",
    body: "It finds accounts matching your ICP, enriches firmographics from public filings, scores intent and drafts personalised outreach in your voice — for a human to approve.",
    steps: ["Identify", "Enrich", "Score", "Draft", "Approve"],
    agent: "Communication Agent",
  },
  {
    id: "engineering",
    role: "Engineering",
    headline: "Issue to verified pull request.",
    body: "It reproduces the bug, traces it through the codebase, writes a fix, opens a branch, runs CI, reads failures, iterates, and hands you a green build with a review summary.",
    steps: ["Reproduce", "Trace", "Patch", "Test", "Iterate"],
    agent: "Coding Agent",
  },
  {
    id: "operations",
    role: "Operations",
    headline: "Processes that watch themselves.",
    body: "Recurring work is modelled as a workflow with checkpoints. The employee executes it daily, flags anomalies, and repairs the common failures before you ever notice them.",
    steps: ["Model", "Run", "Watch", "Flag", "Repair"],
    agent: "Repair Agent",
  },
  {
    id: "marketing",
    role: "Marketing",
    headline: "Content grounded in what is actually happening.",
    body: "It tracks category conversation, finds the gaps your competitors ignore, drafts the piece, and reports performance back into the next planning cycle.",
    steps: ["Listen", "Find gaps", "Draft", "Publish", "Measure"],
    agent: "Research Agent",
  },
  {
    id: "executive",
    role: "Executive",
    headline: "Decision support, assembled daily.",
    body: "Overnight it consolidates metrics, movement and open risk across your systems into a two-page brief, with every number traced back to its source.",
    steps: ["Collect", "Reconcile", "Summarise", "Flag risk", "Deliver"],
    agent: "Data Agent",
  },
];

export const FEATURES = [
  {
    id: "employees",
    title: "AI Employees",
    body: "Digital workers that own complete workflows end to end — not single prompts.",
    visual: "entity",
  },
  {
    id: "orchestration",
    title: "Agent Orchestration",
    body: "Coordinate specialists, resolve ordering, and keep every parallel branch in sync.",
    visual: "graph",
  },
  {
    id: "delegation",
    title: "Delegation",
    body: "Break a large goal into executable subtasks and route each one to the right agent.",
    visual: "flow",
  },
  {
    id: "tool-use",
    title: "Tool Use",
    body: "Connect employees to the systems where the work actually happens.",
    visual: "orbit",
  },
  {
    id: "memory",
    title: "Memory",
    body: "Maintain the context that makes the second run better than the first.",
    visual: "stack",
  },
  {
    id: "verification",
    title: "Verification",
    body: "Every output is checked against the goal before it is allowed to ship.",
    visual: "gate",
  },
  {
    id: "self-healing",
    title: "Self-Healing",
    body: "Detect failures, diagnose them, replan and retry without losing the thread.",
    visual: "loop",
  },
  {
    id: "hitl",
    title: "Human-in-the-Loop",
    body: "Autonomy where it is safe. Explicit approval where it matters.",
    visual: "gate",
  },
  {
    id: "parallel",
    title: "Parallel Execution",
    body: "Independent subtasks run simultaneously, then reconverge on one result.",
    visual: "graph",
  },
  {
    id: "long-running",
    title: "Long-Running Work",
    body: "Workflows that span hours and days, surviving their own checkpoints.",
    visual: "stack",
  },
];

export const ORCHESTRATION_STAGES = [
  { stage: "01", title: "Single Agent", body: "One mind, one goal, one tool at a time." },
  { stage: "02", title: "Agent + Tools", body: "Capability arrives through connected systems." },
  { stage: "03", title: "Multiple Agents", body: "Parallel specialists, one shared objective." },
  { stage: "04", title: "Planner + Workers", body: "A planner assigns, workers execute, results return." },
  { stage: "05", title: "Verifier", body: "An adversarial pass before anything is delivered." },
  { stage: "06", title: "Repair Loop", body: "Failure routes back to diagnosis, never to a halt." },
  { stage: "07", title: "Human Approval", body: "Escalation reserved for decisions that carry weight." },
  { stage: "08", title: "Complete Workforce", body: "A system that runs the whole function." },
];

export const ARTICLES = [
  {
    slug: "what-is-an-ai-employee",
    title: "What is an AI Employee?",
    dek: "Not a smarter chat window. A worker with intent, tools, memory and accountability.",
    read: "9 min",
    topic: "Foundations",
    featured: true,
  },
  {
    slug: "agents-vs-employees",
    title: "AI Agents vs AI Employees",
    dek: "The difference is not capability. It is duration of responsibility.",
    read: "7 min",
    topic: "Foundations",
  },
  {
    slug: "multi-agent-systems",
    title: "Multi-Agent Systems",
    dek: "When one model with many tools stops being enough.",
    read: "11 min",
    topic: "Architecture",
  },
  {
    slug: "delegation",
    title: "Delegation",
    dek: "The most underestimated primitive in agent design.",
    read: "6 min",
    topic: "Architecture",
  },
  {
    slug: "self-healing-agents",
    title: "Self-Healing Agents",
    dek: "Designing for the failure path, not just the happy path.",
    read: "12 min",
    topic: "Reliability",
  },
  {
    slug: "human-in-the-loop",
    title: "Human-in-the-Loop AI",
    dek: "Choosing precisely when autonomy should stop.",
    read: "8 min",
    topic: "Reliability",
  },
  {
    slug: "agent-memory",
    title: "Agent Memory",
    dek: "What to keep, what to summarise, what to let go.",
    read: "10 min",
    topic: "Architecture",
  },
  {
    slug: "verification",
    title: "Verification",
    dek: "Why an adversarial agent is worth its cost.",
    read: "9 min",
    topic: "Reliability",
  },
  {
    slug: "long-running-agents",
    title: "Long-Running Agents",
    dek: "Workflows that outlive a single context window.",
    read: "13 min",
    topic: "Architecture",
  },
];

export const TIMELINE = [
  { era: "01", title: "Human Work", body: "Output is coupled to hours. Capacity scales linearly with headcount." },
  { era: "02", title: "Software", body: "Rules become reusable. Execution becomes repeatable, not intelligent." },
  { era: "03", title: "Automation", body: "Machines follow the path a human drew. They never leave it." },
  { era: "04", title: "AI Assistants", body: "The machine answers. The human still does the work." },
  { era: "05", title: "AI Agents", body: "The machine acts — one task, one step at a time." },
  { era: "06", title: "AI Employees", body: "The machine owns a workflow, including its failures." },
  { era: "07", title: "AI Workforce", body: "Many employees, one operating system, shared memory." },
];

/**
 * Plans. Priced per employee rather than per seat, because the unit of purchase
 * is a worker who owns a workflow — a seat would price the interface, not the
 * outcome.
 */
export const PRICING = [
  {
    id: "scout",
    name: "Scout",
    price: "$490",
    unit: "per employee / month",
    summary: "One employee, one workflow, running on a shared runtime.",
    best: false,
    cta: "Start scoped",
    includes: [
      "1 AI employee",
      "1 owned workflow",
      "Shared tool connectors",
      "Daily verification runs",
      "Email support",
    ],
    caps: [
      { label: "Concurrent runs", value: "1" },
      { label: "Runbooks", value: "Community" },
    ],
  },
  {
    id: "crew",
    name: "Crew",
    price: "$1,450",
    unit: "per employee / month",
    summary: "Several employees sharing memory, escalating to each other.",
    best: true,
    cta: "Talk to us",
    includes: [
      "Up to 5 AI employees",
      "Shared long-term memory",
      "Human approval gates",
      "Private tool connections",
      "Repair loop with runbooks",
      "Priority support",
    ],
    caps: [
      { label: "Concurrent runs", value: "5" },
      { label: "Uptime target", value: "99.5%" },
    ],
  },
  {
    id: "org",
    name: "Org",
    price: "Scoped",
    unit: "annual agreement",
    summary: "A whole function, with the controls a company requires.",
    best: false,
    cta: "Book a call",
    includes: [
      "Unlimited employees",
      "SSO, SCIM, audit log",
      "Your own runtime or VPC",
      "Custom agents and tools",
      "Named support engineer",
      "Security review support",
    ],
    caps: [
      { label: "Concurrent runs", value: "Negotiated" },
      { label: "Planning", value: "Quarterly" },
    ],
  },
];

/** What separates the plans, in the buyer's language rather than ours. */
export const PRICING_FIGURES = [
  ["Response", "1 day", "4 hours", "1 hour"],
  ["Onboarding", "Self-serve", "Guided", "Migration team"],
  ["Compliance", "Standard", "Standard + log export", "Custom review"],
];

/** The honest objections, answered before the sales conversation starts. */
export const PRICING_NOTES = [
  {
    q: "What does an employee actually cost?",
    a: "One FTE carries payroll, benefits, onboarding and management overhead. An employee here is priced against the work it owns, not against a headcount you remove on day one.",
  },
  {
    q: "Is this priced per seat or per outcome?",
    a: "Per employee, per month. What that employee owns is agreed up front, so the price is attached to a workflow rather than to a licence count.",
  },
  {
    q: "What happens when a run fails?",
    a: "Repairs are included at every tier. Crew and Org get runbooks so the employee recovers the same failure the same way next time.",
  },
  {
    q: "Can we start with one workflow?",
    a: "Yes, and most customers do. Scout exists for exactly that — prove one owned workflow, then decide whether the next one is worth buying.",
  },
];
