"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SliderField } from "@/components/tools/fields";
import { Detail, DetailGrid } from "@/components/tools/stats";

const toInt = (ip: string) => {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
    value = value * 256 + Number(part);
  }
  return value;
};
const toIp = (n: number) => [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join(".");
const maskOf = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
const toBinary = (n: number) => [24, 16, 8, 0].map((shift) => ((n >>> shift) & 255).toString(2).padStart(8, "0")).join(".");

/** Accepts "10.0.0.1/24" or "10.0.0.1 255.255.255.0". */
function parse(input: string) {
  const [ipText, maskText = "24"] = input.trim().split(/\s*[/\s]\s*/);
  const ip = toInt(ipText);
  if (ip === null) return null;
  let prefix: number;
  if (/^\d{1,2}$/.test(maskText)) prefix = Number(maskText);
  else {
    const mask = toInt(maskText);
    if (mask === null) return null;
    const bits = mask.toString(2).padStart(32, "0");
    if (!/^1*0*$/.test(bits)) return null; // mask bits must be contiguous
    prefix = bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
  }
  return prefix >= 0 && prefix <= 32 ? { ip, prefix } : null;
}

function classify(ip: number) {
  const first = ip >>> 24;
  const inRange = (base: string, prefix: number) => ((ip & maskOf(prefix)) >>> 0) === toInt(base);
  const type =
    inRange("10.0.0.0", 8) || inRange("172.16.0.0", 12) || inRange("192.168.0.0", 16)
      ? "Private (RFC 1918)"
      : inRange("127.0.0.0", 8)
        ? "Loopback"
        : inRange("169.254.0.0", 16)
          ? "Link-local"
          : inRange("100.64.0.0", 10)
            ? "Carrier-grade NAT"
            : first >= 224 && first <= 239
              ? "Multicast"
              : "Public";
  const cls = first < 128 ? "A" : first < 192 ? "B" : first < 224 ? "C" : first < 240 ? "D" : "E";
  return { type, cls };
}

export default function SubnetCalculator() {
  const [input, setInput] = useState("192.168.1.130/26");
  const [splitPrefix, setSplitPrefix] = useState(28);
  const parsed = parse(input);

  let content = null;
  if (parsed) {
    const { ip, prefix } = parsed;
    const mask = maskOf(prefix);
    const network = (ip & mask) >>> 0;
    const size = 2 ** (32 - prefix);
    const broadcast = (network + size - 1) >>> 0;
    // /31 and /32 have no separate network/broadcast addresses (RFC 3021).
    const firstHost = prefix >= 31 ? network : network + 1;
    const lastHost = prefix >= 31 ? broadcast : broadcast - 1;
    const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : size - 2;
    const { type, cls } = classify(ip);
    const split = Math.max(prefix, splitPrefix);
    const subnetCount = 2 ** (split - prefix);
    const subnetSize = 2 ** (32 - split);

    content = (
      <>
        <DetailGrid>
          <Detail label="Network address" value={`${toIp(network)}/${prefix}`} mono />
          <Detail label="Broadcast address" value={toIp(broadcast)} mono />
          <Detail label="Usable host range" value={`${toIp(firstHost)} – ${toIp(lastHost)}`} mono />
          <Detail label="Usable hosts" value={usable.toLocaleString()} />
          <Detail label="Total addresses" value={size.toLocaleString()} />
          <Detail label="Subnet mask" value={toIp(mask)} mono />
          <Detail label="Wildcard mask" value={toIp(~mask >>> 0)} mono />
          <Detail label="IP class" value={cls} />
          <Detail label="Address type" value={type} />
        </DetailGrid>

        <div className="overflow-x-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs leading-6">
          <p><span className="inline-block w-20 text-muted-foreground">Address</span>{toBinary(ip)}</p>
          <p><span className="inline-block w-20 text-muted-foreground">Mask</span>{toBinary(mask)}</p>
          <p><span className="inline-block w-20 text-muted-foreground">Network</span>{toBinary(network)}</p>
        </div>

        {prefix < 32 && (
          <section className="space-y-3">
            <SliderField
              label="Split into smaller subnets"
              value={split}
              onChange={setSplitPrefix}
              min={prefix}
              max={32}
              format={(v) => `/${v} · ${(2 ** (v - prefix)).toLocaleString()} subnets of ${(2 ** (32 - v)).toLocaleString()} addresses`}
            />
            <div className="max-h-72 overflow-auto rounded-lg border">
              <table className="w-full font-mono text-xs">
                <thead className="sticky top-0 bg-muted text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Subnet</th>
                    <th className="px-3 py-2">Hosts</th>
                    <th className="px-3 py-2">Broadcast</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Array.from({ length: Math.min(subnetCount, 256) }, (_, i) => {
                    const start = network + i * subnetSize;
                    const end = start + subnetSize - 1;
                    return (
                      <tr key={i}>
                        <td className="px-3 py-1.5">{toIp(start)}/{split}</td>
                        <td className="px-3 py-1.5">
                          {split >= 31 ? `${toIp(start)} – ${toIp(end)}` : `${toIp(start + 1)} – ${toIp(end - 1)}`}
                        </td>
                        <td className="px-3 py-1.5">{toIp(end)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {subnetCount > 256 && (
                <p className="p-3 text-center text-xs text-muted-foreground">
                  Showing the first 256 of {subnetCount.toLocaleString()} subnets.
                </p>
              )}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <ToolCard className="max-w-4xl">
      <Field
        label="IP address with prefix or mask"
        htmlFor="subnet-input"
        hint={input && !parsed ? "Use a format like 10.0.0.1/24 or 10.0.0.1 255.255.255.0" : undefined}
      >
        <Input id="subnet-input" value={input} onChange={(e) => setInput(e.target.value)} className="h-11 font-mono text-lg" />
      </Field>
      {content}
    </ToolCard>
  );
}
