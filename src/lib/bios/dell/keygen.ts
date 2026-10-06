/*
 * Dell BIOS master-password generators — core keygen logic.
 *
 * Ported from bacher09/pwgen-for-bios (GPL-3.0), with the upstream `makeSolver`
 * wrappers removed (the BiosGenerator wrappers live in ./index.ts) and the
 * upstream `Sha256` class call replaced by this project's `sha256()` helper.
 * See ./LICENSE and ./types.ts. Research by Dogbert, hpgl and asyncritius.
 *
 * SPDX-License-Identifier: GPL-3.0-only
 */
/* eslint-disable no-bitwise */
import { sha256 } from "../crypto";
import { blockEncode, TagE7A8Encoder, TagE7A8EncoderSecond } from "./encode";
import { DellTag, SuffixType } from "./types";

const scanCodes =
  "\0\x1B1234567890-=\x08\x09qwertyuiop[]\x0D\xFFasdfghjkl;'`\xFF\\zxcvbnm,./";

const encscans: number[] = [
  0x05, 0x10, 0x13, 0x09, 0x32, 0x03, 0x25, 0x11, 0x1f, 0x17, 0x06, 0x15,
  0x30, 0x19, 0x26, 0x22, 0x0a, 0x02, 0x2c, 0x2f, 0x16, 0x14, 0x07, 0x18,
  0x24, 0x23, 0x31, 0x20, 0x1e, 0x08, 0x2d, 0x21, 0x04, 0x0b, 0x12, 0x2e,
];

const asciiPrintable = "012345679abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0";

const extraCharacters: { readonly [P in DellTag]?: string } = {
  "2A7B": asciiPrintable,
  "1F5A": asciiPrintable,
  "1D3B": "0BfIUG1kuPvc8A9Nl5DLZYSno7Ka6HMgqsJWm65yCQR94b21OTp7VFX2z0jihE33d4xtrew0",
  "1F66": "0ewr3d4xtUG1ku0BfIp7VFb21OTSno7KDLZYqsJWa6HMgCQR94m65y9Nl5Pvc8AjihE3X2z0",
  "6FF1": "08rptBxfbGVMz38IiSoeb360MKcLf4QtBCbWVzmH5wmZUcRR5DZG2xNCEv1nFtzsZB2bw1X0",
  BF97: "0Q2drGk99rkQFMxN[Z5y3DGr16h638myIL2rzz2pzcU7JWLJ1EGnqRN4seZPRM2aBXIjbkGZ",
};

/*
 * Depends only on the first two chars. Input: 11 symbols.
 */
export function keygenHddOld(serial: string): string {
  const serialArr: number[] = serial.split("").map((c) => c.charCodeAt(0));
  const ret: number[] = [49, 49, 49, 49, 49];
  ret.push(serialArr[1] >> 1);
  ret.push((serialArr[1] >> 6) | (serialArr[0] << 2));
  ret.push(serialArr[0] >> 3);
  for (let i = 0; i < 8; i++) {
    let r = 0xaa;
    if (ret[i] & 8) {
      r ^= serialArr[1];
    }
    if (ret[i] & 16) {
      r ^= serialArr[0];
    }
    ret[i] = encscans[r % encscans.length];
  }
  return ret.map((c) => scanCodes.charAt(c)).join("");
}

export function calculateSuffix(serial: number[], tag: DellTag, type: SuffixType): number[] {
  const suffix: number[] = [];
  let codesTable: number[];
  let arr1: number[];
  let arr2: number[];

  if (type === SuffixType.ServiceTag) {
    arr1 = [1, 2, 3, 4];
    arr2 = [4, 3, 2];
  } else {
    // SuffixType.HDD
    arr1 = [1, 10, 9, 8];
    arr2 = [8, 9, 10];
  }

  suffix[0] = serial[arr1[3]];
  suffix[1] = (serial[arr1[3]] >> 5) | (((serial[arr1[2]] >> 5) | (serial[arr1[2]] << 3)) & 0xf1);
  suffix[2] = serial[arr1[2]] >> 2;
  suffix[3] = (serial[arr1[2]] >> 7) | (serial[arr1[1]] << 1);
  suffix[4] = (serial[arr1[1]] >> 4) | (serial[arr1[0]] << 4);
  suffix[5] = serial[1] >> 1;
  suffix[6] = (serial[1] >> 6) | (serial[0] << 2);
  suffix[7] = serial[0] >> 3;

  // normalize bytes
  suffix.forEach((v, i) => {
    suffix[i] = v & 0xff;
  });

  const table = extraCharacters[tag];
  if (table !== undefined) {
    codesTable = table.split("").map((s) => s.charCodeAt(0));
  } else {
    codesTable = encscans;
  }

  for (let i = 0; i < 8; i++) {
    let r = 0xaa;
    if (suffix[i] & 1) {
      r ^= serial[arr2[0]];
    }
    if (suffix[i] & 2) {
      r ^= serial[arr2[1]];
    }
    if (suffix[i] & 4) {
      r ^= serial[arr2[2]];
    }
    if (suffix[i] & 8) {
      r ^= serial[1];
    }
    if (suffix[i] & 16) {
      r ^= serial[0];
    }

    suffix[i] = codesTable[r % codesTable.length];
  }

  return suffix;
}

