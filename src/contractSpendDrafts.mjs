import {
  Address,
  PrivateKey,
  ScriptPublicKey,
  SignableTransaction,
  Transaction,
  TransactionInput,
  TransactionOutput,
  UtxoEntries,
  signScriptHash
} from "kaspa-wasm";

const ZERO_SUBNETWORK_ID = "0000000000000000000000000000000000000000";
const OP_0 = 0x00;
const OP_1 = 0x51;
const OP_2 = 0x52;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const FINAL_SEQUENCE = 18446744073709551615n;
const NONFINAL_SEQUENCE = 0n;

export function buildVaultRecoverySpendDraft({
  contractOutpoint,
  wallet,
  contractFeeSompi = 1000n
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Vault recovery output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript,
    sigOpCount: 2
  });
  const scriptHash = unsigned.signable.getScriptHashes()[0];
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [
      ...hexToBytes(signScriptHash(scriptHash, new PrivateKey(wallet.privateKey))),
      OP_1
    ],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return {
    schema: "tn12-signed-contract-spend-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-not-broadcast",
    lane: "vault-recovery",
    contract: "DelayedRecoveryVault",
    entrypoint: "recover",
    warning: "This spends the vault P2SH output if submitted and accepted.",
    source: {
      txid: contractOutpoint.txid,
      outputIndex: contractOutpoint.outputIndex,
      amountTkas: contractOutpoint.amountTkas,
      address: contractOutpoint.scriptPublicKeyAddress
    },
    destination: {
      address: wallet.address,
      scriptType: "p2pk",
      amountSompi: outputSompi.toString(),
      amountTkas: sompiToTkas(outputSompi)
    },
    contractFeeSompi: contractFeeSompi.toString(),
    scriptHash,
    transactionId: unsigned.tx.id,
    signatureScriptHex: bytesToHex(signatureScript),
    submitPayload: buildSubmitPayload({
      tx: unsigned.tx,
      input: unsigned.input,
      outputSompi,
      destinationScript,
      signatureScript
    })
  };
}

export function buildVaultWithdrawalSpendDraft({
  contractOutpoint,
  wallet,
  contractFeeSompi = 5000n,
  lockTime = BigInt(Math.floor(Date.now() / 1000))
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Vault withdrawal output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript,
    lockTime
  });
  const scriptHash = unsigned.signable.getScriptHashes()[0];
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [
      ...hexToBytes(signScriptHash(scriptHash, new PrivateKey(wallet.privateKey))),
      OP_0
    ],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return {
    schema: "tn12-signed-contract-spend-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-not-broadcast",
    lane: "vault-withdrawal",
    contract: "DelayedRecoveryVault",
    entrypoint: "withdraw",
    warning: "This spends the vault P2SH output if submitted after unlockTime and accepted.",
    source: {
      txid: contractOutpoint.txid,
      outputIndex: contractOutpoint.outputIndex,
      amountTkas: contractOutpoint.amountTkas,
      address: contractOutpoint.scriptPublicKeyAddress
    },
    destination: {
      address: wallet.address,
      scriptType: "p2pk",
      amountSompi: outputSompi.toString(),
      amountTkas: sompiToTkas(outputSompi)
    },
    contractFeeSompi: contractFeeSompi.toString(),
    lockTime: lockTime.toString(),
    scriptHash,
    transactionId: unsigned.tx.id,
    signatureScriptHex: bytesToHex(signatureScript),
    submitPayload: buildSubmitPayload({
      tx: unsigned.tx,
      input: unsigned.input,
      outputSompi,
      destinationScript,
      signatureScript
    })
  };
}

export function buildAssuranceReleaseSpendDraft({
  contractOutpoint,
  wallet,
  contractFeeSompi = 1000n
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Assurance release output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript
  });
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [OP_0],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return {
    schema: "tn12-signed-contract-spend-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-not-broadcast",
    lane: "assurance-release",
    contract: "AssurancePledge",
    entrypoint: "release",
    warning: "This spends the assurance pledge P2SH output if submitted and accepted.",
    source: {
      txid: contractOutpoint.txid,
      outputIndex: contractOutpoint.outputIndex,
      amountTkas: contractOutpoint.amountTkas,
      address: contractOutpoint.scriptPublicKeyAddress
    },
    destination: {
      address: wallet.address,
      scriptType: "p2pk",
      amountSompi: outputSompi.toString(),
      amountTkas: sompiToTkas(outputSompi)
    },
    contractFeeSompi: contractFeeSompi.toString(),
    transactionId: unsigned.tx.id,
    signatureScriptHex: bytesToHex(signatureScript),
    submitPayload: buildSubmitPayload({
      tx: unsigned.tx,
      input: unsigned.input,
      outputSompi,
      destinationScript,
      signatureScript
    })
  };
}

