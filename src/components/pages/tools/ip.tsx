"use client";

import { useEffect, useState } from "react";
import { Clipboard, Globe, MapPin, Radio } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type IPInfo = {
  ip: string;
  city: string;
  region: string;
  postal: string;
  country_name: string;
  country_code: string;
  country_capital: string;
  continent_code: string;
  timezone: string;
  currency: string;
  org: string;
  asn: string;
};

type AddressState = {
  ip: string | null;
  org: string;
  asn: string;
  loading: boolean;
};

const IPV4_URL = "https://api.ipify.org/?format=json";
const IPV6_URL = "https://api64.ipify.org/?format=json";
const GEO_URL = "https://ipapi.co/json/";

const EMPTY_ADDRESS: AddressState = {
  ip: null,
  org: "",
  asn: "",
  loading: true,
};

const isIPv6 = (ip: string) => ip.includes(":");

async function fetchIp(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.ip === "string" ? data.ip : null;
  } catch (error) {
    console.error("Failed to fetch IP:", error);
    return null;
  }
}

async function fetchGeo(): Promise<IPInfo | null> {
  try {
    const res = await fetch(GEO_URL);
    if (!res.ok) return null;
    return (await res.json()) as IPInfo;
  } catch (error) {
    console.error("Failed to fetch IP info:", error);
    return null;
  }
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium wrap-break-word">
        {value && value !== "N/A" ? value : "—"}
      </p>
    </div>
  );
}

function AddressPanel({
  version,
  state,
  onCopy,
}: {
  version: "IPv4" | "IPv6";
  state: AddressState;
  onCopy: (version: string, ip: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          className="font-mono text-[11px] tracking-wider"
        >
          {version}
        </Badge>
        {state.ip && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onCopy(version, state.ip!)}
            title={`Copy ${version} address`}
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        )}
      </div>

      {state.loading ? (
        <div className="flex h-7 items-center">
          <Spinner className="h-5 w-5" size="small" show={true} />
        </div>
      ) : state.ip ? (
        <>
          <p className="font-mono text-lg font-semibold break-all text-primary sm:text-xl">
            {state.ip}
          </p>
          <p className="text-xs text-muted-foreground wrap-break-word">
            {state.org || "Unknown network"}
            {state.asn ? ` · ${state.asn}` : ""}
          </p>
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-muted-foreground">
            Unavailable
          </p>
          <p className="text-xs text-muted-foreground">
            No {version} connection detected on your network.
          </p>
        </div>
      )}
    </div>
  );
}

export default function IPInfoCard() {
  const [geo, setGeo] = useState<IPInfo | null>(null);
  const [ipv4, setIpv4] = useState<AddressState>(EMPTY_ADDRESS);
  const [ipv6, setIpv6] = useState<AddressState>(EMPTY_ADDRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function getIps() {
      const [v4, dual, info] = await Promise.all([
        fetchIp(IPV4_URL),
        fetchIp(IPV6_URL),
        fetchGeo(),
      ]);
      if (!active) return;

      const network = { org: info?.org ?? "", asn: info?.asn ?? "" };
      setGeo(info);
      setIpv4({ ...network, ip: v4, loading: false });
      setIpv6({
        ...network,
        ip: dual && isIPv6(dual) ? dual : null,
        loading: false,
      });
      setLoading(false);
    }

    getIps();
    return () => {
      active = false;
    };
  }, []);

  const copyIP = (version: string, ip: string) => {
    navigator.clipboard.writeText(ip);
    toast(`${version} Copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <AddressPanel version="IPv4" state={ipv4} onCopy={copyIP} />
            <AddressPanel version="IPv6" state={ipv6} onCopy={copyIP} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const primary = geo;
  const location = [primary?.city, primary?.region].filter(Boolean).join(", ");

  return (
    <div className="mt-10 flex flex-col items-center animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            {primary?.country_code && (
              <img
                src={`https://flagcdn.com/48x36/${primary.country_code.toLowerCase()}.png`}
                alt={primary.country_name}
                width={40}
                height={30}
                className=""
              />
            )}
            <div>
              <h2 className="text-2xl font-semibold">
                {primary?.country_name ?? "Unknown location"}
              </h2>
              {location && (
                <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AddressPanel version="IPv4" state={ipv4} onCopy={copyIP} />
            <AddressPanel version="IPv6" state={ipv6} onCopy={copyIP} />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Detail label="ISP" value={primary?.org} />
            <Detail label="ASN" value={primary?.asn} />
            <Detail label="Timezone" value={primary?.timezone} />
            <Detail label="Postal Code" value={primary?.postal} />
            <Detail label="Capital" value={primary?.country_capital} />
            <Detail label="Currency" value={primary?.currency} />
          </div>
        </CardContent>
      </Card>
      <a
        href="https://ip.parcoil.com"
        className="mt-5 text-sm text-muted-foreground hover:underline"
      >
        try ip.parcoil.com for quicker access
      </a>
    </div>
  );
}
