/**
 * Tests for the BIOS recovery generators, using the publicly documented example
 * challenge/password pairs from Dogbert's research and the bios-pw project's
 * test suite. Run with:  node --test src/lib/bios/bios.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { asusKeygen, asusGenerator } from "./generators/asus";
import {
  fsiDec24Generator,
  fsiDecNewGenerator,
  fsiDecOldGenerator,
  fsiHex203cGenerator,
  fsiHexGenerator,
} from "./generators/fsi";
import { hpAmiGenerator, hpMiniGenerator } from "./generators/hp";
import {
  acerInsyde10Generator,
  hpInsydeGenerator,
  insydeGenericGenerator,
} from "./generators/insyde";
import { phoenixVariants } from "./generators/phoenix";
import { samsung44HexGenerator, samsungGenerator } from "./generators/samsung";
import { sony4x4Generator, sonyOldGenerator } from "./generators/sony";
import { detect, recover } from "./index";
import type { BiosGenerator } from "./generator";

/** Normalise + generate, the way the detector drives a generator. */
const run = (gen: BiosGenerator, raw: string): string[] => {
  const code = gen.normalize(raw);
  return gen.matches(code) ? gen.generate(code) : [];
};

test("ASUS date keygen", () => {
  assert.equal(asusKeygen(2007, 2, 1), "AA19BALA");
  assert.equal(asusKeygen(2017, 10, 12), "AABABLAL");
  assert.equal(asusKeygen(2020, 9, 15), "LBD9DBA1");
  assert.equal(asusKeygen(2012, 3, 29), "AOBOBL2B");
  assert.equal(asusKeygen(2002, 1, 2), "ALAA4ABA");
});

test("ASUS solver accepts ymd and dmy, rejects bad dates", () => {
  assert.deepEqual(run(asusGenerator, "2007-02-01"), ["AA19BALA"]);
  assert.deepEqual(run(asusGenerator, "01-02-2007"), ["AA19BALA"]);
  assert.deepEqual(run(asusGenerator, "01022007"), ["AA19BALA"]);
  assert.deepEqual(run(asusGenerator, "41022007"), []);
});

test("Fujitsu-Siemens hexadecimal", () => {
  assert.deepEqual(run(fsiHexGenerator, "1234-4321-1234-4321-1234"), ["35683789"]);
  assert.deepEqual(run(fsiHexGenerator, "AAAA-BBBB-CCCC-DEAD-BEEF"), ["64830592"]);
  assert.deepEqual(run(fsiHexGenerator, "AAAABBBBCCCCDEADBEEF"), ["64830592"]);
  assert.deepEqual(run(fsiHexGenerator, "DEADBEEF"), ["64830592"]);
  assert.deepEqual(run(fsiHexGenerator, "AAAA-BBBB-CCCC-DEAD-CODE"), []);
});

test("Fujitsu-Siemens 5x4 decimal new", () => {
  assert.deepEqual(run(fsiDecNewGenerator, "1234-4321-1234-4321-1234"), ["7122790"]);
  assert.deepEqual(run(fsiDecNewGenerator, "7234-4321-1234-4321-1234"), ["3122790"]);
});

test("Fujitsu-Siemens 5x4 decimal old", () => {
  assert.deepEqual(run(fsiDecOldGenerator, "1234-4321-1234-4321-1234"), ["10cphf0b"]);
  assert.deepEqual(run(fsiDecOldGenerator, "7234-4321-1234-4321-1234"), ["90ldhf0b"]);
});

test("Fujitsu-Siemens 6x4 decimal", () => {
  assert.deepEqual(run(fsiDec24Generator, "8F16-1234-4321-1234-4321-1234"), ["sjqtka8l"]);
  assert.deepEqual(run(fsiDec24Generator, "1234-7234-4321-1234-4321-1234"), ["smqtkaa5"]);
});

test("Fujitsu-Siemens 6x4 hex (203c-d001)", () => {
  assert.deepEqual(run(fsiHex203cGenerator, "203c-d001-0000-001d-e960-227d"), ["494eab7c"]);
  assert.deepEqual(run(fsiHex203cGenerator, "203c-d001-4f30-609d-5125-646a"), ["66b14918"]);
  assert.deepEqual(run(fsiHex203cGenerator, "203C-D001-4F30-609D-5125-646a"), ["66b14918"]);
});

test("HP/Compaq Mini", () => {
  assert.deepEqual(run(hpMiniGenerator, "CNU1234ABC"), ["e9l37fvcpe"]);
  assert.deepEqual(run(hpMiniGenerator, "CNU1234567"), ["e9l37fvqgx"]);
  assert.deepEqual(run(hpMiniGenerator, "CNU1234ABX").sort(), ["e9l37fvcp4", "e9l37fvcpr"].sort());
});

test("HP AMI", () => {
  assert.deepEqual(run(hpAmiGenerator, "A7AF422F"), ["49163252"]);
  assert.deepEqual(run(hpAmiGenerator, "12345678"), ["2ae211b4"]);
  assert.deepEqual(run(hpAmiGenerator, "48A02676"), ["27545092"]);
  assert.deepEqual(run(hpAmiGenerator, "B60BD282"), ["489b5bf9"]);
  assert.deepEqual(run(hpAmiGenerator, "757EDC82"), ["edfe2edd"]);
  assert.deepEqual(run(hpAmiGenerator, "7d94422f"), ["e4eea2c4"]);
});

