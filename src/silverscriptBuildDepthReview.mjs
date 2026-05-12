export function buildSilverscriptBuildDepthReview({
  status = {},
  contractOutpoint = {},
  compiledArtifact = {},
  jsWasm = {}
} = {}) {
  const acceptedFunding = status.currentEvidence?.acceptedContractFunding || contractOutpoint;
  const compiledBytes = Number(status.compiledBytes || compiledArtifact.script_bytes || compiledArtifact.scriptBytes || 0);
  const jsOutputConstructor = jsWasm.transactionOutputConstructor || "constructor(value: bigint, script_public_key: ScriptPublicKey)";

  return {
    schema: "tn12-silverscript-build-depth-review/v1",
    reviewedAt: "2026-05-12",
    status: "stateful-covenant-depth-in-progress",
    target: {
      contract: "contracts/RecurringTreasuryVault.sil",
      pattern: "stateful singleton recurring treasury vault",
      goal: "Prove cap, destination, and relocked continuation state through a real covenant spend path."
    },
    currentEvidence: {
      compiled: compiledBytes > 0,
      compiledBytes,
      acceptedFunding: acceptedFunding?.txid ? {
        txid: acceptedFunding.txid,
        outputIndex: acceptedFunding.outputIndex,
        amountTkas: acceptedFunding.amountTkas,
        status: acceptedFunding.status || "accepted"
      } : null,
      walletPolicyUnderCapTxid: status.currentEvidence?.acceptedWalletPolicyTxid || null,
      negativeCandidates: status.negativeCandidates?.map((item) => item.id) || []
    },
    localSourceFindings: [
      {
        id: "rust-debugger-can-model-covenant-bindings",
        status: "supported-locally",
        evidence: "silverscript-tools debugger constructs TransactionOutput { covenant: Some(CovenantBinding { authorizing_input, covenant_id }) } for local covenant tests."
      },
      {
        id: "js-wasm-output-binding-gap",
        status: "blocks-js-live-submit",
        evidence: `Current kaspa-wasm TransactionOutput API exposes ${jsOutputConstructor}; no JS CovenantBinding constructor is exported in this package.`
      },
      {
        id: "debugger-sig-arg-gap",
        status: "blocks-current-recurring-vault-positive-debugger-run",
        evidence: "The CLI test harness can synthesize DECL state arguments, but the current recurring-vault path still needs a typed ownerSig/redeem-script route for a positive script run."
      }
    ],
    buildRulesForAgents: [
      "Do not call the recurring cap SCRIPT_ENFORCED because the compiled contract and accepted funding are not an accepted spend.",
      "Use the Rust debugger/test path for covenant-state mechanics before trying JS live submit.",
      "Treat JS live submit as blocked until output covenant binding and signature-script construction are proven with the exact SDK route.",
      "A serious next proof needs one positive under-cap spend and negative cases for over cap, wrong destination, missing continuation, and wrong owner."
    ],
    nextSteps: [
      {
        order: 1,
        task: "Create a minimal Rust or debugger fixture that proves RecurringTreasuryVault state transition without relying on JS output construction."
      },
      {
        order: 2,
        task: "Patch or wrap signature-script construction so ownerSig is typed correctly for the generated DECL entrypoint."
      },
      {
        order: 3,
        task: "Only after local positive and negative covenant tests pass, build a live TN12 submit route that preserves covenant binding fields."
      },
      {
        order: 4,
        task: "Promote the UI label from WALLET_POLICY only after an accepted spend from the funded RecurringTreasuryVault output exists."
      }
    ]
  };
}