export function buildAssuranceRefundSpendDraft({
  contractOutpoint,
  wallet,
  contractFeeSompi = 5000n,
  lockTime = BigInt(Math.floor(Date.now() / 1000))
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Assurance refund output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript,
    lockTime
  });
  const scriptHash = unsigned.signable.getScriptHashes()[0];
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [
      ...hexToBytes(signScriptHash(scriptHash, new PrivateKey(wallet.privateKey))),
      OP_1
    ],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return {
    schema: "tn12-signed-contract-spend-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-not-broadcast",
    lane: "assurance-refund",
    contract: "AssurancePledge",
    entrypoint: "refund",
    warning: "This spends the assurance pledge P2SH output if submitted after deadline and accepted.",
    source: {
      txid: contractOutpoint.txid,
      outputIndex: contractOutpoint.outputIndex,
      amountTkas: contractOutpoint.amountTkas,
      address: contractOutpoint.scriptPublicKeyAddress
    },
    destination: {
      address: wallet.address,
      scriptType: "p2pk",
      amountSompi: outputSompi.toString(),
      amountTkas: sompiToTkas(outputSompi)
    },
    contractFeeSompi: contractFeeSompi.toString(),
    lockTime: lockTime.toString(),
    scriptHash,
    transactionId: unsigned.tx.id,
    signatureScriptHex: bytesToHex(signatureScript),
    submitPayload: buildSubmitPayload({
      tx: unsigned.tx,
      input: unsigned.input,
      outputSompi,
      destinationScript,
      signatureScript
    })
  };
}

export function buildEscrowReleaseSpendDraft({
  contractOutpoint,
  wallet,
  contractFeeSompi = 5000n
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Escrow release output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript
  });
  const scriptHash = unsigned.signable.getScriptHashes()[0];
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [
      ...hexToBytes(signScriptHash(scriptHash, new PrivateKey(wallet.privateKey))),
      OP_0
    ],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return buildSpendDraftArtifact({
    lane: "escrow-release",
    contract: "Escrow",
    entrypoint: "release",
    warning: "This spends the escrow P2SH output to the seller path if submitted and accepted.",
    contractOutpoint,
    wallet,
    outputSompi,
    contractFeeSompi,
    scriptHash,
    tx: unsigned.tx,
    input: unsigned.input,
    destinationScript,
    signatureScript
  });
}

export function buildEscrowRefundSpendDraft({
  contractOutpoint,
  wallet,
  contractFeeSompi = 5000n,
  lockTime = BigInt(Math.floor(Date.now() / 1000))
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Escrow refund output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript,
    lockTime
  });
  const scriptHash = unsigned.signable.getScriptHashes()[0];
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [
      ...hexToBytes(signScriptHash(scriptHash, new PrivateKey(wallet.privateKey))),
      OP_1
    ],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return {
    ...buildSpendDraftArtifact({
      lane: "escrow-refund",
      contract: "Escrow",
      entrypoint: "refund",
      warning: "This spends the escrow P2SH output to the buyer refund path if submitted after refundTime and accepted.",
      contractOutpoint,
      wallet,
      outputSompi,
      contractFeeSompi,
      scriptHash,
      tx: unsigned.tx,
      input: unsigned.input,
      destinationScript,
      signatureScript
    }),
    lockTime: lockTime.toString()
  };
}

export function buildEscrowCancelSpendDraft({
  contractOutpoint,
  wallet,
  sellerWallet = wallet,
  contractFeeSompi = 5000n
}) {
  const redeemScript = hexToBytes(contractOutpoint.redeemScriptHex);
  const destinationScript = p2pkScript(wallet.xOnlyPublicKey);
  const inputSompi = BigInt(contractOutpoint.amountSompi);
  const outputSompi = inputSompi - contractFeeSompi;

  if (outputSompi <= 0n) {
    throw new Error("Escrow cancel output would be non-positive.");
  }

  const unsigned = buildSingleInputContractSpend({
    contractOutpoint,
    outputSompi,
    destinationScript
  });
  const scriptHash = unsigned.signable.getScriptHashes()[0];
  const buyerSignature = hexToBytes(signScriptHash(scriptHash, new PrivateKey(wallet.privateKey)));
  const sellerSignature = hexToBytes(signScriptHash(scriptHash, new PrivateKey(sellerWallet.privateKey)));
  const signatureScript = buildP2shSignatureScript({
    entrypointSigScript: [
      ...buyerSignature,
      ...sellerSignature,
      OP_2
    ],
    redeemScript
  });

  unsigned.input.signatureScript = signatureScript;
  unsigned.tx.finalize();

  return buildSpendDraftArtifact({
    lane: "escrow-cancel",
    contract: "Escrow",
    entrypoint: "cancel",
    warning: "This spends the escrow P2SH output through mutual cancel if submitted and accepted.",
    contractOutpoint,
    wallet,
    outputSompi,
    contractFeeSompi,
    scriptHash,
    tx: unsigned.tx,
    input: unsigned.input,
    destinationScript,
    signatureScript
  });
}

