"use client";

import { useEffect, useState } from "react";
import { Clipboard } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import posthog from "posthog-js";

export default function IPInfoCard() {
  const [ipinfo, setIpinfo] = useState(null);

  useEffect(() => {
    async function getIp() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setIpinfo(data);
      } catch (error) {
        console.error("Failed to fetch IP info:", error);
      }
    }
    getIp();
  }, []);

  const copyIP = () => {
    if (!ipinfo?.ip) return;
    navigator.clipboard.writeText(ipinfo.ip);
    toast("IP Copied to clipboard");
    posthog.capture("ip_copied");
  };

  if (!ipinfo) {
    return (
      <div className="flex mt-5 flex-col items-center justify-center text-center">
        <span className="text-4xl">
          <Spinner className="w-10 h-10" size={"large"} show={true} />
        </span>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col items-center animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="flex flex-col items-center space-y-6 p-6 text-center">
          <div className="flex items-center space-x-4">
            {ipinfo?.country_code && (
              <img
                src={`https://flagcdn.com/48x36/${ipinfo.country_code.toLowerCase()}.png`}
                alt={ipinfo?.country_name}
                width={40}
                height={30}
              />
            )}
            <h2 className="text-2xl font-semibold">{ipinfo?.country_name}</h2>
          </div>

          <div className="flex items-center space-x-2 text-4xl font-bold text-primary">
            <span>{ipinfo?.ip}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyIP}
              title="Copy IP"
            >
              <Clipboard className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 text-left md:grid-cols-2">
            <p>
              <strong>City:</strong> {ipinfo?.city}
            </p>
            <p>
              <strong>Region:</strong> {ipinfo?.region}
            </p>
            <p>
              <strong>Postal Code:</strong> {ipinfo?.postal}
            </p>
            <p>
              <strong>Capital:</strong> {ipinfo?.country_capital}
            </p>
            <p>
              <strong>Continent:</strong> {ipinfo?.continent_code || "N/A"}
            </p>
            <p>
              <strong>ISP:</strong> {ipinfo?.org}
            </p>
            <p>
              <strong>Timezone:</strong> {ipinfo?.timezone}
            </p>
            <p>
              <strong>Currency:</strong> {ipinfo?.currency}
            </p>
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
