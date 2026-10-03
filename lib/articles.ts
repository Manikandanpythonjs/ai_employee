import { ARTICLES } from "@/lib/site";

export type Block =
  | { t: "p"; v: string }
  | { t: "h"; v: string }
  | { t: "quote"; v: string; by?: string }
  | { t: "list"; v: string[] }
  | { t: "flow"; v: string[] };

export type Article = {
  slug: string;
  title: string;
  dek: string;
  read: string;
  topic: string;
  /** Opening paragraph, used in the article header. */
  lede: string;
  body: Block[];
  pull: string;
};

/**
 * Article bodies. Written as structured blocks so the article page can render
 * real typographic hierarchy — pull quotes, lists, and a drawn flow diagram —
 * instead of one undifferentiated column of text.
 */
export const ARTICLE_CONTENT: Record<string, Article> = {
  "what-is-an-ai-employee": {
    slug: "what-is-an-ai-employee",
    title: "What is an AI Employee?",
    dek: "Not a smarter chat window. A worker with intent, tools, memory and accountability.",
    read: "9 min",
    topic: "Foundations",
    lede: "The phrase gets used loosely, which is why it currently means nothing. An AI employee is not a chatbot with better manners. It is a specific thing, with specific properties, and it is worth being precise about which.",
    pull: "An AI employee is not a chatbot. It is a worker with a mandate, a method, and someone to answer to.",
    body: [
      {
        t: "p",
        v: "Start with what a chatbot does. You ask a question, it produces text, and the entire burden of turning that text into a result stays with you. Copy it. Paste it. Notice something was wrong. Fix it yourself. The model contributed language; you contributed everything else.",
      },
      {
        t: "p",
        v: "An AI employee differs in exactly one respect that matters: it does not return language, it returns a completed piece of work. That change sounds small and is not. It moves the entire burden of execution somewhere else.",
      },
      { t: "h", v: "Four properties, not one" },
      {
        t: "p",
        v: "Calling something an AI employee is a claim about four things existing together. Remove any one and you have something else — a good tool, perhaps, but not a worker.",
      },
      {
        t: "list",
        v: [
          "A mandate: a goal it owns end to end, not a prompt you re-issue every time.",
          "Tools: real capability in the systems where work actually happens.",
          "Memory: context that carries between runs, so the second run starts ahead of the first.",
          "Accountability: a defined standard for done, and evidence attached to it.",
        ],
      },
      {
        t: "p",
        v: "Most systems marketed as agents have the first two and quietly lack the other two. They are assistants with tool access — genuinely useful, but still bounded by the fact that a human is driving every turn.",
      },
      { t: "h", v: "The test" },
      {
        t: "p",
        v: "Here is the question that separates the two. If this thing breaks at step nine of twelve, who decides what happens next?",
      },
      {
        t: "p",
        v: "In an assistant, you do. You read the error, form a theory, and issue a new instruction. In an employee, it does: it diagnoses the break, rewrites the plan, retries the step, and re-verifies — because finishing is its job, and stopping halfway is not a result.",
      },
      {
        t: "flow",
        v: [
          "Intent",
          "Plan",
          "Delegate",
          "Execute",
          "Verify",
          "Recover",
          "Deliver",
        ],
      },
      {
        t: "p",
        v: "That sequence is the whole discipline. Every stage after the first exists because something can go wrong, and every stage after that exists because the failure modes are not the same each time.",
      },
      { t: "h", v: "Why the distinction is not pedantic" },
      {
        t: "p",
        v: "If you buy a chatbot, you have bought a faster way to produce drafts. That is a real gain, and for many people it is enough. If you buy an employee, you are buying completed outcomes — and the price of that is a system that has to be trustworthy, auditable, and explicit about the moments it is not.",
      },
      {
        t: "quote",
        v: "Autonomy is not the absence of a human. It is the presence of a clear boundary.",
      },
      {
        t: "p",
        v: "The organisations getting real value from this are not the ones that removed people from the loop. They are the ones that decided, in advance and in writing, which decisions a machine may take alone and which must be signed off. Everything else follows from that one piece of governance.",
      },
      {
        t: "p",
        v: "So the useful question is not whether a system is an AI employee. It is whether it can be given a piece of work, left alone, and trusted to come back with something finished — and to tell you plainly when it could not.",
      },
    ],
  },

  "agents-vs-employees": {
    slug: "agents-vs-employees",
    title: "AI Agents vs AI Employees",
    dek: "The difference is not capability. It is duration of responsibility.",
    read: "7 min",
    topic: "Foundations",
    lede: "The two words get used interchangeably, which flatters nothing. The gap between them is not intelligence — both can be equally capable. It is how long they stay responsible for the outcome.",
    pull: "An agent is measured in steps. An employee is measured in outcomes.",
    body: [
      {
        t: "p",
        v: "An agent operates on the turn. It receives an instruction, takes some actions, and returns. When the context runs out, so does its mandate. This is the right shape for a bounded problem and a poor shape for anything with a deadline.",
      },
      {
        t: "p",
        v: "An employee operates on the outcome. It is given a goal that takes hours, crosses systems, and will almost certainly hit something it did not anticipate. Its job is not to be useful for four minutes. Its job is to be finished on Friday.",
      },
      { t: "h", v: "Duration is the real axis" },
      {
        t: "p",
        v: "Capability curves are roughly comparable across both. What is not comparable is persistence. An agent that loses state after a long task has failed at something an employee would simply have kept working through.",
      },
      {
        t: "list",
        v: [
          "Agents: one instruction, bounded context, immediate return.",
          "Employees: one mandate, persistent memory, a completion standard.",
          "Agents: the human resumes after every handoff.",
          "Employees: the human resumes only at agreed checkpoints.",
        ],
      },
      { t: "h", v: "The handoff tax" },
      {
        t: "p",
        v: "Multi-agent systems are usually assembled from agents, and that is where the cost hides. Every boundary between two agents is a place where context is compressed, and compression is where errors enter. A supervisor-model architecture keeps the objective in one place and pushes only summaries across the boundary.",
      },
      {
        t: "flow",
        v: ["Objective", "Supervisor", "Workers", "Merged result"],
      },
      {
        t: "quote",
        v: "Every handoff is a lossy channel. Design around that, not through it.",
      },
      {
        t: "p",
        v: "The practical consequence: when you evaluate a system, do not ask how well it performs a task. Ask what happens when the task takes four hours, spans four services, and fails once at minute two hundred. That is the only question that distinguishes the two categories.",
      },
    ],
  },

  "multi-agent-systems": {
    slug: "multi-agent-systems",
    title: "Multi-Agent Systems",
    dek: "When one model with many tools stops being enough.",
    read: "11 min",
    topic: "Architecture",
    lede: "Multi-agent architecture is usually sold as a scaling story. It is not, quite. It is a specialisation story, and the two only occasionally coincide.",
    pull: "You add agents when one mind is being asked to hold two incompatible kinds of context — not simply because the work got bigger.",
    body: [
      {
        t: "p",
        v: "A single agent with twenty tools is a genuine solution for a lot of problems. It reasons in one context, sees the consequences of its own actions, and does not need to summarise anything to itself. That is a real advantage, and multi-agent systems give it up.",
      },
      {
        t: "p",
        v: "You give it up when the task contains two kinds of thinking that genuinely do not belong together. Reading forty papers to extract claims and reconciling a data model are not the same activity at different scales — they are different activities.",
      },
      { t: "h", v: "The three topologies" },
      {
        t: "flow",
        v: ["Centralised", "Hierarchical", "Decentralised"],
      },
      {
        t: "p",
        v: "Centralised: one supervisor holds the objective and dispatches to workers. Hierarchical: supervisors of supervisors, useful past a certain scale. Decentralised: agents negotiate directly, which is elegant in theory and unpredictable in practice for anything you need to audit.",
      },
      {
        t: "p",
        v: "For work you care about, centralised wins — not because it is more elegant, but because it gives you one place where the state of the whole job is legible.",
      },
      { t: "h", v: "Parallelism has a cost" },
      {
        t: "p",
        v: "Running branches simultaneously feels free and is not. Each one consumes context you will eventually need for the merge, and each can arrive with a conclusion the others contradict. The interesting engineering is almost never in the dispatch — it is in the reconciliation.",
      },
      {
        t: "quote",
        v: "Concurrency is easy. Agreement is the hard part.",
      },
      {
        t: "p",
        v: "That is why the verifier matters so much in these systems. An adversarial pass costs a fraction of the total run and catches the specific failure that parallel branches produce: confident, individually reasonable, collectively inconsistent output.",
      },
    ],
  },

  delegation: {
    slug: "delegation",
    title: "Delegation",
    dek: "The most underestimated primitive in agent design.",
    read: "6 min",
    topic: "Architecture",
    lede: "Tool use gets all the attention. Delegation is harder, less discussed, and responsible for most of the difference between a demo and a system that works.",
    pull: "A tool extends what a worker can do. Delegation decides what the work actually is.",
    body: [
      {
        t: "p",
        v: "Tool calling is a solved shape: the model selects a function, supplies arguments, reads the result. Delegation has no equivalent primitive. There is no function call for deciding that this problem is not yours and belongs to someone with a different context window, different permissions, and a different idea of done.",
      },
      { t: "h", v: "Decomposition is judgement" },
      {
        t: "p",
        v: "Splitting work well requires knowing which boundaries are load-bearing. Split too finely and you pay the handoff tax on trivial steps. Split too coarsely and one specialist ends up doing three jobs badly instead of one job well.",
      },
      {
        t: "list",
        v: [
          "Too fine: a nine-step task becomes nine handoffs, each lossy, none independently useful.",
          "Too coarse: a research task also writes, verifies and ships — and every stage degrades.",
          "Right: each unit is independently completable and independently checkable.",
        ],
      },
      {
        t: "p",
        v: "The test I use: if a step cannot be handed to someone who knows nothing about the other steps and still be done correctly, it is not a step yet. It is a paragraph inside someone else's step.",
      },
      { t: "h", v: "Routing" },
      {
        t: "p",
        v: "Once you have boundaries, you still have to decide who gets which piece. This is mostly avoided by building one generalist, which works until it does not, and then fails in a way that is hard to diagnose because the routing happened invisibly inside a prompt.",
      },
      {
        t: "quote",
        v: "Delegation is the act of deciding not to do something — well.",
      },
      {
        t: "p",
        v: "Explicit routing — where each capability has an owner and the assignment is recorded — costs a little design effort and buys you a system whose failures you can actually read. That trade is almost always worth it.",
      },
    ],
  },

  "self-healing-agents": {
    slug: "self-healing-agents",
    title: "Self-Healing Agents",
    dek: "Designing for the failure path, not just the happy path.",
    read: "12 min",
    topic: "Reliability",
    lede: "Every demo follows the happy path. Every production incident happens somewhere else entirely. The difference between the two is whether you designed the failure branch or inherited it.",
    pull: "The happy path is what you can see. Production is where the other branches finally execute.",
    body: [
      {
        t: "p",
        v: "Most agent code is written as a straight line: do this, then this, then this. It works beautifully until a tool times out, a page changes shape, or a record someone expected is not there. Then it stops — and stopping is the worst possible outcome, because the human now has to reconstruct what the machine was doing.",
      },
      { t: "h", v: "Failure is a branch, not an ending" },
      {
        t: "p",
        v: "Self-healing does not mean retrying blindly. It means having a defined path for each class of failure, and knowing which class you are in before choosing what to do about it.",
      },
      {
        t: "flow",
        v: ["Detect", "Diagnose", "Replan", "Repair", "Retry", "Verify"],
      },
      {
        t: "p",
        v: "Detect is trivial and gets skipped. Diagnose is where the value is, and it is the step teams most often underinvest in: without an accurate cause, every subsequent decision is a guess with extra steps.",
      },
      { t: "h", v: "Retry is a strategy, not a number" },
      {
        t: "p",
        v: "Blind retries handle transient failures and make deterministic failures worse. A timeout is worth retrying. A validation error is not — retrying it just spends the budget before reaching the same conclusion.",
      },
      {
        t: "list",
        v: [
          "Transient: retry with backoff. The network blipped.",
          "Deterministic: stop and replan. The input will not become valid.",
          "Partial: resume from the last checkpoint rather than restarting.",
          "Escalation-worthy: ask. Some decisions are not the machine's to make.",
        ],
      },
      {
        t: "quote",
        v: "Repair without a cause model is just a slower way to fail.",
      },
      { t: "h", v: "The budget question" },
      {
        t: "p",
        v: "Every repair loop needs a ceiling, and the ceiling is a business decision rather than a technical one. How much is a result worth relative to the cost of getting it? Systems that do not answer this will burn money on a task that should have been escalated two hours earlier.",
      },
      {
        t: "p",
        v: "The best ones make that visible. Not 'task failed' but 'four attempts spent, cause unresolved, here is what I would try next, here is what it costs to continue.'",
      },
    ],
  },

  "human-in-the-loop": {
    slug: "human-in-the-loop",
    title: "Human-in-the-Loop AI",
    dek: "Choosing precisely when autonomy should stop.",
    read: "8 min",
    topic: "Reliability",
    lede: "The question is not whether to keep a human in the loop. It is which decisions belong to a person, and that set should be written down before anything is built.",
    pull: "Autonomy is not the absence of a human. It is the presence of a clear boundary.",
    body: [
      {
        t: "p",
        v: "The default fear is that human review will slow everything to a crawl. Sometimes it does. But the alternative — no review at all — is not speed, it is deferred cost, and the bill arrives with interest.",
      },
      { t: "h", v: "Most work needs no human" },
      {
        t: "p",
        v: "Reading, extracting, drafting, checking internal consistency, running tests, retrying a failed call — none of these need a signature. Supervising all of them is not rigour, it is theatre that trains people to click approve without reading.",
      },
      { t: "h", v: "Three things do" },
      {
        t: "list",
        v: [
          "Irreversible actions: anything you cannot undo, at whatever latency.",
          "Outward-facing communication: it speaks as you, to real people.",
          "Value judgments: pricing, hiring, anything where taste is the mechanism.",
        ],
      },
      {
        t: "p",
        v: "Notice that none of these are about difficulty. They are about consequence. A trivial action that sends four hundred emails needs more care than a complex analysis that changes nothing outside the report.",
      },
      { t: "h", v: "Design the pause" },
      {
        t: "p",
        v: "If the system pauses constantly, people will rubber-stamp. If it never pauses, you have lost control at exactly the moments that mattered. The design goal is pauses rare enough to be read and frequent enough to matter.",
      },
      {
        t: "quote",
        v: "A review gate that fires on everything is the same as no gate at all.",
      },
      {
        t: "p",
        v: "The workable pattern: run autonomously, checkpoint at agreed boundaries, and escalate with the context a human actually needs — what was attempted, what the alternatives were, what it cost, and what happens if you do nothing.",
      },
    ],
  },

  "agent-memory": {
    slug: "agent-memory",
    title: "Agent Memory",
    dek: "What to keep, what to summarise, what to let go.",
    read: "10 min",
    topic: "Architecture",
    lede: "Everyone agrees memory makes agents better. Much less agreement on what memory is, and the difference turns out to matter more than the retrieval algorithm.",
    pull: "Memory is not a bigger context window. It is a decision about what should still be true next week.",
    body: [
      {
        t: "p",
        v: "The naive version is a vector store and a similarity search, which works well right up until the point where the system has accumulated six months of contradictory observations and starts behaving strangely with no obvious cause.",
      },
      { t: "h", v: "Three different things" },
      {
        t: "p",
        v: "Episodic: what happened. A record of runs and outcomes, useful for explaining a decision months later and for avoiding a mistake that has already been made once.",
      },
      {
        t: "p",
        v: "Semantic: what is true. Stable facts about the systems and the work. This is the layer that should replace re-derivation.",
      },
      {
        t: "p",
        v: "Procedural: how we do things. Preferences and conventions — how you like reports structured, which sources you trust, what you never want sent without review.",
      },
      {
        t: "p",
        v: "These have completely different lifetimes. Semantic facts decay slowly, procedural facts change when you change, and episodic records are useful for a while and then become noise. One undifferentiated store cannot serve all three well.",
      },
      { t: "h", v: "Forgetting is the feature" },
      {
        t: "p",
        v: "Systems that accumulate everything get slower, less accurate, and harder to reason about. Pruning is not housekeeping — a memory that never forgets cannot be corrected, only accumulated around.",
      },
      {
        t: "list",
        v: [
          "Keep: outcomes and their reasoning.",
          "Summarise: repeated observations into a stated preference.",
          "Drop: transient state that was true for one run.",
          "Supersede: keep the newer fact, retire the older with a pointer.",
        ],
      },
      {
        t: "quote",
        v: "A memory that can never be corrected is only a longer log.",
      },
      {
        t: "p",
        v: "The practical test: ask the system why it did something six weeks ago. If the answer cites a memory, that memory had better still be relevant. If it cannot answer, the episodic layer was never doing the job you thought it was.",
      },
    ],
  },

  verification: {
    slug: "verification",
    title: "Verification",
    dek: "Why an adversarial agent is worth its cost.",
    read: "9 min",
    topic: "Reliability",
    lede: "The same model that produced the output is the worst possible judge of it. It is not being dishonest — it simply cannot see the flaw, because the flaw is exactly what it does not know.",
    pull: "Ask a model to check its own work and you have asked it to agree with itself.",
    body: [
      {
        t: "p",
        v: "Self-critique feels like rigour and is mostly confabulation. The generator and the critic share a representation of the world, so they fail together — the same blind spot produces the error and then fails to notice it.",
      },
      { t: "h", v: "Adversarial, not agreeable" },
      {
        t: "p",
        v: "A verifier worth having is given the goal and the output but not the reasoning. It is asked to find the flaw, and it is incentivised — a verifier that always passes is not doing a job.",
      },
      {
        t: "flow",
        v: ["Output", "Claim extraction", "Independent check", "Block or pass"],
      },
      {
        t: "p",
        v: "The step that matters most is claim extraction. Pull every factual assertion out of the output and check each one against something outside the model. It is tedious, mechanical, and catches the majority of real errors.",
      },
      { t: "h", v: "The cost question" },
      {
        t: "p",
        v: "Verification roughly doubles token spend, which is why it gets cut first under pressure. This is backwards. An unchecked output that ships is more expensive than a checked one that does not, and the cost of the check scales with the size of the output while the cost of the error scales with what it caused.",
      },
      {
        t: "list",
        v: [
          "Always verify: numbers, citations, names, dates, anything quoted.",
          "Verify selectively: long-form output, anything outward-facing, anything irreversible.",
          "Sample otherwise: you do not need a verifier on a classification.",
        ],
      },
      {
        t: "quote",
        v: "A verifier that never blocks anything is a decoration.",
      },
      {
        t: "p",
        v: "The design mistake I see most often is a verification step that has no authority. If the verifier cannot stop the run, it cannot catch anything — it produces a note nobody reads. Give it the power to block, and it becomes the most valuable component in the system.",
      },
    ],
  },

  "long-running-agents": {
    slug: "long-running-agents",
    title: "Long-Running Agents",
    dek: "Workflows that outlive a single context window.",
    read: "13 min",
    topic: "Architecture",
    lede: "Almost everything interesting takes longer than one context window. Almost every agent implementation assumes it does not. This is the gap where long-running work quietly goes to die.",
    pull: "A process that runs for six hours is not a long prompt. It is a program with checkpoints.",
    body: [
      {
        t: "p",
        v: "The instinct is to make the window bigger. That works until it does not, because the constraint is not capacity — it is attention. Somewhere past a certain volume of history, the model is technically able to see everything and practically unable to weigh it.",
      },
      { t: "h", v: "Checkpoint or perish" },
      {
        t: "p",
        v: "A long-running process needs explicit state: what is done, what is in flight, what is next, and why each decision was made. Without that, resuming means re-reading a transcript and re-deriving context — which is slow, expensive, and non-deterministic.",
      },
      {
        t: "flow",
        v: ["Checkpoint", "Resume", "Re-derive", "Checkpoint"],
      },
      {
        t: "p",
        v: "The discipline that makes this work is writing state down rather than remembering it. If the reason for a decision only exists in the context window, the decision is not recoverable after the window closes.",
      },
      { t: "h", v: "Idempotency" },
      {
        t: "p",
        v: "Long jobs get resumed, and resumed jobs re-run steps. If a step is not idempotent — sending an email, charging a card, incrementing a counter — then resuming will do it twice. This is the single most common source of genuinely bad incidents in agent systems.",
      },
      {
        t: "list",
        v: [
          "Make external effects idempotent: idempotency keys, dedupe by intent.",
          "Record what was attempted before the attempt, not after.",
          "Separate 'decided' from 'performed' so a crash between them is recoverable.",
          "Assume resume happens at the worst possible moment. It usually does.",
        ],
      },
      {
        t: "quote",
        v: "Every long-running process will resume at the exact moment it was least designed to.",
      },
      { t: "h", v: "Progress you can see" },
      {
        t: "p",
        v: "The other requirement is legibility. A process that runs for six hours and reports nothing is indistinguishable from one that has hung. Checkpoints should surface as observable events, with enough state attached that a human can tell the difference between working and stuck.",
      },
    ],
  },
};

export const ARTICLE_ORDER = ARTICLES.map((a) => a.slug);

export function getArticle(slug: string): Article | undefined {
  return ARTICLE_CONTENT[slug];
}

export function getAdjacent(slug: string) {
  const i = ARTICLE_ORDER.indexOf(slug);
  return {
    prev: i > 0 ? ARTICLES[i - 1] : undefined,
    next: i >= 0 && i < ARTICLES.length - 1 ? ARTICLES[i + 1] : undefined,
  };
}
