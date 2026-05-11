import assert from "node:assert/strict";
import {
  SOMPI_PER_TKAS,
  decimalTkasToSompi,
  sompiToSafeJsonNumber,
  sompiToTkas
} from "../../src/amounts.mjs";

assert.equal(SOMPI_PER_TKAS, 100000000n);

const cases = [
  ["0", "0"],
  ["1", "100000000"],
  ["1.00000001", "100000001"],
  ["0.00000001", "1"],
  ["123.45", "12345000000"],
  [" 2.5 ", "250000000"]
];

for (const [tkas, sompi] of cases) {
  assert.equal(decimalTkasToSompi(tkas).toString(), sompi);
}

assert.equal(sompiToTkas(0n), "0");
assert.equal(sompiToTkas(100000000n), "1");
assert.equal(sompiToTkas(100000001n), "1.00000001");
assert.equal(sompiToTkas(12345000000n), "123.45");

for (const invalid of ["", "-1", "1.000000001", "abc", "1e2"]) {
  assert.throws(() => decimalTkasToSompi(invalid), /Invalid TKAS decimal amount/);
}

assert.equal(sompiToSafeJsonNumber("9007199254740991"), Number.MAX_SAFE_INTEGER);
assert.throws(
  () => sompiToSafeJsonNumber("9007199254740992"),
  /exceeds JSON safe integer boundary/
);

console.log("Amount tests passed.");
