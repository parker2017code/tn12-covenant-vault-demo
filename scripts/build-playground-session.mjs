import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPlaygroundSession } from "../src/playgroundSession.mjs";

const outPath = process.env.OUT || "artifacts/playground-session.example.json";
const plan = await readJson("artifacts/playground-plan.json");
const walletsPublicPath = process.env.PLAYGROUND_WALLETS_PUBLIC || "";
const fundingEvidencePath = process.env.PLAYGROUND_FUNDING_EVIDENCE || "artifacts/playground-funding-evidence.json";
const depositEvidencePath = process.env.PLAYGROUND_DEPOSIT_EVIDENCE || "artifacts/playground-user-a-pool-deposit-evidence.json";
const secondDepositEvidencePath = process.env.PLAYGROUND_SECOND_DEPOSIT_EVIDENCE || "artifacts/playground-user-b-pool-deposit-evidence.json";
const payoutEvidencePath = process.env.PLAYGROUND_PAYOUT_EVIDENCE || "artifacts/playground-pool-user-b-payout-evidence.json";
const publicWallets = walletsPublicPath ? await readJson(walletsPublicPath) : null;
const fundingEvidence = await readOptionalJson(fundingEvidencePath);
const depositEvidence = await readOptionalJson(depositEvidencePath);
const secondDepositEvidence = await readOptionalJson(secondDepositEvidencePath);
const payoutEvidence = await readOptionalJson(payoutEvidencePath);
const session = buildPlaygroundSession({
  plan,
  publicAddresses: publicWallets ? publicAddressesFromWallets(publicWallets) : defaultPublicAddresses(),
  txids: [
    fundingEvidence ? {
      label: "playground role funding",
      txid: fundingEvidence.txid,
      accepted: fundingEvidence.status === "accepted-transfer-matched",
      enforcement: "LOCAL_KEY_CUSTODY_TEST"
    } : null,
    depositEvidence ? {
      label: "playground user-a pool deposit",
      txid: depositEvidence.txid,
      accepted: depositEvidence.status === "accepted-transfer-matched",
      enforcement: "LOCAL_KEY_CUSTODY_TEST"
    } : null,
    secondDepositEvidence ? {
      label: "playground user-b pool deposit",
      txid: secondDepositEvidence.txid,
      accepted: secondDepositEvidence.status === "accepted-transfer-matched",
      enforcement: "LOCAL_KEY_CUSTODY_TEST"
    } : null,
    payoutEvidence ? {
      label: "playground pool user-b payout",
      txid: payoutEvidence.txid,
      accepted: payoutEvidence.status === "accepted-transfer-matched",
      enforcement: "LOCAL_KEY_CUSTODY_TEST"
    } : null
  ].filter(Boolean)
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(session, null, 2)}\n`);
console.log(outPath);
console.log(`roles=${session.summary.roles}`);
console.log(`privateKeysIncluded=${session.summary.privateKeysIncluded}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch {
    return null;
  }
}

function publicAddressesFromWallets(artifact) {
  return Object.fromEntries((artifact.wallets || []).map((wallet) => [wallet.id, wallet.address]));
}

function defaultPublicAddresses() {
  return {
    operator: "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt",
    pool: "kaspatest:qqpgfuzxvt7vtud4qv5aklpe5z0kd27j4pw33x33t3ya3ya95ffrymd0gntt4",
    "user-a": "kaspatest:qz2cgcm73ej5l72g9zxkk44rxz4au35fmrg49xdurnr9ca63dzyuu9fn3atvh",
    "user-b": "kaspatest:qz5epzeyjk65xaajf7mt36apk4fa2p52548chz300sr2dx8uqmkfjzvhq0a8v",
    executor: "kaspatest:qqpxcwpdqazxgmgvhj2ntp8mvxwkaetw73g0prq97q2vxfpwg2w3sv3kd5f0z",
    reviewer: "kaspatest:qzcvj4raan9cskly8p9nn7slpke09ztrzw4dmzx5s3ud8rad4f8msvl6juaj9"
  };
}
