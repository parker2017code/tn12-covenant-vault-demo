export function verifyProofRecordSet({ proofEvidence, roleProofEvidence = null }) {
  const sets = [
    { name: "base", evidence: proofEvidence },
    ...(roleProofEvidence ? [{ name: "role-separated", evidence: roleProofEvidence }] : [])
  ];
  const records = sets.flatMap((set) => verifyEvidenceSet(set));
  const failures = records.flatMap((record) => record.failures.map((failure) => `${record.set}:${record.label}:${failure}`));

  return {
    schema: "tn12-canonical-proof-record-verification/v1",
    network: proofEvidence?.network || "kaspa-testnet-12",
    summary: {
      sets: sets.length,
      records: records.length,
      passed: records.filter((record) => record.failures.length === 0).length,
      failed: records.filter((record) => record.failures.length > 0).length
    },
    records,
    failures,
    note: "This verifier checks the canonical proof-record shape. It does not recover contract bytecode semantics from chain data; contract semantics remain tied to compiled Silverscript artifacts, fixtures, and adversarial tests."
  };
}

function verifyEvidenceSet({ name, evidence }) {
  return (evidence?.proofs || []).map((proof) => {
    const sourceSompi = BigInt(proof.input?.amount ?? 0);
    const outputSompi = BigInt(proof.output?.amount ?? 0);
    const feeSompi = sourceSompi - outputSompi;
    const failures = [];
    const expectedInputType = expectedSourceType(proof);

    check(failures, proof.accepted === true && proof.checks?.accepted === true, "tx-not-accepted");
    check(failures, Boolean(proof.txid), "missing-txid");
    check(failures, Boolean(proof.lane), "missing-lane");
    check(failures, Boolean(proof.entrypoint), "missing-entrypoint");
    check(failures, proof.checks?.sourceOutpointMatchesExpected === true, "source-outpoint-mismatch");
    check(failures, proof.checks?.sourceAmountMatchesExpected === true, "source-amount-mismatch");
    check(failures, proof.input?.type === expectedInputType, `unexpected-input-type:${proof.input?.type || "missing"}`);
    check(failures, proof.output?.type === "pubkey", "output-not-pubkey");
    check(failures, proof.checks?.amountMatchesExpectedOutput === true, "output-amount-mismatch");
    check(failures, proof.checks?.outputAddressMatchesExpected === true, "output-address-mismatch");
    check(failures, feeSompi >= 0n, "negative-fee");
    check(failures, Boolean(timingClass(proof)), "unknown-timing-class");

    return {
      set: name,
      label: proof.label,
      lane: proof.lane,
      entrypoint: proof.entrypoint,
      txid: proof.txid,
      timingClass: timingClass(proof),
      expectedInputType,
      sourceOutpoint: `${proof.input?.previousOutpointHash || ""}:${proof.input?.previousOutpointIndex ?? ""}`,
      sourceSompi: sourceSompi.toString(),
      outputSompi: outputSompi.toString(),
      feeSompi: feeSompi.toString(),
      failures
    };
  });
}

function expectedSourceType(proof) {
  if (proof.lane === "auction") return "pubkey";
  return "scripthash";
}

function timingClass(proof) {
  if (["withdraw", "refund"].includes(proof.entrypoint)) return "time-or-daa-constrained";
  if (["recover", "release", "cancel", "settle", "funding"].includes(proof.entrypoint)) return "not-time-constrained";
  return "";
}

function check(failures, condition, failure) {
  if (!condition) failures.push(failure);
}
