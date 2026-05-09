export function buildAiCodingSourceDiscipline(fixture = {}) {
  const watchedSources = fixture.watchedSources || [];
  const agentOperatingPrinciples = fixture.agentOperatingPrinciples || [];
  const kaspaDailyQaThemes = fixture.kaspaDailyQaThemes || [];
  const failureModes = fixture.failureModes || [];
  const topCryptoEngineerRules = fixture.topCryptoEngineerRules || [];
  const requiredRepoAudits = fixture.requiredRepoAudits || [];
  const needsExternalContent = watchedSources.filter((source) => /needs/.test(source.status || ""));
  const kaspaExplainedModes = failureModes.filter((mode) => mode.appliesTo?.includes("kaspa-explained"));
  const tn12Modes = failureModes.filter((mode) => mode.appliesTo?.includes("tn12"));

  return {
    schema: "tn12-ai-coding-source-discipline/v1",
    reviewedAt: fixture.reviewedAt || new Date().toISOString().slice(0, 10),
    status: "ai-source-discipline-ready",
    purpose: fixture.purpose || "",
    summary: {
      watchedSources: watchedSources.length,
      primaryOrImplementationSources: watchedSources.filter((source) =>
        ["primary", "primary-for-serialization-behavior", "primary-for-contract-template-behavior"].includes(source.status)
      ).length,
      sourcesNeedingContentImport: needsExternalContent.length,
      agentOperatingPrinciples: agentOperatingPrinciples.length,
      kaspaDailyQaThemes: kaspaDailyQaThemes.length,
      failureModes: failureModes.length,
      kaspaExplainedFailureModes: kaspaExplainedModes.length,
      tn12FailureModes: tn12Modes.length,
      topCryptoEngineerRules: topCryptoEngineerRules.length,
      requiredRepoAudits: requiredRepoAudits.length
    },
    watchedSources,
    agentOperatingPrinciples,
    kaspaDailyQaThemes,
    failureModes,
    topCryptoEngineerRules,
    requiredRepoAudits,
    operatingRules: [
      "Do not let AI memory upgrade a claim; primary docs, source code, accepted transaction evidence, or explicit artifact status must do it.",
      "When a source is not accessible, record that boundary and ask for pasted/exported content instead of summarizing unseen text.",
      "Treat AI-written code as untrusted until local checks, negative checks, and source/API verification pass.",
      "Keep persistent agent instructions concrete and short; push longer rationale into docs and generated artifacts.",
      "For crypto apps, write the custody/oracle/ordering/finality model before product language.",
      "Treat generic merchant payments as rails, not the main 2026 adoption vector, unless a source and artifact prove product pull.",
      "Keep coordination-market direction high-priority but status-labeled until opacity, capital multiplexing, and settlement rails exist.",
      "Default to Kaspa L1-first language; do not import EVM/L2 assumptions without a specific sourced reason.",
      "For Kaspa Explained, prefer concrete source-backed explanations over broad future-facing claims.",
      "For TN12, keep signed drafts, planner payloads, accepted payload events, accepted proof spends, and custody outputs separate."
    ],
    immediateActions: [
      {
        id: "import-kaspa-daily-qa-thread",
        status: needsExternalContent.some((source) => source.id === "kaspa-daily-yonatan-qa-part-1") ? "needed" : "done",
        detail: "Part 1 was user-provided from a Thread Reader unroll on 2026-05-09; public claims should paraphrase themes and still link the original thread."
      },
      {
        id: "watch-kaspa-daily-part-2",
        status: "watch",
        detail: "Search for the Part 2 Q&A periodically and add it to the source set when available."
      },
      {
        id: "run-claim-lane-audit",
        status: "next",
        detail: "Audit TN12 and Kaspa Explained copy for roadmap/testnet/mainnet conflation, payment-as-thesis drift, and EVM/L2 default drift."
      },
      {
        id: "run-api-surface-audit",
        status: "next",
        detail: "Check wallet/RPC/payload/transaction code against docs, Rusty Kaspa, Silverscript, and local gates."
      },
      {
        id: "trim-agent-instruction-bloat",
        status: "ongoing",
        detail: "Keep AGENTS.md focused on concrete repo rules while this artifact carries the deeper source and failure-mode shelf."
      }
    ],
    boundaries: [
      "This artifact is a discipline layer, not a substitute for reading the sources.",
      "The Kaspa Daily Part 1 body was user-provided; this artifact stores paraphrased takeaways, not the full thread.",
      "Social posts guide research direction; protocol claims still need docs, code, or accepted network behavior."
    ]
  };
}