function buildSpendDraftArtifact({
  lane,
  contract,
  entrypoint,
  warning,
  contractOutpoint,
  wallet,
  outputSompi,
  contractFeeSompi,
  scriptHash,
  tx,
  input,
  destinationScript,
  signatureScript
}) {
  return {
    schema: "tn12-signed-contract-spend-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-not-broadcast",
    lane,
    contract,
    entrypoint,
    warning,
    source: {
      txid: contractOutpoint.txid,
      outputIndex: contractOutpoint.outputIndex,
      amountTkas: contractOutpoint.amountTkas,
      address: contractOutpoint.scriptPublicKeyAddress
    },
    destination: {
      address: wallet.address,
      scriptType: "p2pk",
      amountSompi: outputSompi.toString(),
      amountTkas: sompiToTkas(outputSompi)
    },
    contractFeeSompi: contractFeeSompi.toString(),
    scriptHash,
    transactionId: tx.id,
    signatureScriptHex: bytesToHex(signatureScript),
    submitPayload: buildSubmitPayload({
      tx,
      input,
      outputSompi,
      destinationScript,
      signatureScript
    })
  };
}

function buildSingleInputContractSpend({
  contractOutpoint,
  outputSompi,
  destinationScript,
  lockTime = 0n,
  sigOpCount = 1
}) {
  const input = new TransactionInput({
    previousOutpoint: contractOutpoint.raw.outpoint,
    signatureScript: [],
    sequence: lockTime > 0n ? NONFINAL_SEQUENCE : FINAL_SEQUENCE,
    sigOpCount
  });
  const tx = new Transaction({
    version: 0,
    inputs: [input],
    outputs: [
      new TransactionOutput(outputSompi, new ScriptPublicKey(0, destinationScript))
    ],
    lockTime,
    subnetworkId: ZERO_SUBNETWORK_ID,
    gas: 0n,
    payload: ""
  });
  tx.finalize();

  const entries = new UtxoEntries([{
    address: new Address(contractOutpoint.scriptPublicKeyAddress),
    outpoint: contractOutpoint.raw.outpoint,
    utxoEntry: {
      amount: BigInt(contractOutpoint.amountSompi),
      scriptPublicKey: scriptPublicKeyFromHex(contractOutpoint.scriptPublicKey),
      blockDaaScore: BigInt(contractOutpoint.raw.utxoEntry.blockDaaScore),
      isCoinbase: contractOutpoint.raw.utxoEntry.isCoinbase
    }
  }]);

  return {
    tx,
    input,
    signable: new SignableTransaction(tx, entries)
  };
}

function buildP2shSignatureScript({ entrypointSigScript, redeemScript }) {
  return Uint8Array.from([
    ...entrypointSigScript,
    ...pushData(redeemScript)
  ]);
}

function pushData(bytes) {
  if (bytes.length === 0) {
    return [OP_0];
  }
  if (bytes.length <= 75) {
    return [bytes.length, ...bytes];
  }
  if (bytes.length <= 255) {
    return [OP_PUSHDATA1, bytes.length, ...bytes];
  }
  if (bytes.length <= 65535) {
    return [OP_PUSHDATA2, bytes.length & 0xff, bytes.length >> 8, ...bytes];
  }
  throw new Error(`Cannot push ${bytes.length} bytes.`);
}

function buildSubmitPayload({ tx, input, outputSompi, destinationScript, signatureScript }) {
  return {
    transaction: {
      version: 0,
      inputs: [
        {
          previousOutpoint: {
            transactionId: input.previousOutpoint.transactionId,
            index: input.previousOutpoint.index
          },
          signatureScript: bytesToHex(signatureScript),
          sequence: String(input.sequence),
          sigOpCount: input.sigOpCount
        }
      ],
      outputs: [
        {
          amount: Number(outputSompi),
          scriptPublicKey: {
            version: 0,
            scriptPublicKey: bytesToHex(destinationScript)
          }
        }
      ],
      lockTime: Number(tx.lock_time ?? tx.lockTime ?? 0),
      subnetworkId: tx.subnetworkId || ZERO_SUBNETWORK_ID
    },
    allowOrphan: false
  };
}

function p2pkScript(xOnlyPublicKey) {
  return Uint8Array.from([0x20, ...hexToBytes(xOnlyPublicKey), 0xac]);
}

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, hexToBytes(hex));
}

function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16)));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}

function sompiToTkas(sompi) {
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) {
    return whole.toString();
  }
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
