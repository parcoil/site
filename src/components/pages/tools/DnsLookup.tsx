"use client";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker } from "@/components/tools/fields";

const TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "CAA"] as const;
const TYPE_NAMES: Record<number, string> = { 1: "A", 2: "NS", 5: "CNAME", 6: "SOA", 15: "MX", 16: "TXT", 28: "AAAA", 33: "SRV", 65: "HTTPS", 257: "CAA" };
const STATUS: Record<number, string> = { 1: "Format error", 2: "Server failure", 3: "Domain does not exist (NXDOMAIN)", 5: "Query refused" };

const RESOLVERS = {
  cloudflare: { label: "Cloudflare", url: (name: string, type: string) => `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}` },
  google: { label: "Google", url: (name: string, type: string) => `https://dns.google/resolve?name=${name}&type=${type}` },
};
type Resolver = keyof typeof RESOLVERS;

type DnsRecord = { name: string; type: string; ttl: number; data: string };

function cleanDomain(input: string) {
  return input
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .split(/[/?#]/)[0]
    .replace(/\.$/, "")
    .toLowerCase();
}

function formatTtl(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

async function query(resolver: Resolver, name: string, type: string): Promise<DnsRecord[]> {
  const response = await fetch(RESOLVERS[resolver].url(encodeURIComponent(name), type), {
    headers: { accept: "application/dns-json" },
  });
  if (!response.ok) throw new Error(`The resolver returned HTTP ${response.status}.`);
  const json = await response.json();
  if (json.Status && json.Status !== 0) throw new Error(STATUS[json.Status] ?? `DNS error ${json.Status}`);
  return (json.Answer ?? []).map((a: { name: string; type: number; TTL: number; data: string }) => ({
    name: a.name.replace(/\.$/, ""),
    type: TYPE_NAMES[a.type] ?? String(a.type),
    ttl: a.TTL,
    data: a.data.replace(/^"|"$/g, "").replace(/" "/g, ""),
  }));
}

export default function DnsLookup() {
  const [domain, setDomain] = useState("parcoil.com");
  const [type, setType] = useState<"ALL" | (typeof TYPES)[number]>("ALL");
  const [resolver, setResolver] = useState<Resolver>("cloudflare");
  const [records, setRecords] = useState<DnsRecord[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    const name = cleanDomain(domain);
    if (!name) return;
    setLoading(true);
    setError("");
    try {
      const types = type === "ALL" ? TYPES : [type];
      const results = await Promise.allSettled(types.map((t) => query(resolver, name, t)));
      const rejected = results.find((r) => r.status === "rejected");
      const found = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      // Deduplicate (CNAME chains repeat across queries).
      const unique = [...new Map(found.map((r) => [`${r.type}|${r.name}|${r.data}`, r])).values()];
      if (unique.length === 0 && rejected) throw (rejected as PromiseRejectedResult).reason;
      setRecords(unique);
    } catch (e) {
      setRecords(null);
      setError(e instanceof Error ? e.message : "Lookup failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolCard>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
      >
        <Field label="Domain" htmlFor="dns-domain" className="flex-1">
          <Input id="dns-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="h-11 font-mono" />
        </Field>
        <Button type="submit" size="lg" className="h-11" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Search />} Look up
        </Button>
      </form>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Field label="Record type">
          <OptionPicker
            value={type}
            onChange={setType}
            options={[{ value: "ALL", label: "All" }, ...TYPES.map((t) => ({ value: t, label: t }))]}
          />
        </Field>
        <Field label="Resolver">
          <OptionPicker
            value={resolver}
            onChange={setResolver}
            options={(Object.keys(RESOLVERS) as Resolver[]).map((r) => ({ value: r, label: RESOLVERS[r].label }))}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {records && (
        records.length === 0 ? (
          <p className="text-muted-foreground">No {type === "ALL" ? "" : `${type} `}records found for {cleanDomain(domain)}.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">TTL</th>
                  <th className="px-3 py-2">Value</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-semibold text-primary">{r.type}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.name}</td>
                    <td className="px-3 py-2 text-muted-foreground" title={`${r.ttl} seconds`}>{formatTtl(r.ttl)}</td>
                    <td className="px-3 py-2 font-mono text-xs break-all">{r.data}</td>
                    <td className="px-2 py-1">
                      <CopyButton value={r.data} variant="ghost" className="h-7 w-7" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </ToolCard>
  );
}
