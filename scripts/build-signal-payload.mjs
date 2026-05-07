import { mkdir, writeFile } from "node:fs/promises";
import {
  DEFAULT_SIGNAL_PAYLOAD,
  buildSignalPayloadArtifact
} from "../src/signalPayload.mjs";

const payload = {
  kind: process.env.SIGNAL_KIND || DEFAULT_SIGNAL_PAYLOAD.kind,
  subject: process.env.SIGNAL_SUBJECT || DEFAULT_SIGNAL_PAYLOAD.subject,
  value: process.env.SIGNAL_VALUE || DEFAULT_SIGNAL_PAYLOAD.value,
  note: process.env.SIGNAL_NOTE || DEFAULT_SIGNAL_PAYLOAD.note
};

const artifact = buildSignalPayloadArtifact(payload);
const outDir = new URL("../artifacts/", import.meta.url);
const outFile = new URL("signal-payload.json", outDir);

await mkdir(outDir, { recursive: true });
await writeFile(outFile, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`Wrote ${outFile.pathname}`);
console.log(JSON.stringify({
  status: artifact.status,
  lane: artifact.lane,
  bytes: artifact.encoded.bytes,
  transientMass: artifact.encoded.transientMass
}, null, 2));
