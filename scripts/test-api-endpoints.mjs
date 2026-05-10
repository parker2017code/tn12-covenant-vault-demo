/**
 * Test which TN12 REST API endpoints are actually available
 */

const TN12_REST = "https://api-tn12.kaspa.org";
const TEST_TXID = "825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d";
const TEST_BLOCK = "faa22f1ea0808a8a147e3f8fb0a55e3f33d923a9a2a6c21bbbbfa24e0ad88ac4";

const endpoints = [
  { name: "transactions/{txid}", url: `${TN12_REST}/transactions/${TEST_TXID}` },
  { name: "blocks/{hash}", url: `${TN12_REST}/blocks/${TEST_BLOCK}` },
  { name: "info", url: `${TN12_REST}/info` },
  { name: "network", url: `${TN12_REST}/network` },
  { name: "blocks", url: `${TN12_REST}/blocks` },
  { name: "addressUTXO", url: `${TN12_REST}/addresses/kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt/utxos` }
];

for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint.url);
    const data = await response.json();
    const keys = data && typeof data === 'object' ? Object.keys(data).slice(0, 5) : 'non-object';
    console.log(`✓ ${endpoint.name.padEnd(25)} ${response.status} ${response.statusText} [${keys}]`);
  } catch (err) {
    console.log(`✗ ${endpoint.name.padEnd(25)} ${err.message}`);
  }
}
