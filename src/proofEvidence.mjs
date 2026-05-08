export function buildProofEvidence({ proofFixture = {}, transactions = {}, previousTransactions = {}, verifiedAt = new Date().toISOString() }) {
  const proofs = (proofFixture.transactions || []).map((proof) => {
    const tx = transactions[proof.txid];
    const input = tx?.inputs?.[0] || {};
    const previousTx = previousTransactions[input.previous_outpoint_hash];
    const previousOutput = previousTx?.outputs?.find((output) => String(output.index) === String(input.previous_outpoint_index));
    const output = tx?.outputs?.find((item) => Number(item.index) === 0);
    const inputAddress = previousOutput?.script_public_key_address || "";
    const outputAddress = output?.script_public_key_address || "";
    const expectedSource = proof.source || {};
    const sourceOutpointMatchesExpected = expectedSource.txid
      ? String(input.previous_outpoint_hash || "") === String(expectedSource.txid)
        && String(input.previous_outpoint_index || "") === String(expectedSource.outputIndex)
      : true;
    const sourceAmountMatchesExpected = expectedSource.amountSompi
      ? String(previousOutput?.amount || "") === String(expectedSource.amountSompi)
      : true;

    return {
      label: String(proof.label || ""),
      lane: String(proof.lane || ""),
      entrypoint: String(proof.entrypoint || ""),
      txid: String(proof.txid || ""),
      accepted: Boolean(tx?.is_accepted),
      acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null,
      acceptingBlockTime: tx?.accepting_block_time ?? null,
      input: {
        previousOutpointHash: String(input.previous_outpoint_hash || ""),
        previousOutpointIndex: String(input.previous_outpoint_index || ""),
        expectedPreviousOutpointHash: String(expectedSource.txid || ""),
        expectedPreviousOutpointIndex: expectedSource.outputIndex ?? null,
        address: inputAddress,
        type: String(previousOutput?.script_public_key_type || ""),
        amount: Number(previousOutput?.amount || 0),
        expectedAmount: expectedSource.amountSompi ? Number(expectedSource.amountSompi) : null,
        prefix: addressPrefix(inputAddress),
        sigOpCount: Number(input.sig_op_count || 0)
      },
      output: {
        index: 0,
        address: outputAddress,
        type: String(output?.script_public_key_type || ""),
        amount: Number(output?.amount || 0),
        prefix: addressPrefix(outputAddress)
      },
      checks: {
        accepted: Boolean(tx?.is_accepted),
        inputIsP2sh: inputAddress.startsWith("kaspatest:p") && previousOutput?.script_public_key_type === "scripthash",
        sourceOutpointMatchesExpected,
        sourceAmountMatchesExpected,
        outputIsP2pk: outputAddress.startsWith("kaspatest:q") && output?.script_public_key_type === "pubkey",
        amountMatchesExpectedOutput: String(output?.amount || "") === String(proof.amountSompi || ""),
        outputAddressMatchesExpected: outputAddress === proof.destination
      }
    };
  });

  return {
    schema: "tn12-contract-spend-evidence/v1",
    network: proofFixture.network || "kaspa-testnet-12",
    verifiedAt,
    summary: {
      total: proofs.length,
      accepted: proofs.filter((proof) => proof.checks.accepted).length,
      p2shInputs: proofs.filter((proof) => proof.checks.inputIsP2sh).length,
      matchedInputs: proofs.filter((proof) => proof.checks.sourceOutpointMatchesExpected && proof.checks.sourceAmountMatchesExpected).length,
      p2pkOutputs: proofs.filter((proof) => proof.checks.outputIsP2pk).length,
      matchedOutputs: proofs.filter((proof) => proof.checks.amountMatchesExpectedOutput && proof.checks.outputAddressMatchesExpected).length
    },
    proofs,
    note: "Each proof spend resolves its input's previous output, checks the expected funding outpoint, then checks that the consumed output is a TN12 scripthash address and the spend pays the expected P2PK wallet output."
  };
}

function addressPrefix(address) {
  const payload = String(address || "").split(":")[1] || "";
  return payload.slice(0, 1);
}
