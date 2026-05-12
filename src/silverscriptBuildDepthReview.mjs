export function buildSilverscriptBuildDepthReview({
  status = {},
  contractOutpoint = {},
  compiledArtifact = {},
  stateProof = {},
  ownerSigProof = {},
  liveSubmitReadiness = {},
  rustSubmitRouteProbe = {},
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
      stateProof: stateProof.status ? {
        status: stateProof.status,
        cases: stateProof.cases?.length || 0,
        source: stateProof.source
      } : null,
      ownerSigProof: ownerSigProof.status ? {
        status: ownerSigProof.status,
        cases: ownerSigProof.cases?.length || 0,
        source: ownerSigProof.source
      } : null,
      liveSubmitReadiness: liveSubmitReadiness.status || null,
      rustSubmitRouteProbe: rustSubmitRouteProbe.status || null,
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
        evidence: liveSubmitReadiness.blocker?.detail || `Current kaspa-wasm TransactionOutput API exposes ${jsOutputConstructor}; no JS CovenantBinding constructor is exported in this package.`
      },
      {
        id: "rust-rpc-submit-route-preserves-covenant-binding",
        status: rustSubmitRouteProbe.status === "rust-submit-route-preserves-covenant-binding" ? "supported-locally" : "not-run",
        evidence: rustSubmitRouteProbe.status === "rust-submit-route-preserves-covenant-binding"
          ? "A Rust RPC SubmitTransactionRequest probe preserves output covenant binding and tx v1 computeBudget."
          : "Rust submit-route covenant-binding probe has not passed yet."
      },
      {
        id: "state-transition-proof",
        status: stateProof.status === "local-state-transition-proof-passed" ? "supported-locally" : "not-run",
        evidence: stateProof.status === "local-state-transition-proof-passed"
          ? "RecurringTreasuryVaultStateProbe proves under-cap continuation and rejects over-cap, wrong destination, and missing continuation in the local SilverScript debugger."
          : "State-transition proof artifact has not passed yet."
      },
      {
        id: "owner-sig-proof",
        status: ownerSigProof.status === "local-owner-sig-covenant-proof-passed" ? "supported-locally" : "not-run",
        evidence: ownerSigProof.status === "local-owner-sig-covenant-proof-passed"
          ? "A Rust harness signs the transaction hash, builds the generated __spend sigscript, appends the redeem script, and proves the full RecurringTreasuryVault.sil ownerSig path locally."
          : "Full ownerSig covenant proof has not passed yet."
      }
    ],
    buildRulesForAgents: [
      "Do not call the recurring cap SCRIPT_ENFORCED because the compiled contract and accepted funding are not an accepted spend.",
      "Use the Rust debugger/test path for covenant-state mechanics before trying JS live submit.",
      "Use the Rust RPC submit route first because local probing shows it preserves covenant output binding.",
      "Treat JS live submit as blocked until output covenant binding and signature-script construction are proven with the exact SDK route.",
      "A serious next proof needs one positive under-cap spend and negative cases for over cap, wrong destination, missing continuation, and wrong owner."
    ],
    nextSteps: [
      {
        order: 1,
        task: "Use a Rust submit route or a JS SDK that preserves output covenant bindings."
      },
      {
        order: 2,
        task: "Convert the local Rust proof into a TN12 spend from the funded RecurringTreasuryVault output."
      },
      {
        order: 3,
        task: "Keep JS submit blocked unless kaspa-wasm exposes or accepts the exact covenant binding fields."
      },
      {
        order: 4,
        task: "Promote the UI label from WALLET_POLICY only after an accepted spend from the funded RecurringTreasuryVault output exists."
      }
    ]
  };
}
