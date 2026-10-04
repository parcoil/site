"use client";
import { useEffect, useMemo, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { Detail, DetailGrid } from "@/components/tools/stats";
import { useMounted } from "@/hooks/use-mounted";
import { base64ToBytes, decodeBase64, utf8Encode } from "@/lib/encoding";
import { formatDateTime, relativeTime } from "@/lib/time";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.KZ-wUOdeLzUgueTzrpJ-GEzJGdPfnF87H5v5YdIyq88";

const CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  jti: "Token ID",
};

const HMAC: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

function decodePart(part: string, name: string) {
  try {
    return JSON.parse(decodeBase64(part));
  } catch {
    throw new Error(`The ${name} isn't valid Base64URL-encoded JSON.`);
  }
}

async function verifyHmac(token: string, algorithm: string, secret: string) {
  const [header, payload, signature] = token.split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    utf8Encode(secret) as BufferSource,
    { name: "HMAC", hash: HMAC[algorithm] },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    base64ToBytes(signature) as BufferSource,
    utf8Encode(`${header}.${payload}`) as BufferSource,
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE);
  const [secret, setSecret] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const mounted = useMounted();

  const decoded = useMemo(() => {
    const trimmed = token.trim().replace(/^Bearer\s+/i, "");
    if (!trimmed) return null;
    const parts = trimmed.split(".");
    if (parts.length !== 3) return { error: "A JWT has three parts separated by dots." };
    try {
      return {
        token: trimmed,
        header: decodePart(parts[0], "header"),
        payload: decodePart(parts[1], "payload"),
        signature: parts[2],
      };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [token]);

  const algorithm = decoded && "header" in decoded ? String(decoded.header.alg ?? "") : "";

  useEffect(() => {
    setVerified(null);
    if (!secret || !decoded || !("token" in decoded) || !HMAC[algorithm]) return;
    let cancelled = false;
    verifyHmac(decoded.token, algorithm, secret)
      .then((ok) => !cancelled && setVerified(ok))
      .catch(() => !cancelled && setVerified(false));
    return () => {
      cancelled = true;
    };
  }, [secret, decoded, algorithm]);

  const timeClaim = (label: string, value: unknown) => {
    if (typeof value !== "number" || !mounted) return null;
    const date = new Date(value * 1000);
    return <Detail key={label} label={label} value={<>{formatDateTime(date)}<br /><span className="text-muted-foreground">{relativeTime(date)}</span></>} />;
  };

  const payload = decoded && "payload" in decoded ? decoded.payload : null;
  const expired = typeof payload?.exp === "number" && payload.exp * 1000 < Date.now();

  return (
    <ToolCard>
      <Field label="JSON Web Token" htmlFor="jwt">
        <Textarea
          id="jwt"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi…"
          className="min-h-28 font-mono text-xs break-all"
          spellCheck={false}
        />
      </Field>

      {decoded && "error" in decoded && <p className="text-sm text-destructive">{decoded.error}</p>}

      {decoded && "header" in decoded && (
        <>
          {mounted && typeof payload?.exp === "number" && (
            <p className={`flex items-center gap-2 text-sm font-medium ${expired ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
              {expired ? <CircleX className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
              {expired ? "This token has expired" : "This token hasn't expired"} ({relativeTime(new Date(payload.exp * 1000))})
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <OutputField multiline mono label="Header" value={JSON.stringify(decoded.header, null, 2)} />
            <OutputField multiline mono label="Payload" value={JSON.stringify(decoded.payload, null, 2)} />
          </div>

          <DetailGrid>
            <Detail label="Algorithm" value={algorithm} mono />
            <Detail label="Type" value={decoded.header.typ} mono />
            {Object.entries(CLAIMS).map(([claim, label]) =>
              payload?.[claim] !== undefined ? (
                <Detail key={claim} label={`${label} (${claim})`} value={String(payload[claim])} mono />
              ) : null,
            )}
            {timeClaim("Issued at (iat)", payload?.iat)}
            {timeClaim("Not before (nbf)", payload?.nbf)}
            {timeClaim("Expires (exp)", payload?.exp)}
          </DetailGrid>

          {HMAC[algorithm] ? (
            <Field
              label="Verify signature"
              htmlFor="jwt-secret"
              hint={
                verified === null
                  ? "Enter the shared secret to check the signature (the sample uses “your-256-bit-secret”). It stays in your browser."
                  : verified
                    ? "✓ Signature verified with this secret."
                    : "✗ Signature does not match this secret."
              }
            >
              <Input
                id="jwt-secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="your-256-bit-secret"
                className={`font-mono ${verified === true ? "border-green-500" : verified === false ? "border-destructive" : ""}`}
              />
            </Field>
          ) : (
            <p className="text-sm text-muted-foreground">
              {algorithm} signatures need the issuer&apos;s public key to verify; decoding works without it.
            </p>
          )}
        </>
      )}
    </ToolCard>
  );
}
