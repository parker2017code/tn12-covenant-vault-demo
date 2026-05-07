export function buildAssetPolicyRegistry(fixture = {}) {
  const policies = (fixture.policies || []).map(normalizePolicy);
  return {
    schema: "kaspa-simple-asset-policy-registry/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "roadmap-policy-not-live-native-asset",
    summary: {
      total: policies.length,
      covenantNative: policies.filter((policy) => policy.enforcement === "future-covenant-native").length,
      issuerIndexed: policies.filter((policy) => policy.enforcement === "issuer-indexer").length,
      recoveryEnabled: policies.filter((policy) => policy.rules.recovery.enabled).length
    },
    policies: policies.map((policy) => ({
      ...policy,
      lifecycle: buildLifecycle(policy),
      risk: policy.enforcement === "future-covenant-native"
        ? "Depends on final Toccata/covenant tooling before native enforcement claims."
        : "Issuer/indexer state must not be marketed as native covenant asset enforcement."
    })),
    boundaries: [
      "This is an asset policy planner, not a live native asset protocol.",
      "Issuer/indexer policies can model claims now, but covenant-native mint/transfer/burn/recovery is roadmap/Toccata work.",
      "KRC/ecosystem assets and future covenant-native assets must stay clearly separated in UI and docs.",
      "Every recovery or redemption path needs exact accepted transaction/indexer proof before being treated as state."
    ]
  };
}

function normalizePolicy(policy = {}) {
  return {
    assetId: String(policy.assetId || ""),
    name: String(policy.name || "Asset policy"),
    issuer: String(policy.issuer || ""),
    category: String(policy.category || "simple-asset"),
    enforcement: String(policy.enforcement || "issuer-indexer"),
    supplyCap: Number(policy.supplyCap || 0),
    decimals: Math.max(Math.round(Number(policy.decimals || 0)), 0),
    rules: {
      mint: normalizeRule(policy.rules?.mint, "issuer-only"),
      transfer: normalizeRule(policy.rules?.transfer, "holder-signed"),
      burn: normalizeRule(policy.rules?.burn, "holder-signed"),
      recovery: {
        enabled: Boolean(policy.rules?.recovery?.enabled),
        authority: String(policy.rules?.recovery?.authority || ""),
        delayHours: Number(policy.rules?.recovery?.delayHours || 0)
      },
      redemption: {
        enabled: Boolean(policy.rules?.redemption?.enabled),
        claim: String(policy.rules?.redemption?.claim || "")
      }
    },
    status: String(policy.status || "draft")
  };
}

function normalizeRule(rule = {}, defaultMode) {
  return {
    mode: String(rule.mode || defaultMode),
    status: String(rule.status || "planned")
  };
}

function buildLifecycle(policy) {
  const steps = ["define-policy", "issue-state-record"];
  if (policy.rules.mint.status !== "disabled") steps.push("mint");
  if (policy.rules.transfer.status !== "disabled") steps.push("transfer");
  if (policy.rules.burn.status !== "disabled") steps.push("burn");
  if (policy.rules.recovery.enabled) steps.push("delayed-recovery");
  if (policy.rules.redemption.enabled) steps.push("redemption");
  return steps;
}
