"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Link as LinkIcon, Mail, MessageSquare, Phone, Type, Wifi } from "lucide-react";
import QR from "qrcode";
import posthog from "posthog-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ColorInput from "@/components/tools/ColorInput";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { downloadBlob, downloadText } from "@/lib/files";

type Kind = "url" | "text" | "wifi" | "email" | "phone" | "sms";
type ErrorLevel = "L" | "M" | "Q" | "H";

const escapeWifi = (value: string) => value.replace(/([\\;,":])/g, "\\$1");

type Fields = Record<string, string>;

function buildPayload(kind: Kind, f: Fields, hidden: boolean) {
  switch (kind) {
    case "url":
    case "text":
      return f.value ?? "";
    case "wifi":
      if (!f.ssid) return "";
      return `WIFI:T:${f.security || "WPA"};S:${escapeWifi(f.ssid)};${
        f.security === "nopass" ? "" : `P:${escapeWifi(f.password ?? "")};`
      }${hidden ? "H:true;" : ""};`;
    case "email": {
      if (!f.to) return "";
      const params = new URLSearchParams();
      if (f.subject) params.set("subject", f.subject);
      if (f.body) params.set("body", f.body);
      const query = params.toString().replace(/\+/g, "%20");
      return `mailto:${f.to}${query ? `?${query}` : ""}`;
    }
    case "phone":
      return f.phone ? `tel:${f.phone.replace(/[^\d+]/g, "")}` : "";
    case "sms":
      return f.phone ? `SMSTO:${f.phone.replace(/[^\d+]/g, "")}:${f.message ?? ""}` : "";
  }
}

const KINDS = [
  { value: "url", label: <><LinkIcon /> URL</> },
  { value: "text", label: <><Type /> Text</> },
  { value: "wifi", label: <><Wifi /> Wi-Fi</> },
  { value: "email", label: <><Mail /> Email</> },
  { value: "phone", label: <><Phone /> Phone</> },
  { value: "sms", label: <><MessageSquare /> SMS</> },
] satisfies { value: Kind; label: React.ReactNode }[];

export default function QRCodeGenerator() {
  const [kind, setKind] = useState<Kind>("url");
  const [fields, setFields] = useState<Fields>({ value: "https://parcoil.com", security: "WPA" });
  const [hidden, setHidden] = useState(false);
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload = buildPayload(kind, fields, hidden);
  const options = {
    width: size,
    margin,
    errorCorrectionLevel: errorLevel,
    color: { dark, light },
  };

  useEffect(() => {
    if (!canvasRef.current || !payload) return;
    QR.toCanvas(canvasRef.current, payload, options).catch(() =>
      toast.error("That's too much data for a QR code. Try shortening it."),
    );
  }, [payload, size, margin, errorLevel, dark, light]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const input = (key: string, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <Field label={label} htmlFor={`qr-${key}`}>
      <Input id={`qr-${key}`} value={fields[key] ?? ""} onChange={set(key)} {...props} />
    </Field>
  );

  const downloadPng = () => {
    canvasRef.current?.toBlob((blob) => {
      if (blob) downloadBlob(blob, `qrcode-${kind}.png`);
    });
    posthog.capture("qr_code_downloaded", { size, type: kind, format: "png" });
  };

  const downloadSvg = async () => {
    const svg = await QR.toString(payload, { ...options, type: "svg" });
    downloadText(svg, `qrcode-${kind}.svg`, "image/svg+xml");
    posthog.capture("qr_code_downloaded", { size, type: kind, format: "svg" });
  };

  return (
    <ToolCard>
      <OptionPicker
        aria-label="QR code type"
        value={kind}
        onChange={(k) => {
          setKind(k);
          posthog.capture("qr_tab_changed", { tab: k });
        }}
        options={KINDS}
      />

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          {kind === "url" && input("value", "Website URL", { type: "url", placeholder: "https://example.com" })}
          {kind === "text" && (
            <Field label="Text" htmlFor="qr-value">
              <Textarea id="qr-value" value={fields.value ?? ""} onChange={set("value")} placeholder="Enter text to encode" />
            </Field>
          )}
          {kind === "wifi" && (
            <>
              {input("ssid", "Network name (SSID)", { placeholder: "My Home Wi-Fi" })}
              <Field label="Security">
                <OptionPicker
                  value={fields.security ?? "WPA"}
                  onChange={(security) => setFields((f) => ({ ...f, security }))}
                  options={[
                    { value: "WPA", label: "WPA/WPA2/WPA3" },
                    { value: "WEP", label: "WEP" },
                    { value: "nopass", label: "None" },
                  ]}
                />
              </Field>
              {fields.security !== "nopass" && input("password", "Password", { type: "text" })}
              <SwitchField label="Hidden network" checked={hidden} onChange={setHidden} />
            </>
          )}
          {kind === "email" && (
            <>
              {input("to", "Email address", { type: "email", placeholder: "hello@example.com" })}
              {input("subject", "Subject (optional)")}
              <Field label="Message (optional)" htmlFor="qr-body">
                <Textarea id="qr-body" value={fields.body ?? ""} onChange={set("body")} />
              </Field>
            </>
          )}
          {(kind === "phone" || kind === "sms") && input("phone", "Phone number", { type: "tel", placeholder: "+1 555 123 4567" })}
          {kind === "sms" && (
            <Field label="Message (optional)" htmlFor="qr-message">
              <Textarea id="qr-message" value={fields.message ?? ""} onChange={set("message")} />
            </Field>
          )}

          <SliderField label="Size" value={size} onChange={setSize} min={128} max={1024} step={16} format={(v) => `${v}px`} />
          <SliderField label="Quiet zone" value={margin} onChange={setMargin} min={0} max={8} format={(v) => `${v} modules`} />

          <Field label="Error correction" hint="Higher levels survive more damage (or a logo on top) but make denser codes.">
            <OptionPicker
              value={errorLevel}
              onChange={setErrorLevel}
              options={[
                { value: "L", label: "Low 7%" },
                { value: "M", label: "Medium 15%" },
                { value: "Q", label: "Quartile 25%" },
                { value: "H", label: "High 30%" },
              ]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Foreground" value={dark} onChange={setDark} />
            <ColorInput label="Background" value={light} onChange={setLight} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:w-72">
          <div className="flex aspect-square w-full max-w-72 items-center justify-center rounded-lg border bg-muted/30 p-2">
            {payload ? (
              <canvas ref={canvasRef} className="max-w-full h-auto! rounded" />
            ) : (
              <p className="text-sm text-muted-foreground text-center px-4">
                Fill in the details to generate your QR code
              </p>
            )}
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button onClick={downloadPng} disabled={!payload}>
              <Download /> PNG
            </Button>
            <Button variant="outline" onClick={downloadSvg} disabled={!payload}>
              <Download /> SVG
            </Button>
          </div>
        </div>
      </div>
    </ToolCard>
  );
}
