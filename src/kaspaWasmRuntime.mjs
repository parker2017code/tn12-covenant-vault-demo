import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
let cachedRuntime = null;

export function getKaspaWasmRuntime() {
  if (cachedRuntime) return cachedRuntime;

  const specifier = process.env.KASPA_WASM_MODULE || "kaspa-wasm";
  const module = require(specifier);
  const metadata = readPackageMetadata(specifier, module);

  cachedRuntime = {
    specifier,
    module,
    metadata
  };
  return cachedRuntime;
}

function readPackageMetadata(specifier, module) {
  const packageJson = readPackageJson(specifier);
  return {
    package: packageJson?.name || "kaspa-wasm",
    version: packageJson?.version || readRuntimeVersion(module) || "unknown",
    source: specifier
  };
}

function readPackageJson(specifier) {
  for (const candidate of packageJsonCandidates(specifier)) {
    try {
      return require(candidate);
    } catch {
      // Try the next candidate; env paths and package names resolve differently.
    }
  }
  return null;
}

function packageJsonCandidates(specifier) {
  const candidates = [`${specifier}/package.json`];
  if (specifier.startsWith("/") || specifier.startsWith(".")) {
    const packagePath = join(specifier, "package.json");
    if (existsSync(packagePath)) candidates.unshift(packagePath);
  }
  return candidates;
}

function readRuntimeVersion(module) {
  try {
    return typeof module.version === "function" ? module.version() : module.version;
  } catch {
    return null;
  }
}
