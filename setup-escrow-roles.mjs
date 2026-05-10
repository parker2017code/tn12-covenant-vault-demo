#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import { PrivateKey } from "kaspa-wasm";
import crypto from "crypto";

console.log(`\n🔑 Setting up Escrow Role Keys for Testing\n`);

// Generate random test keys for each role
const buyerPrivate = crypto.randomBytes(32).toString('hex');
const sellerPrivate = crypto.randomBytes(32).toString('hex');
const arbiterPrivate = crypto.randomBytes(32).toString('hex');

const buyerKey = new PrivateKey(buyerPrivate);
const sellerKey = new PrivateKey(sellerPrivate);
const arbiterKey = new PrivateKey(arbiterPrivate);

const buyerAddr = buyerKey.getPublicKey().toAddress("testnet");
const sellerAddr = sellerKey.getPublicKey().toAddress("testnet");
const arbiterAddr = arbiterKey.getPublicKey().toAddress("testnet");

const roles = {
  schema: "tn12-escrow-role-keys/v1",
  network: "kaspa-testnet-12",
  createdAt: new Date().toISOString(),
  note: "Test role keys for escrow settlement testing. Generate new funds to these addresses for real testing.",
  escrow: {
    buyer: {
      address: buyerAddr.toString(),
      publicKeyHex: buyerKey.getPublicKey().toString()
    },
    seller: {
      address: sellerAddr.toString(),
      publicKeyHex: sellerKey.getPublicKey().toString()
    },
    arbiter: {
      address: arbiterAddr.toString(),
      publicKeyHex: arbiterKey.getPublicKey().toString()
    }
  },
  private: {
    buyerPrivateKey: buyerKey.toString(),
    sellerPrivateKey: sellerKey.toString(),
    arbiterPrivateKey: arbiterKey.toString()
  }
};

await writeFile(".local/escrow-role-keys.json", JSON.stringify(roles, null, 2));

console.log(`✓ Created test role keys\n`);
console.log(`Buyer:   ${buyerAddr.toString()}`);
console.log(`Seller:  ${sellerAddr.toString()}`);
console.log(`Arbiter: ${arbiterAddr.toString()}`);
console.log(`\n✓ Saved to .local/escrow-role-keys.json`);
