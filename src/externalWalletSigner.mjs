import { createInputSignature } from "./kaspaWasmRuntime.mjs";

/**
 * External wallet signer interface - supports KasWare, hardware wallets, etc.
 * Handles transaction signing without exposing private keys to the app
 */

export async function signWithExternalWallet({
  transactionUnsigned,
  inputIndex,
  wallet,
  walletType = "kaswore" // or "hardware", "kaspa-ng"
}) {
  if (walletType === "kaswore") {
    return await signWithKasWore(transactionUnsigned, inputIndex, wallet);
  } else if (walletType === "hardware") {
    return await signWithHardwareWallet(transactionUnsigned, inputIndex, wallet);
  } else if (walletType === "kaspa-ng") {
    return await signWithKaspaNG(transactionUnsigned, inputIndex, wallet);
  } else {
    throw new Error(`Unknown wallet type: ${walletType}`);
  }
}

async function signWithKasWore(transaction, inputIndex, wallet) {
  if (!window.kasware) {
    throw new Error("KasWare extension not found. Please install KasWare wallet.");
  }

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
  try {
    const signature = createInputSignature(transaction, privateKey, scriptHash);
    return {
      signature: signature,
      walletType: "local-test-only",
      warning: "Using local key - not recommended for production"
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
