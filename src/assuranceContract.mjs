export const DEFAULT_ASSURANCE = Object.freeze({
  projectName: "TN12 public goods sprint",
  recipientAddress: "kaspatest:",
  refundAddress: "kaspatest:",
  targetTkas: 50000,
  pledgedTkas: 12000,
  minimumPledgeTkas: 100,
  deadlineHours: 72
});

export function normalizeAssurance(input) {
  const targetTkas = clampNumber(Number(input.targetTkas), 1, 100000000);
  const pledgedTkas = clampNumber(Number(input.pledgedTkas), 0, targetTkas);

  return {
    projectName: String(input.projectName || "").trim() || DEFAULT_ASSURANCE.projectName,
    recipientAddress: String(input.recipientAddress || "").trim(),
    refundAddress: String(input.refundAddress || "").trim(),
    targetTkas,
    pledgedTkas,
    minimumPledgeTkas: clampNumber(Number(input.minimumPledgeTkas), 0.01, targetTkas),
    deadlineHours: clampInteger(Number(input.deadlineHours), 1, 8760)
  };
}

export function validateAssurance(contract) {
  const issues = [];

  if (!contract.recipientAddress.startsWith("kaspatest:")) {
    issues.push("Recipient should be a TN12/testnet kaspatest: address.");
  }

  if (!contract.refundAddress.startsWith("kaspatest:")) {
    issues.push("Refund address should be a TN12/testnet kaspatest: address.");
  }

  if (contract.recipientAddress && contract.recipientAddress === contract.refundAddress) {
    issues.push("Use a refund address that is separate from the recipient address.");
  }

  if (contract.minimumPledgeTkas > contract.targetTkas) {
    issues.push("Minimum pledge cannot exceed the funding target.");
  }

  return issues;
}

export function buildAssuranceArtifact(contract) {
  const remainingTkas = Math.max(contract.targetTkas - contract.pledgedTkas, 0);
  const progress = contract.targetTkas === 0 ? 0 : contract.pledgedTkas / contract.targetTkas;
  const pledgesNeeded = remainingTkas === 0
    ? 0
    : Math.ceil(remainingTkas / contract.minimumPledgeTkas);

  return {
    schema: "tn12-assurance-contract-demo/v1",
    network: "kaspa-testnet-12",
    status: "tn12-configured-browser-artifact",
    projectName: contract.projectName,
    contract,
    state: {
      progress: Number(progress.toFixed(4)),
      remainingTkas,
      pledgesNeeded,
      outcomeIfDeadlineNow: remainingTkas === 0 ? "release-to-recipient" : "refund-pledgers"
    },
    covenantIntent: [
      "Each pledge primitive has a recipient release path.",
      "Each pledge primitive has a contributor refund path after its deadline.",
      "Campaign target aggregation remains planner/indexer state.",
      "A first TN12 implementation should keep individual pledge outputs auditable and easy to refund."
    ],
    enforcementBoundary: {
      scriptEnforced: [
        "release output 0 value equals active input minus minerFee",
        "release output 0 pays the recipient P2PK lock",
        "refund requires contributor signature",
        "refund requires tx.time >= deadline",
        "refund output 0 pays the contributor P2PK lock"
      ],
      plannerOnly: [
        "pooled funding target aggregation",
        "campaign-level deadline decision before release",
        "multi-pledge batching",
        "coordinator campaign lifecycle"
      ]
    },
    repoProofs: [
      "Individual pledge funding is implemented in repo scripts.",
      "Release spend has been accepted on TN12.",
      "Refund spend has been accepted on TN12 with a DAA-score deadline."
    ],
    browserBoundary: [
      "This form does not submit transactions from the browser.",
      "Campaign target aggregation is still app/planner-side.",
      "AssurancePledge.sil is an individual pledge release/refund primitive, not a full pooled assurance contract."
    ]
  };
}

export function buildAssuranceLifecycle(contract) {
  const artifact = buildAssuranceArtifact(contract);

  return [
    {
      name: "Publish campaign",
      actor: "Coordinator",
      detail: `${contract.projectName} asks for ${contract.targetTkas} TKAS before a ${contract.deadlineHours}h deadline.`
    },
    {
      name: "Pledge",
      actor: "Contributor",
      detail: `A contributor locks at least ${contract.minimumPledgeTkas} TKAS to the campaign policy.`
    },
    {
      name: "Check target",
      actor: "Anyone",
      detail: `${artifact.state.remainingTkas} TKAS remains before the release path should become available.`
    },
    {
      name: "Release or refund",
      actor: "Recipient / pledgers",
      detail: artifact.state.outcomeIfDeadlineNow === "release-to-recipient"
        ? "The target is met, so the release path should pay the recipient."
        : "The target is not met, so the refund path should let pledgers reclaim funds."
    }
  ];
}

function clampInteger(value, min, max) {
  const number = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(Math.max(number, min), max);
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(number, min), max);
}
