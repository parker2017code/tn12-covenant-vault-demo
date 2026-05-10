import { VirtualChainSync } from "../src/virtualChainSync.mjs";

const BLOCK_HASH = "faa22f1ea0808a8a147e3f8fb0a55e3f33d923a9a2a6c21bbbbfa24e0ad88ac4";
const TN12_REST = "https://api-tn12.kaspa.org";

const syncer = new VirtualChainSync();
const vchain = await syncer.getVirtualChainFromBlock(BLOCK_HASH);

console.log("Virtual chain object keys:", Object.keys(vchain));
console.log("Full object:", JSON.stringify(vchain, null, 2).substring(0, 500));
