import {
  Address,
  PrivateKey,
  ScriptPublicKey,
  SignableTransaction,
  Transaction,
  TransactionInput,
  TransactionOutput,
  UtxoEntries,
  signTransaction
} from "kaspa-wasm";
import { blake2b } from "blakejs";
import { decimalTkasToSompi, sompiToTkas as formatSompiToTkas } from "./amounts.mjs";

const SOMPI_PER_TKAS = 100000000n;

export function buildSignedContractFundingDraft({
  funding,
  wallet,
  contractArtifact,
  lane,
  amountTkas,
  minerFeeSompi = 5000n
}) {
  if (wallet.address !== funding.address || !wallet.address.startsWith("kaspatest:")) {
    throw new Error("Wallet and funding outpoint must use the same TN12 kaspatest: address.");
  }

  const amountSompi = tkasToSompi(amountTkas);
  const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
  const changeSompi = fundingSompi - amountSompi - minerFeeSompi;

  if (changeSompi <= 0n) {
    throw new Error("Funding amount plus miner fee exceeds the fetched UTXO.");
  }

  const sourceScript = scriptPublicKeyFromHex(funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
  const contractRedeemScript = Uint8Array.from(contractArtifact.script);
  const contractScript = scriptPublicKeyP2sh(contractRedeemScript);
  const entries = new UtxoEntries([{
    address: new Address(funding.address),
    outpoint: funding.raw.outpoint,
    utxoEntry: {
      amount: fundingSompi,
      scriptPublicKey: sourceScript,
      blockDaaScore: BigInt(funding.raw.utxoEntry.blockDaaScore),
      isCoinbase: funding.raw.utxoEntry.isCoinbase
    }
  }]);
  const tx = new Transaction({
    version: 0,
    inputs: [
      new TransactionInput({
        previousOutpoint: funding.raw.outpoint,
        signatureScript: [],
        sequence: 0n,
        sigOpCount: 1
      })
    ],
    outputs: [
      new TransactionOutput(amountSompi, contractScript),
      new TransactionOutput(changeSompi, sourceScript)
    ],
    lockTime: 0n,
    subnetworkId: "0000000000000000000000000000000000000000",
    gas: 0n,
    payload: ""
  });
  tx.finalize();

  const signable = new SignableTransaction(tx, entries);
  const signed = signTransaction(signable, [new PrivateKey(wallet.privateKey)], true);
  const signedJson = parsePossiblyNestedJson(signed.toString());

  return {
    schema: "tn12-signed-contract-funding-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-not-broadcast",
    lane,
    contract: contractArtifact.contract_name,
    warning: "This spends the fetched UTXO if broadcast. Do not broadcast multiple drafts that use the same source outpoint.",
    source: {
      address: funding.address,
      txid: funding.txid,
      outputIndex: funding.outputIndex,
      amountTkas: funding.amountTkas
    },
    fundingOutput: {
      amountTkas,
      amountSompi: amountSompi.toString(),
      scriptType: "p2sh",
      redeemScriptBytes: contractArtifact.script.length,
      redeemScriptHash: bytesToHex(blake2b(contractRedeemScript, undefined, 32))
    },
    changeOutput: {
      address: wallet.address,
      amountTkas: sompiToTkas(changeSompi),
      amountSompi: changeSompi.toString()
    },
    minerFeeSompi: minerFeeSompi.toString(),
    transactionId: signedJson.tx?.id || signedJson.tx?.inner?.id || null,
    signedTransaction: signedJson
  };
}

export function tkasToSompi(value) {
  return decimalTkasToSompi(value);
}

function sompiToTkas(sompi) {
  return formatSompiToTkas(sompi);
}

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function scriptPublicKeyP2sh(redeemScript) {
  const hash = blake2b(redeemScript, undefined, 32);
  return new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}
