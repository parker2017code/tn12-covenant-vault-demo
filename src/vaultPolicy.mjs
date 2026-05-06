export const DEFAULT_POLICY = Object.freeze({
  ownerAddress: "kaspatest:",
  recoveryAddress: "kaspatest:",
  withdrawalDelayHours: 24,
  dailyLimitTkas: 100,
  guardianThreshold: 2,
  guardianCount: 3,
  memo: "TN12 delayed recovery vault"
});

export function normalizePolicy(input) {
  const policy = {
    ownerAddress: String(input.ownerAddress || "").trim(),
    recoveryAddress: String(input.recoveryAddress || "").trim(),
    withdrawalDelayHours: Number(input.withdrawalDelayHours),
    dailyLimitTkas: Number(input.dailyLimitTkas),
    guardianThreshold: Number(input.guardianThreshold),
    guardianCount: Number(input.guardianCount),
    memo: String(input.memo || "").trim()
  };

  return {
    ...policy,
    withdrawalDelayHours: clampInteger(policy.withdrawalDelayHours, 1, 720),
    dailyLimitTkas: clampNumber(policy.dailyLimitTkas, 0.01, 1000000),
    guardianCount: clampInteger(policy.guardianCount, 1, 15),
    guardianThreshold: clampInteger(policy.guardianThreshold, 1, clampInteger(policy.guardianCount, 1, 15))
  };
}

export function validatePolicy(policy) {
  const issues = [];

  if (!policy.ownerAddress.startsWith("kaspatest:")) {
    issues.push("Owner address should be a TN12/testnet kaspatest: address.");
  }

  if (!policy.recoveryAddress.startsWith("kaspatest:")) {
    issues.push("Recovery address should be a TN12/testnet kaspatest: address.");
  }

  if (policy.ownerAddress && policy.ownerAddress === policy.recoveryAddress) {
    issues.push("Use a recovery address that is separate from the owner address.");
  }

  if (policy.guardianThreshold > policy.guardianCount) {
    issues.push("Guardian threshold cannot exceed guardian count.");
  }

  if (policy.withdrawalDelayHours < 6) {
    issues.push("A very short delay is useful for testing, but weak for a real vault design.");
  }

  return issues;
}

export function buildPolicyArtifact(policy, policyId) {
  return {
    schema: "tn12-covenant-vault-demo/v1",
    network: "kaspa-testnet-12",
    status: "local-simulation-not-broadcast",
    policyId,
    policy,
    covenantIntent: [
      "Funds can be withdrawn by the owner only after a delay.",
      "A recovery path can move funds to the recovery address.",
      "A daily spend limit can cap normal withdrawals.",
      "A guardian threshold can approve emergency recovery or cancellation."
    ],
    notImplemented: [
      "No transaction construction yet.",
      "No Silverscript compilation yet.",
      "No wallet signing yet.",
      "No TN12 broadcast yet."
    ]
  };
}

export function buildLifecycle(policy) {
  return [
    {
      name: "Design policy",
      actor: "User",
      detail: `Choose owner, recovery path, ${policy.withdrawalDelayHours}h delay, and ${policy.dailyLimitTkas} TKAS daily limit.`
    },
    {
      name: "Fund vault",
      actor: "Owner wallet",
      detail: "Send TN12 test funds to the covenant-controlled output after reviewing the policy ID."
    },
    {
      name: "Request withdrawal",
      actor: "Owner",
      detail: "Create a spend request. The vault records the destination and starts the delay clock."
    },
    {
      name: "Wait or cancel",
      actor: "Owner / guardians",
      detail: "If the request is suspicious, cancel it before the delay expires."
    },
    {
      name: "Release or recover",
      actor: "Owner / recovery path",
      detail: "After the delay, release the requested amount, or use the recovery path if the owner key is compromised."
    }
  ];
}

export async function policyId(policy) {
  const canonical = JSON.stringify(policy, Object.keys(policy).sort());

  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(canonical);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return toHex(new Uint8Array(digest)).slice(0, 24);
  }

  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 24);
}

function clampInteger(value, min, max) {
  const number = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(Math.max(number, min), max);
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(number, min), max);
}

function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
