"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const AdBanner = dynamic(() => import("@/components/AdBanner"), {
  ssr: false,
  loading: () => <div className="h-24 bg-muted/20 rounded-lg animate-pulse" />
});
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Download,
  Github,
  Trash2,
  Zap,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

import { ReactLenis } from "lenis/react";
import posthog from "posthog-js";

async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/parcoil/dotline/releases/latest"
    );
    if (!res.ok) throw new Error("Failed to fetch release");
    const release = await res.json();

    const findAsset = (ext: string) =>
      release.assets.find((asset) =>
        asset.name.toLowerCase().endsWith(ext.toLowerCase())
      );

    return {
      version: release.tag_name,
      // windows
      exe: findAsset("-setup.exe")?.browser_download_url ?? null,
      exeName: findAsset("-setup.exe")?.name ?? null,
      msi: findAsset(".msi")?.browser_download_url ?? null,
      msiName: findAsset(".msi")?.name ?? null,
      zip: findAsset(".zip")?.browser_download_url ?? null,
      zipName: findAsset(".zip")?.name ?? null,
      // linux
      appImage: findAsset(".AppImage")?.browser_download_url ?? null,
      appImageName: findAsset(".AppImage")?.name ?? null,
      deb: findAsset(".deb")?.browser_download_url ?? null,
      debName: findAsset(".deb")?.name ?? null,
    };
  } catch {
    return {
      version: null,
      exe: null,
      exeName: null,
      msi: null,
      msiName: null,
      zip: null,
      zipName: null,
      appImage: null,
      appImageName: null,
      deb: null,
      debName: null,
    };
  }
}