function resultToString(arr: number[] | Uint8Array, tag: DellTag): string {
  const r = arr[0] % 9;
  let result = "";
  const table = extraCharacters[tag];
  for (let i = 0; i < 16; i++) {
    if (table !== undefined) {
      result += table.charAt(arr[i] % table.length);
    } else if (r <= i && result.length < 8) {
      // 595B, D35B, A95B
      result += scanCodes.charAt(encscans[arr[i] % encscans.length]);
    }
  }
  return result;
}

/*
 * 7 symbols + 4 symbols (595B, D35B, 2A7B, A95B, 1D3B etc.)
 * serial -- serial number without tag, 7 symbols for ServiceTag, 11 for HDD
 * tag    -- tag string
 */
export function keygenDell(serial: string, tag: DellTag, type: SuffixType): string[] {
  let fullSerial: string;
  let encBlock: number[];

  function byteArrayToInt(arr: number[]): number[] {
    // convert byte array to 32-bit little-endian int array
    const resultLength = arr.length >> 2;
    const result: number[] = [];
    for (let i = 0; i <= resultLength; i++) {
      result[i] = arr[i * 4] | (arr[i * 4 + 1] << 8) | (arr[i * 4 + 2] << 16) | (arr[i * 4 + 3] << 24) | 0;
    }
    return result;
  }

  function intArrayToByte(arr: number[]): number[] {
    const result: number[] = [];
    arr.forEach((num) => {
      result.push(num & 0xff);
      result.push((num >> 8) & 0xff);
      result.push((num >> 16) & 0xff);
      result.push((num >> 24) & 0xff);
    });
    return result;
  }

  function calculateE7A8(block: number[], klass: { encode(data: number[]): number[] }): string {
    const table = "Q92G0drk9y63r5DG1hLqJGW1EnRk[QxrFMNZ328I6myLr4MsPNeZR2z72czpzUJBGXbaIjkZ";
    const res = intArrayToByte(klass.encode(block));
    const out = sha256(Uint8Array.from(res));
    let outStr = "";
    for (let i = 0; i < 16; i++) {
      outStr += table[(out[i + 16] + out[i]) % table.length];
    }
    return outStr;
  }

  if (tag === DellTag.TagA95B) {
    if (type === SuffixType.ServiceTag) {
      fullSerial = serial + DellTag.Tag595B;
    } else {
      // HDD
      fullSerial = serial.slice(3) + "\0\0\0" + DellTag.Tag595B;
    }
  } else {
    fullSerial = serial + tag;
  }

  let fullSerialArray: number[] = [];
  for (let i = 0; i < fullSerial.length; i++) {
    fullSerialArray.push(fullSerial.charCodeAt(i));
  }
  if (tag === DellTag.TagE7A8) {
    encBlock = byteArrayToInt(fullSerialArray);
    for (let i = 0; i < 16; i++) {
      if (encBlock[i] === undefined) {
        encBlock[i] = 0;
      }
    }
    const outStr1 = calculateE7A8(encBlock, TagE7A8Encoder);
    const outStr2 = calculateE7A8(encBlock, TagE7A8EncoderSecond);
    const output = [];
    if (outStr1) {
      output.push(outStr1);
    }
    if (outStr2) {
      output.push(outStr2);
    }
    return output;
  }

  fullSerialArray = fullSerialArray.concat(calculateSuffix(fullSerialArray, tag, type));
  const cnt = 23;
  fullSerialArray[cnt] = 0x80;
  encBlock = byteArrayToInt(fullSerialArray);
  for (let i = 0; i < 16; i++) {
    if (encBlock[i] === undefined) {
      encBlock[i] = 0;
    }
  }
  encBlock[14] = cnt << 3;
  const decodedBytes = intArrayToByte(blockEncode(encBlock, tag));
  const outputResult = resultToString(decodedBytes, tag);
  return outputResult ? [outputResult] : [];
}

export function isDellTag(tag: string): boolean {
  const upper = tag.toUpperCase();
  for (const key in DellTag) {
    if (upper === DellTag[key as keyof typeof DellTag]) {
      return true;
    }
  }
  return false;
}
