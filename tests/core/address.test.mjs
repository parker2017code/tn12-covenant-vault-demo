import assert from "node:assert/strict";
import {
  assertSameTn12Address,
  assertTn12Address,
  isTn12Address,
  validateKaspaAddress,
  validateTn12Address
} from "../../src/validation/address.mjs";

const validTn12 = "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt";
const validMainnet = "kaspa:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd2tnh3tr20";

assert.equal(validateTn12Address(validTn12).ok, true);
assert.equal(validateTn12Address(validTn12).prefix, "kaspatest");
assert.equal(isTn12Address(validTn12), true);
assert.equal(assertTn12Address(validTn12), validTn12);
assert.equal(assertSameTn12Address(validTn12, validTn12), validTn12);

assert.equal(validateTn12Address("").ok, false);
assert.equal(validateTn12Address("kaspatest:").ok, false);
assert.equal(validateTn12Address("kaspatest:not-a-real-address").ok, false);
assert.equal(validateTn12Address(validTn12.replace(/.$/, "l")).ok, false);
assert.equal(validateTn12Address(validMainnet).ok, false);
assert.equal(validateKaspaAddress(validMainnet).ok, true);

assert.throws(
  () => assertTn12Address(validMainnet, "Wallet address"),
  /valid TN12\/testnet kaspatest address/
);
assert.throws(
  () => assertSameTn12Address(validTn12, "kaspatest:qqqq"),
  /right side must be a valid TN12\/testnet kaspatest address/
);

console.log("Address tests passed.");
