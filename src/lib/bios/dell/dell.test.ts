/*
 * Tests for the Dell generators, using the documented example challenge/
 * password pairs from the bios-pw (pwgen-for-bios) test suite.
 * Run with:  node --import ./scripts/ts-extensionless-resolver.mjs --test src/lib/bios/dell/dell.test.ts
 *
 * SPDX-License-Identifier: GPL-3.0-only
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  dellHddGenerator,
  dellHddOldGenerator,
  dellLatitude3540Generator,
  dellServiceTagGenerator,
} from "./index";
import { keygenDell } from "./keygen";
import { DellTag, SuffixType } from "./types";
import { recover } from "../index";
import type { BiosGenerator } from "../generator";

const run = (gen: BiosGenerator, raw: string): string[] => {
  const code = gen.normalize(raw);
  return gen.matches(code) ? gen.generate(code) : [];
};

test("Dell service-tag keygen covers every tag", () => {
  const st = SuffixType.ServiceTag;
  assert.deepEqual(keygenDell("1234567", DellTag.Tag595B, st), ["46rg65ky"]);
  assert.deepEqual(keygenDell("1234567", DellTag.TagD35B, st), ["5tc8q9re"]);
  assert.deepEqual(keygenDell("1234567", DellTag.Tag2A7B, st), ["J1KuwWpSUgnDarfi"]);
  assert.deepEqual(keygenDell("1234567", DellTag.TagA95B, st), ["46rg65ky"]);
  assert.deepEqual(keygenDell("1234567", DellTag.Tag1D3B, st), ["Sn4fkF8bS57NymZl"]);
  assert.deepEqual(keygenDell("1234567", DellTag.Tag1F66, st), ["kIpTBzx0m3s10JDR"]);
  assert.deepEqual(keygenDell("1234567", DellTag.Tag6FF1, st), ["Rzn1wGe555H5bM2r"]);
  assert.deepEqual(keygenDell("1234567", DellTag.Tag1F5A, st), ["2ls2b8GiP9H032kx"]);
  assert.deepEqual(keygenDell("1234567", DellTag.TagBF97, st), ["2r09GZhU[r0kW2zr"]);
  assert.deepEqual(
    keygenDell("1234567", DellTag.TagE7A8, st).sort(),
    ["Qk3LkU22kPeyq2jd", "rLIqjUy59IG2JU2R"].sort(),
  );
});

test("Dell service-tag keygen with varied serials", () => {
  const st = SuffixType.ServiceTag;
  assert.deepEqual(keygenDell("OPENSRC", DellTag.Tag1D3B, st), ["S3yJ91q0Gar3O72I"]);
  assert.deepEqual(keygenDell("7G9C0G2", DellTag.Tag6FF1, st), ["35c0b0tVb32Z6ivD"]);
  assert.deepEqual(keygenDell("DELLSUX", DellTag.Tag1F66, st), ["qHXaL0ntli6Gu4c0"]);
  assert.deepEqual(keygenDell("ABCDEFG", DellTag.Tag1F5A, st), ["x2zL5n7jj2Gl2TIh"]);
  assert.deepEqual(keygenDell("DELLSUX", DellTag.TagBF97, st), ["rrNM2LrbD8nGsd2P"]);
  assert.ok(keygenDell("9M2JTG2", DellTag.TagE7A8, st).includes("J2yR66N1kdn2N17m"));
});

test("Dell HDD keygen covers tags", () => {
  const hdd = SuffixType.HDD;
  assert.deepEqual(keygenDell("1234567890A", DellTag.Tag595B, hdd), ["nyoap4lq"]);
  assert.deepEqual(keygenDell("1234567890A", DellTag.TagD35B, hdd), ["dc14blrd"]);
  assert.deepEqual(keygenDell("1234567890A", DellTag.Tag2A7B, hdd), ["h6lwdi91qluUyt3u"]);
  assert.deepEqual(keygenDell("1234567890A", DellTag.TagA95B, hdd), ["qr0s6x4n"]);
});

test("Dell service-tag generator", () => {
  assert.deepEqual(run(dellServiceTagGenerator, "1234567-595B"), ["46rg65ky"]);
  assert.deepEqual(run(dellServiceTagGenerator, "1234567-1f66"), ["kIpTBzx0m3s10JDR"]);
  assert.deepEqual(run(dellServiceTagGenerator, "1234567-BAD1"), []);
  assert.deepEqual(run(dellServiceTagGenerator, "1234567-TOLONG"), []);
});

test("Dell HDD generators", () => {
  assert.deepEqual(run(dellHddGenerator, "1234567890A-595b"), ["nyoap4lq"]);
  assert.deepEqual(run(dellHddOldGenerator, "12345678901"), ["yyyyyhnn"]);
});

test("Dell Latitude 3540 generator", () => {
  assert.deepEqual(run(dellLatitude3540Generator, "5F3988D5E0ACE4BF-7QH8602"), ["98072364"]);
  assert.deepEqual(run(dellLatitude3540Generator, "5F3988D5E0ACE4bF-7QH8602"), ["98072364"]);
});

test("recover() surfaces Dell families through the registry", () => {
  const serviceTag = recover("1234567-595B");
  assert.ok(
    serviceTag.some((r) => r.generator.id === "dell-service-tag" && r.passwords.includes("46rg65ky")),
  );
  const latitude = recover("5F3988D5E0ACE4BF-7QH8602");
  assert.ok(
    latitude.some((r) => r.generator.id === "dell-latitude-3540" && r.passwords.includes("98072364")),
  );
});
