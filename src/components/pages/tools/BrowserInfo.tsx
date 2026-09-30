"use client";
import { useEffect, useState } from "react";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Detail, DetailGrid } from "@/components/tools/stats";

type UADataValues = { platform?: string; platformVersion?: string; model?: string; architecture?: string };
type NavigatorUAData = { mobile: boolean; getHighEntropyValues: (hints: string[]) => Promise<UADataValues> };

function parseBrowser(ua: string) {
  const match = (re: RegExp) => re.exec(ua)?.[1];
  if (/Edg\//.test(ua)) return `Edge ${match(/Edg\/([\d.]+)/)}`;
  if (/OPR\//.test(ua)) return `Opera ${match(/OPR\/([\d.]+)/)}`;
  if (/SamsungBrowser/.test(ua)) return `Samsung Internet ${match(/SamsungBrowser\/([\d.]+)/)}`;
  if (/Firefox\//.test(ua)) return `Firefox ${match(/Firefox\/([\d.]+)/)}`;
  if (/FxiOS/.test(ua)) return `Firefox ${match(/FxiOS\/([\d.]+)/)}`;
  if (/CriOS/.test(ua)) return `Chrome ${match(/CriOS\/([\d.]+)/)}`;
  if (/Chrome\//.test(ua)) return `Chrome ${match(/Chrome\/([\d.]+)/)}`;
  if (/Safari\//.test(ua)) return `Safari ${match(/Version\/([\d.]+)/) ?? ""}`.trim();
  return "Unknown";
}

function parseOs(ua: string) {
  if (/Windows NT 10/.test(ua)) return "Windows 10 or 11";
  if (/Windows NT/.test(ua)) return `Windows NT ${/Windows NT ([\d.]+)/.exec(ua)?.[1]}`;
  if (/iPhone|iPad|iPod/.test(ua)) return `iOS ${/OS ([\d_]+)/.exec(ua)?.[1]?.replace(/_/g, ".") ?? ""}`.trim();
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return `Android ${/Android ([\d.]+)/.exec(ua)?.[1] ?? ""}`.trim();
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function gpuName() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return undefined;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  } catch {
    return undefined;
  }
}

type Info = Record<string, Record<string, string | undefined>>;

function collect(): Info {
  const ua = navigator.userAgent;
  const dpr = window.devicePixelRatio;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const media = (q: string) => window.matchMedia(q).matches;
  return {
    Browser: {
      Browser: parseBrowser(ua),
      "Operating system": parseOs(ua),
      "Device type": /Mobi|Android|iPhone/.test(ua) ? "Mobile" : /iPad|Tablet/.test(ua) ? "Tablet" : "Desktop",
      Language: navigator.languages?.join(", ") || navigator.language,
      "Time zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      Cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
    },
    Screen: {
      "Screen resolution": `${screen.width} × ${screen.height}`,
      "Physical pixels": `${Math.round(screen.width * dpr)} × ${Math.round(screen.height * dpr)}`,
      "Browser window": `${window.innerWidth} × ${window.innerHeight}`,
      "Pixel ratio": `${dpr}x`,
      "Color depth": `${screen.colorDepth}-bit`,
      Orientation: screen.orientation?.type.replace("-primary", "").replace("-secondary", " (flipped)"),
      "Color scheme": media("(prefers-color-scheme: dark)") ? "Dark" : "Light",
      HDR: media("(dynamic-range: high)") ? "Supported" : "Not detected",
    },
    Hardware: {
      "CPU threads": navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : undefined,
      Memory: nav.deviceMemory ? `${nav.deviceMemory} GB or more` : undefined,
      GPU: gpuName(),
      "Touch points": String(navigator.maxTouchPoints),
    },
  };
}

export default function BrowserInfo() {
  const [collected, setCollected] = useState<Info | null>(null);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [ua, setUa] = useState("");

  useEffect(() => {
    setUa(navigator.userAgent);
    const update = () => setCollected(collect());
    update();
    window.addEventListener("resize", update);

    // Client hints give precise OS versions (e.g. Windows 11) where supported.
    const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
    uaData
      ?.getHighEntropyValues(["platform", "platformVersion", "model", "architecture"])
      .then((values) => {
        const patch: Record<string, string> = {};
        if (values.platform === "Windows" && values.platformVersion) {
          patch["Operating system"] = Number(values.platformVersion.split(".")[0]) >= 13 ? "Windows 11" : "Windows 10";
        } else if (values.platform === "macOS" && values.platformVersion) {
          patch["Operating system"] = `macOS ${values.platformVersion}`;
        }
        if (values.architecture) patch.Architecture = values.architecture === "arm" ? "ARM" : "x86 / x64";
        if (values.model) patch.Model = values.model;
        setHints(patch);
      })
      .catch(() => {});

    return () => window.removeEventListener("resize", update);
  }, []);

  if (!collected) return <ToolCard className="h-96 animate-pulse">{null}</ToolCard>;
  const info: Info = { ...collected, Browser: { ...collected.Browser, ...hints } };

  const summary = [
    ...Object.entries(info).flatMap(([group, values]) => [
      `[${group}]`,
      ...Object.entries(values)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`),
    ]),
    `User agent: ${ua}`,
  ].join("\n");

  return (
    <ToolCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-primary/10 p-5 text-center">
          <p className="text-sm text-muted-foreground">Your browser</p>
          <p className="text-2xl font-bold">{info.Browser.Browser}</p>
          <p className="text-muted-foreground">on {info.Browser["Operating system"]}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-5 text-center">
          <p className="text-sm text-muted-foreground">Your screen resolution</p>
          <p className="text-2xl font-bold">{info.Screen["Screen resolution"]}</p>
          <p className="text-muted-foreground">Window: {info.Screen["Browser window"]}</p>
        </div>
      </div>

      {Object.entries(info).map(([group, values]) => (
        <section key={group} className="space-y-2">
          <h2 className="font-medium">{group}</h2>
          <DetailGrid>
            {Object.entries(values).map(([label, value]) => (
              <Detail key={label} label={label} value={value} />
            ))}
          </DetailGrid>
        </section>
      ))}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">User agent</h2>
          <CopyButton value={summary} label="Copy all info" />
        </div>
        <p className="break-all rounded-lg border bg-muted/30 p-3 font-mono text-xs">{ua}</p>
      </section>
    </ToolCard>
  );
}
