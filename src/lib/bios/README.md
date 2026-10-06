# BIOS/UEFI password recovery

Local, offline recovery of forgotten BIOS/UEFI supervisor and power-on
passwords for machines you own or service. You enter the challenge/hash the
firmware shows after too many failed attempts (or the service tag / serial it
prints), the detector picks every compatible algorithm, and each candidate
password is labelled with its BIOS/vendor family.

**Nothing leaves the device.** No challenge, serial number, service tag or
generated password is sent to any server or third-party API — every algorithm
runs locally in the browser (or in Node for the tests).

## Supported families

| Family | Challenge format |
| --- | --- |
| ASUS | 8-digit BIOS date (`2010-02-03` or `03-02-2010`) |
| Dell | service tag / HDD serial + suffix (`595B`, `D35B`, `2A7B`, `A95B`, `1D3B`, `6FF1`, `1F66`, `1F5A`, `BF97`, `E7A8`), and Latitude 3540 |
| Fujitsu-Siemens | 8 / 5×4 hex, 5×4 decimal (old & new), 6×4 decimal, 6×4 `203c-d001` hex |
| HP / Compaq Mini | 10-character code (`CNU1234ABC`) |
| HP (AMI BIOS) | 8 hex digits (`A7AF422F`) |
| HP Insyde | `i` + 8 digits (`i 70412809`) |
| Insyde H2O (generic) | 8 digits |
| Acer Insyde H2O | 10 digits |
| Phoenix (generic, HP/Compaq, FSI models) | 5 decimal digits |
| Samsung | 12–18 hex, and 44 hex |
| Sony | 7-digit serial, and 4×4 (`73KR-3FP9-PVKH-K29R`) |

The "Compaq 5-digit" challenge is handled by the Phoenix HP/Compaq variant.

## Architecture

- `generator.ts` — the common `BiosGenerator` interface every family implements
  (`normalize` → `matches` → `generate`) and the `defineGenerator` helper.
- `generators/*.ts` — one independent module per vendor family.
- `dell/` — the Dell families, kept separate under GPL-3.0 (see below).
- `crypto.ts`, `scancodes.ts` — shared primitives (CRC-16/32/64, SHA-256,
  AES-128, and the IBM-PC keyboard scan-code tables).
- `index.ts` — the registry plus `detect()` (which families match a challenge)
  and `recover()` (run all compatible families, return labelled results).

Adding a family is purely additive: implement a `BiosGenerator` and register it
in `index.ts`.

## Tests

`pnpm test` runs `src/lib/bios/bios.test.ts` with Node's built-in test runner.
The test vectors are the publicly documented example challenge/password pairs
from the sources below, so each implementation is checked against known
behaviour.

## Attribution & licensing

These algorithms are **not original work**. They were reverse-engineered and
published by security researchers. Everything **except `dell/`** is a clean
reimplementation written from the public algorithm descriptions, so that code
ships under this project's own license. The `dell/` subdirectory is different —
see "Dell" below.

- **Dogbert** — "Table of reverse engineered BIOS passwords" and the
  `pwgen-*` scripts that first documented most of these algorithms:
  <http://dogber1.blogspot.com/2009/05/table-of-reverse-engineered-bios.html>
- **`bacher09/pwgen-for-bios`** (the implementation behind bios-pw.org) — used
  only as a reference for algorithm behaviour and for the documented test
  vectors. That project is licensed **GPL-3.0**; none of its source code was
  copied here. <https://github.com/bacher09/pwgen-for-bios>
- Additional contributors credited upstream: **asyncritius** (Dell),
  **let-def** (Acer Insyde 10-digit), **polloloco** (FSI `203c-d001`), **hpgl**.

## Dell (`dell/`) — GPL-3.0

Unlike every other family here, Dell's service-tag encoders (`595B`, `D35B`,
`2A7B`, `A95B`, `1D3B`, `6FF1`, `1F66`, `1F5A`, `BF97`, `E7A8`) and the Latitude
3540 scheme have **no independent published formula** — they exist only as the
intricate reverse-engineered code in `bacher09/pwgen-for-bios`. A faithful
implementation is therefore a port of that code, not a clean reimplementation.

The `dell/` directory is consequently a **port of GPL-3.0 code and is itself
GPL-3.0** (`SPDX-License-Identifier: GPL-3.0-only`, full text in `dell/LICENSE`).
It is deliberately fenced off in its own directory, with a license header in
every file, so its copyleft obligations are contained and obvious. The only
project code it depends on is `../crypto` (SHA-256) and `../generator` (the
interface); nothing outside `dell/` imports from inside it except the one
`...dellGenerators` spread in `index.ts`.

If you need to ship this project under a non-copyleft license, drop the `dell/`
directory and the `dellGenerators` import in `index.ts`; the other nine families
are unaffected.