test("Insyde H2O generic", () => {
  assert.deepEqual(run(insydeGenericGenerator, "12345678"), ["03023278", "16503512"]);
  assert.deepEqual(run(insydeGenericGenerator, "03133610"), ["12891236", "24094120", "99534862"]);
  assert.equal(run(insydeGenericGenerator, "87654321")[0], "38732907");
});

test("Acer Insyde 10-digit", () => {
  const vectors: Array<[string, string]> = [
    ["0173549286", "e0eac38fdfcfd74a"],
    ["1014206418", "3c0a50907bc2c604"],
    ["1765418418", "5f54e355b83e969c"],
    ["1858408509", "c4791532114cfbab"],
    ["2051611322", "1c648cb56e8a64bb"],
    ["1355047683", "7fe913d78ffc5ed1"],
    ["2025088185", "018261c3cbe60945"],
  ];
  for (const [challenge, expected] of vectors) {
    assert.deepEqual(run(acerInsyde10Generator, challenge), [expected], challenge);
  }
});

test("HP Insyde \"i\" codes", () => {
  assert.equal(run(hpInsydeGenerator, "i 70412809")[0], "47283646");
  assert.equal(run(hpInsydeGenerator, "I 62996480")[0], "55507825");
  assert.equal(run(hpInsydeGenerator, "i  51120876")[0], "66775639");
  assert.equal(run(hpInsydeGenerator, "I 59170869")[1], "46858269");
  assert.deepEqual(run(hpInsydeGenerator, "51120876"), []);
});

test("Samsung 12-18 hex", () => {
  assert.deepEqual(run(samsungGenerator, "07088120410C0000"), ["12345"]);
  assert.deepEqual(run(samsungGenerator, "07088120410C"), ["12345"]);
  assert.deepEqual(run(samsungGenerator, "1AA9CD4638C0186000"), ["5728000"]);
  assert.deepEqual(run(samsungGenerator, "1AA9CD4638C0186001"), ["5728000@"]);
});

test("Samsung 44 hex", () => {
  const vectors: Array<[string, string]> = [
    ["59F72F85239CC9DB6239DEDDC5C4CDB43A37D5533003", "justin"],
    ["DF6E02658349EC455407A5CD60666AC01B26C0465004", "20160530"],
    ["54574AAD6A8B1B9353F6FA66DCD2DA91B06DBD8E3204", "tokadmin"],
    ["B6C5525D15BCA963277178ED150EA3A968994698B382", "12345"],
    ["2d2fb35c18b2b4846f1f989846036e6ca968e4c87005", "2945670211"],
  ];
  for (const [challenge, expected] of vectors) {
    assert.deepEqual(run(samsung44HexGenerator, challenge), [expected], challenge);
  }
  assert.deepEqual(run(samsung44HexGenerator, "B6C5525D15BCA963277178ED150EA3A968994698B38"), []);
});

test("Sony old 7-digit", () => {
  assert.deepEqual(run(sonyOldGenerator, "1234567"), ["9648669"]);
  assert.deepEqual(run(sonyOldGenerator, "123"), []);
});

test("Sony 4x4", () => {
  assert.deepEqual(run(sony4x4Generator, "73KR-3FP9-PVKH-K29R"), ["32799624"]);
  assert.deepEqual(run(sony4x4Generator, "9DPK73KR8JHXF3RT"), ["54746568"]);
  assert.deepEqual(run(sony4x4Generator, "K29RPVKH3FP973KR"), ["65395983"]);
  assert.deepEqual(run(sony4x4Generator, "73KR-3FP9-PVKH-K29C"), []);
});

test("Phoenix variants produce a password that hashes back to the challenge", () => {
  for (const { generator, calculateHash } of phoenixVariants) {
    const [password] = run(generator, "12345");
    assert.ok(password, `${generator.id} returned no password`);
    assert.equal(calculateHash(password), 12345, generator.id);
  }
});

test("Phoenix known-password hashes", () => {
  const byId = Object.fromEntries(phoenixVariants.map((v) => [v.generator.id, v]));
  assert.equal(byId["phoenix-generic"].calculateHash("abstoou"), 12345);
  assert.equal(byId["phoenix-hp-compaq"].calculateHash("vnflm"), 12345);
  assert.equal(byId["phoenix-fsi"].calculateHash("411113"), 12345);
  assert.equal(byId["phoenix-fsi-l"].calculateHash("362153"), 12345);
  assert.equal(byId["phoenix-fsi-x"].calculateHash("739979"), 12345);
});

test("detector selects compatible families and recover() labels them", () => {
  const detected = detect("73KR-3FP9-PVKH-K29R").map((g) => g.id);
  assert.ok(detected.includes("sony-4x4"));

  const results = recover("1234567");
  assert.ok(results.some((r) => r.generator.id === "sony-old" && r.passwords.includes("9648669")));

  // An 8-digit code is ambiguous and should surface more than one family.
  const ambiguous = recover("12345678");
  assert.ok(ambiguous.length >= 2);
  assert.ok(ambiguous.every((r) => r.generator.vendor && r.passwords.length > 0));
});