export default function DotlineClient() {
  const [version, setVersion] = useState(null);
  const [downloads, setDownloads] = useState<Download>({
    version: null,
    exe: null,
    exeName: null,
    msi: null,
    msiName: null,
    zip: null,
    zipName: null,
    appImage: null,
    appImageName: null,
    deb: null,
    debName: null,
  });
  const [loading, setLoading] = useState(true);

  type Download = {
    version: string;
    exe: string;
    exeName: string;
    msi: string;
    msiName: string;
    zip: string;
    zipName: string;
    appImage: string;
    appImageName: string;
    deb: string;
    debName: string;
  };

  const features = [
    {
      icon: <LayoutGrid className="text-blue-500" />,
      title: "Customizable Crosshairs",
      description: "Create crosshairs your way with many style options.",
      categories: ["Customization", "UI"],
    },
    {
      icon: <Zap className="text-[#22c55e]" />,
      title: "10+ Presets",
      description: "Choose from over 10 presets.",
      categories: ["Convenience", "Design"],
    },
    {
      icon: <Trash2 className="text-red-500" />,
      title: "Import & Export Configs",
      description: "Save and share your crosshair setups easily.",
      categories: ["Portability", "Sharing"],
    },
    {
      icon: <AlertCircle className="text-orange-400" />,
      title: "Cross-Platform",
      description:
        "Runs on Windows and Linux (tested on Windows 11 and Arch Linux KDE).",
      categories: ["Compatibility"],
    },
  ];

  useEffect(() => {
    setLoading(true);
    getLatestRelease().then((data) => {
      setVersion(data.version);
      setDownloads(data);
      setLoading(false);
    });
  }, []);

  const primaryDownload = downloads.exe ?? downloads.appImage ?? downloads.deb;
  const primaryName =
    downloads.exeName ?? downloads.appImageName ?? downloads.debName;

  const handleDownload = (format: string, url: string | null) => {
    if (!url) return;
    posthog.capture("download_clicked", {
      format,
      version,
      url,
    });
    window.location.href = url;
  };

  return (
    <div className="min-h-screen">
      <ReactLenis root />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-bounce-slow">
            <Image
              src="/dotline.png"
              alt="Dotline Logo"
              width={100}
              height={100}
              priority
              unoptimized
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#22c55e] to-[#1c994a] bg-clip-text text-transparent animate-gradient">
            Dotline
          </h1>
          <p className="text-lg md:text-xl text-black dark:text-gray-300 mb-4">
            An open source crosshair overlay for Windows and Linux
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            {version && (
              <p className="text-sm text-muted-foreground">
                Latest Version:{" "}
                <a
                  href="https://github.com/parcoil/dotline/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong className="text-[#22c55e]">{version}</strong>
                </a>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {loading ? (
              <Button
                disabled
                size="lg"
                className="bg-[#22c55e] hover:bg-green-600 text-black"
              >
                Loading...
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-[#22c55e] hover:bg-green-600 text-black"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem disabled className="font-bold">
                    Windows
                  </DropdownMenuItem>
                  {downloads.exe && (
                    <DropdownMenuItem asChild>
                      <a
                        href={downloads.exe}
                        download={downloads.exeName}
                        onClick={() => handleDownload("exe", downloads.exe)}
                      >
                        Installer (.exe)
                      </a>
                    </DropdownMenuItem>
                  )}
                  {downloads.msi && (
                    <DropdownMenuItem asChild>
                      <a
                        href={downloads.msi}
                        download={downloads.msiName}
                        onClick={() => handleDownload("msi", downloads.msi)}
                      >
                        Installer (.msi)
                      </a>
                    </DropdownMenuItem>
                  )}
                  {downloads.zip && (
                    <DropdownMenuItem asChild>
                      <a
                        href={downloads.zip}
                        download={downloads.zipName}
                        onClick={() => handleDownload("zip", downloads.zip)}
                      >
                        Portable (.zip)
                      </a>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem disabled className="font-bold mt-2">
                    Linux
                  </DropdownMenuItem>
                  {downloads.appImage && (
                    <DropdownMenuItem asChild>
                      <a
                        href={downloads.appImage}
                        download={downloads.appImageName}
                        onClick={() =>
                          handleDownload("appImage", downloads.appImage)
                        }
                      >
                        AppImage
                      </a>
                    </DropdownMenuItem>
                  )}
                  {downloads.deb && (
                    <DropdownMenuItem asChild>
                      <a
                        href={downloads.deb}
                        download={downloads.debName}
                        onClick={() => handleDownload("deb", downloads.deb)}
                      >
                        Debian Package (.deb)
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link href="https://github.com/parcoil/dotline">
              <Button
                variant="outline"
                size="lg"
                className="border-[#22c55e] text-[#22c55e] hover:border-[#22c55e]/10 hover:bg-[#22c55e]"
              >
                <Github className="mr-2 h-5 w-5" /> View on GitHub
              </Button>
            </Link>
          </div>
        </div>

        <img
          src="https://raw.githubusercontent.com/parcoil/dotline/refs/heads/main/images/appscreenshot.png"
          className="w-full max-w-3xl mx-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 mt-5 mb-4"
          alt="Dotline application screenshot"
        />

        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#22c55e] mb-8">
            Features
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Open source, customizable crosshair overlay with presets and
            cross-platform support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="hover:border-[#22c55e] hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted group-hover:bg-[#22c55e]/10 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {feature.title}
                        {/* {feature.new && (
                          <span className="text-white bg-red-500 text-xs px-2 py-0.5 rounded-full ml-2">
                            New
                          </span>
                        )} */}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {feature.categories?.join(" • ")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="dark:text-gray-300">
                  <p className="mb-2">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#22c55e] mb-8">
            Dotline vs Others
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            A quick, high-level comparison to help you choose what fits your
            needs.
          </p>

          <div className="flex flex-col md:flex-row gap-6">
            <Card className="hover:border-[#22c55e] hover:shadow-lg transition-all duration-300 w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image
                    src="/dotline.png"
                    alt="Dotline"
                    width={28}
                    height={28}
                  />
                  Dotline
                  <span className="text-xs font-medium text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">
                    Open Source
                  </span>
                </CardTitle>
                <CardDescription>Community-driven, free</CardDescription>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>✅ Free & open source</li>
                  <li>✅ Windows and Linux support</li>
                  <li>✅ In-app editor</li>
                  <li>✅ 10+ presets with deep customization</li>
                  <li>✅ Import/Export configurations</li>
                  <li>✅ No ads</li>
                  <li>✅ Portable and installer builds</li>
                  <li>✅ Auto updates</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="https://github.com/parcoil/dotline">
                  <Button
                    size="lg"
                    className="bg-[#22c55e] text-primary-foreground hover:border-[#22c55e]/10 hover:bg-[#22c55e]"
                  >
                    <Github className="mr-2 h-5 w-5" /> View on GitHub
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="hover:border-[#22c55e] hover:shadow-lg transition-all duration-300 w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img
                    src="https://store-images.s-microsoft.com/image/apps.28166.14083481012137053.8dd52c3f-852b-4b54-a82f-7927fdfb0143.fb58a0a2-9434-4c2b-a457-a47de9656f83"
                    alt="Crosshair X"
                    width={28}
                    height={28}
                  />
                  Crosshair X
                  <span className="text-xs font-medium text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full">
                    Commercial
                  </span>
                </CardTitle>
                <CardDescription>
                  Proprietary, distributed via Steam
                </CardDescription>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>❌ Paid software (proprietary)</li>
                  <li>❌ Only Windows support via Steam</li>
                  <li>✅ Preset library and in-app editor</li>
                  <li>❌ Not open source</li>
                  <li>✅ No ads </li>
                  <li>❌ Requires Steam platform for distribution/updates</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="hover:border-[#22c55e] hover:shadow-lg transition-all duration-300 w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img
                    src="https://store-images.s-microsoft.com/image/apps.14369.13899847573165032.36bcfc47-3b27-4d4a-a723-9193b65b9ef2.92da79b2-055e-4c1b-98c6-f4d5a57e5acd"
                    alt="Crosshair v2"
                    width={28}
                    height={28}
                  />
                  Crosshair v2
                  <span className="text-xs font-medium text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full">
                    Commercial
                  </span>
                </CardTitle>
                <CardDescription>
                  Proprietary, distributed via Steam
                </CardDescription>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>❌ Free software (proprietary)</li>
                  <li>❌ Only Windows support via Steam</li>
                  <li>❌ Small Preset library and no in-app editor</li>
                  <li>❌ Not open source</li>
                  <li>✅ No ads </li>
                  <li>❌ Requires Steam platform for distribution/updates</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* <p className="text-xs text-center text-muted-foreground mt-6">
            Crosshair X is a separate, third-party product. Dotline is not
            affiliated with or endorsed by Crosshair X.
          </p> */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            Crosshair X, Crosshair v2, and Dotline are separate, third-party
            products. Dotline is not affiliated with or endorsed by Crosshair X
            or Crosshair v2.
          </p>
        </div>

        <div className="text-center bg-gradient-to-r from-[#22c55e]/10 to-[#0042ff]/10 p-8 rounded-xl border border-[#22c55e]/20 mb-10">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Try Dotline?
          </h2>
          <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
            Download Dotline and customize your crosshair experience on Windows
            and Linux
          </p>

          {primaryDownload && (
            <a
              href={primaryDownload}
              download={primaryName ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block animate-pulse-slow"
            >
              <Button
                size="lg"
                className="bg-[#22c55e] hover:bg-green-600 text-black shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="mr-2 h-5 w-5" /> Get Dotline Now
              </Button>
            </a>
          )}
        </div>

        <p className="text-sm text-green-400 mt-10 text-center font-medium">
          Currently in Alpha - Please report any issues on{" "}
          <a
            href="https://github.com/parcoil/dotline"
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
         </p>

         <div className="max-w-4xl mx-auto px-4 py-8">
           <AdBanner />
         </div>
       </div>
     </div>
  );
}
