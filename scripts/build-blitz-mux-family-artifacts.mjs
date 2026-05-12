import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { blake2b } from "blakejs";

const silverc = process.env.SILVERC || "/home/parker2017/silverscript-tools/target/release/silverc";

const members = [
  { id: "mux", source: "contracts/BlitzMux.sil", baseArtifact: "artifacts/BlitzMux.json", fixture: "fixtures/BlitzMuxFamily.ctor.json", artifact: "artifacts/BlitzMuxFamily.json" },
  { id: "a", source: "contracts/BlitzWorkerA.sil", baseArtifact: "artifacts/BlitzWorkerA.json", fixture: "fixtures/BlitzWorkerAFamily.ctor.json", artifact: "artifacts/BlitzWorkerAFamily.json" },
  { id: "b", source: "contracts/BlitzWorkerB.sil", baseArtifact: "artifacts/BlitzWorkerB.json", fixture: "fixtures/BlitzWorkerBFamily.ctor.json", artifact: "artifacts/BlitzWorkerBFamily.json" }
];

await access(silverc);
await mkdir("fixtures", { recursive: true });
await mkdir("artifacts", { recursive: true });

const templates = {};
for (const member of members) {
  const base = await readJson(member.baseArtifact);
  templates[member.id] = templateHash(base);
}

for (const member of members) {
  const pending = member.id === "mux" ? 0 : member.id === "a" ? 1 : 2;
  await writeFile(member.fixture, `${JSON.stringify([
    byteArrayArg(templates.mux),
    byteArrayArg(templates.a),
    byteArrayArg(templates.b),
    intArg(5),
    intArg(10),
    intArg(pending)
  ], null, 2)}\n`);
  await run(silverc, [member.source, "-o", member.artifact, "--constructor-args", member.fixture]);
}

const out = {
  schema: "tn12-blitz-mux-family-artifacts/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "family-template-artifacts-built",
  templates: {
    mux: bytesToHex(templates.mux),
    a: bytesToHex(templates.a),
    b: bytesToHex(templates.b)
  },
  members: members.map(({ id, source, fixture, artifact }) => ({ id, source, fixture, artifact }))
};

await writeFile("artifacts/blitz-mux-family-artifacts.json", `${JSON.stringify(out, null, 2)}\n`);
console.log("artifacts/blitz-mux-family-artifacts.json family-template-artifacts-built");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function templateHash(artifact) {
  const { start, len } = artifact.state_layout;
  const script = Uint8Array.from(artifact.script || []);
  const prefix = script.slice(0, start);
  const suffix = script.slice(start + len);
  return blake2b(new Uint8Array([...prefix, ...suffix]), undefined, 32);
}

function byteArrayArg(bytes) {
  return {
    kind: "array",
    data: Array.from(bytes).map((byte) => ({ kind: "byte", data: byte }))
  };
}

function intArg(value) {
  return { kind: "int", data: value };
}

function bytesToHex(bytes) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}
