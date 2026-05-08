export function buildBatchAssurancePledgeOutputPlan({
  custodyRequirements = {},
  walletConnectorRequests = {}
} = {}) {
  const requirements = Array.isArray(custodyRequirements.requirements)
    ? custodyRequirements.requirements
    : [];
  const blocked = requirements.filter((requirement) => requirement.status !== "custody-input-ready");
  const ready = requirements.filter((requirement) => requirement.status === "custody-input-ready");
  const outputsToCreate = blocked.map((requirement, index) =>
    buildOutputRequirement({ requirement, index, campaign: custodyRequirements.campaign || {} })
  );
  const totalRequiredSompi = sumSompi(requirements.map((requirement) => requirement.required?.amountSompi));
  const readySompi = sumSompi(ready.map((requirement) => requirement.required?.amountSompi));
  const missingSompi = sumSompi(outputsToCreate.map((output) => output.amountSompi));
  const connectorReady = walletConnectorRequests.status === "connector-submit-requests-ready";

  return {
    schema: "tn12-batch-assurance-pledge-output-plan/v1",
    network: custodyRequirements.network || "kaspa-testnet-12",
    status: outputsToCreate.length > 0
      ? "pledge-output-plan-ready"
      : "pledge-outputs-already-matched",
    campaign: custodyRequirements.campaign || {},
    summary: {
      requiredOutputs: requirements.length,
      readyOutputs: ready.length,
      outputsToCreate: outputsToCreate.length,
      totalRequiredTkas: sompiToTkas(totalRequiredSompi),
      readyTkas: sompiToTkas(readySompi),
      missingTkas: sompiToTkas(missingSompi),
      walletConnectorRequestsReady: connectorReady,
      walletConnectorRequestCount: Number(walletConnectorRequests.summary?.requests || 0),
      statusBeforeFunding: custodyRequirements.status || "unknown"
    },
    outputsToCreate,
    submitFlow: [
      {
        step: "create-wallet-reviewed-output",
        detail: "Build one TN12 transaction output for each blocked pledge amount and have the wallet present the exact amount before signing."
      },
      {
        step: "submit-testnet-transaction",
        detail: "Submit through the real wallet connector or the explicit TN12 submit command. Do not use the public REST payload route for payload-bearing state."
      },
      {
        step: "verify-accepted-output",
        detail: "Fetch the accepted transaction and confirm output index, amount, network, and txid before importing it into the campaign fixture."
      },
      {
        step: "import-campaign-outpoint",
        detail: "Replace the planner payload outpoint for the pledge with the accepted amount-matched output outpoint, then rerun campaign custody gates."
      }
    ],
    acceptanceCriteria: [
      "Each created outpoint must be accepted on TN12 before it can count as custody.",
      "Each imported outpoint amount must exactly equal the pledge amount.",
      "Each imported outpoint must be unique within the campaign.",
      "Wallet review must show destination, amount, fee, and payload/no-payload status before submit.",
      "Release/refund custody drafts remain blocked until these outputs are accepted and imported."
    ],
    boundaries: [
      "This is a funding/import plan, not a signed transaction.",
      "It does not prove spend authority for a future pooled covenant output.",
      "The current custody requirements check amount matching; future work should add script template and spend-authority checks before settlement claims.",
      "The existing accepted pledge payloads remain planner/indexer state, not custody of pledge funds."
    ],
    nextCommands: [
      "npm run wallet:connector-requests",
      "npm run campaign:custody-requirements",
      "npm run campaign:pledge-outputs"
    ]
  };
}

function buildOutputRequirement({ requirement, index, campaign }) {
  return {
    id: `pledge-output-${String(index + 1).padStart(3, "0")}`,
    pledgeId: requirement.pledgeId,
    contributor: requirement.contributor,
    amountSompi: String(requirement.required?.amountSompi || "0"),
    amountTkas: requirement.required?.amountTkas || "0",
    intendedSettlementUse: "batch-assurance-release-or-refund-input",
    reviewLabel: `Batch assurance pledge output for ${requirement.pledgeId}`,
    recipientAddress: campaign.recipientAddress || "",
    replacementFor: {
      txid: requirement.currentReference?.txid || "",
      outputIndex: Number(requirement.currentReference?.outputIndex || 0),
      observedAmountTkas: requirement.currentReference?.observedAmountTkas || "0",
      reason: requirement.blockers?.[0] || "Current reference is not custody-ready."
    },
    importTarget: {
      fixturePath: "fixtures/BatchAssuranceCampaign.json",
      pledgeId: requirement.pledgeId,
      fields: ["acceptedTxid", "outpoint.txid", "outpoint.index", "status"]
    }
  };
}

function sumSompi(values) {
  return values.reduce((total, value) => total + BigInt(value || 0), 0n);
}

function sompiToTkas(sompi) {
  const value = BigInt(sompi);
  const whole = value / 100000000n;
  const fraction = value % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
