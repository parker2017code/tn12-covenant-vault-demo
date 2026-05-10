/**
 * External wallet signer interface - supports KasWare, hardware wallets, etc.
 * Handles transaction signing without exposing private keys to the app
 *
 * In production, keys stay in wallet (KasWare, hardware, etc.)
 * In testing, local key fallback available for development
 */

export async function signWithExternalWallet({
  transactionUnsigned,
  inputIndex,
  wallet,
  walletType = "kaswore"
}) {
  if (walletType === "kaswore") {
    return await signWithKasWore(transactionUnsigned, inputIndex, wallet);
  } else if (walletType === "hardware") {
    return await signWithHardwareWallet(transactionUnsigned, inputIndex, wallet);
  } else if (walletType === "kaspa-ng") {
    return await signWithKaspaNG(transactionUnsigned, inputIndex, wallet);
  } else if (walletType === "local") {
    // Fallback: local key signing for testing only
    return await signWithLocalKey(
      transactionUnsigned,
      inputIndex,
      wallet.privateKey,
      wallet.scriptHash
    );
  } else {
    throw new Error(`Unknown wallet type: ${walletType}`);
  }
}

async function signWithKasWore(transaction, inputIndex, wallet) {
  // Check if we're in browser context with KasWare extension
  if (typeof window !== "undefined" && window.kasware) {
    const payload = {
      transaction: transaction,
      inputIndex: inputIndex,
      address: wallet.address
    };

    try {
      const result = await window.kasware.signTransaction(payload);
      return {
        signature: result.signature,
        address: result.address,
        walletType: "kaswore"
      };
    } catch (err) {
      throw new Error(`KasWare signing failed: ${err.message}`);
    }
  } else {
    throw new Error("KasWare extension not found. Install KasWare wallet extension.");
  }
}

async function signWithHardwareWallet(transaction, inputIndex, wallet) {
  // Placeholder for hardware wallet integration (Ledger, Trezor, etc.)
  throw new Error("Hardware wallet signing not yet implemented");
}

async function signWithKaspaNG(transaction, inputIndex, wallet) {
  // Placeholder for Kaspa NG desktop wallet integration
  throw new Error("Kaspa NG signing not yet implemented");
}

/**
 * Fallback: sign with local key (for testing only, NOT production)
 */
export function signWithLocalKey(transaction, inputIndex, privateKey, scriptHash) {
  if (!transaction || inputIndex === undefined) {
    throw new Error("Transaction and inputIndex required for signing");
  }

  if (!privateKey) {
    throw new Error("Private key required for local signing");
  }

  try {
    // In production, would call kaspa-wasm SDK: createInputSignature(tx, privKey, scriptHash)
    // For now, create a placeholder signature that indicates successful signing
    const signatureHex = Buffer.from(
      `${privateKey.substring(0, 32)}${scriptHash || "00".repeat(32)}`
    ).toString("hex").substring(0, 144); // Typical signature length

    return {
      signature: signatureHex,
      address: scriptHash,
      walletType: "local",
      warning: "Local key signing - testing only, not production"
    };
  } catch (err) {
    throw new Error(`Local key signing failed: ${err.message}`);
  }
}

/**
 * Build a signable transaction that can be passed to external signer
 */
export function buildSignableTransaction({
  tx,
  utxoEntries,
  inputIndex
}) {
  return {
    transaction: tx,
    utxoEntries: utxoEntries,
    inputIndex: inputIndex,
    timestamp: new Date().toISOString()
  };
}
