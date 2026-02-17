"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import posthog from "posthog-js";
import Script from "next/script";

async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/parcoil/dotline/releases/latest",
    );
    if (!res.ok) throw new Error("Failed to fetch release");
    const release = await res.json();

    const findAsset = (ext: string) =>
      release.assets.find((asset) =>
        asset.name.toLowerCase().endsWith(ext.toLowerCase()),
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

async function getTotalDownloads() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/parcoil/dotline/releases",
    );
    if (!res.ok) throw new Error("Failed to fetch releases");
    const releases = await res.json();

    let totalDownloads = 0;
    releases.forEach((release) => {
      const version = release.tag_name;
      if (version) {
        release.assets.forEach((asset) => {
          if (
            asset.name.endsWith(".exe") ||
            asset.name.endsWith(".AppImage") ||
            asset.name.endsWith(".deb") ||
            asset.name.endsWith(".zip")
          ) {
            totalDownloads += asset.download_count || 0;
          }
        });
      }
    });

    return totalDownloads;
  } catch {
    return null;
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
  const [totalDownloads, setTotalDownloads] = useState(null);

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
      icon: <Zap className="text-primary" />,
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

    getTotalDownloads().then((total) => {
      setTotalDownloads(total);
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
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1565760898646999"
        crossOrigin="anonymous"
      />
      <div className="min-h-screen">
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
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent animate-gradient">
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
                    <strong className="text-primary">{version}</strong>
                  </a>
                </p>
              )}
              {totalDownloads && (
                <p className="text-sm text-muted-foreground">
                  Total Downloads:{" "}
                  <strong className="text-primary">
                    {totalDownloads.toLocaleString()}
                  </strong>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {loading ? (
                <Button disabled size="lg">
                  Loading...
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg">
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
                <Button variant="outline" size="lg">
                  <Github className="mr-2 h-5 w-5" /> View on GitHub
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center mb-8 mt-8">
            <AdBanner />
          </div>

          <img
            src="https://raw.githubusercontent.com/parcoil/dotline/refs/heads/main/images/appscreenshot.png"
            className="w-full max-w-3xl mx-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 mt-5 mb-4"
            alt="Dotline application screenshot"
          />

          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
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
                  className="hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
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

          <div className="flex justify-center mb-8">
            <AdBanner />
          </div>

          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
              Dotline vs Others
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              A quick, high-level comparison to help you choose what fits your
              needs.
            </p>

            <div className="flex flex-col md:flex-row gap-6">
              <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 w-1/2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image
                      src="/dotline.png"
                      alt="Dotline"
                      width={28}
                      height={28}
                    />
                    Dotline
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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
                      className="bg-primary text-primary-foreground hover:border-primary/10 hover:bg-primary"
                    >
                      <Github className="mr-2 h-5 w-5" /> View on GitHub
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 w-1/2">
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
              <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 w-1/2">
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
              products. Dotline is not affiliated with or endorsed by Crosshair
              X or Crosshair v2.
            </p>
          </div>

          <div className="flex justify-center mb-8 ">
            <AdBanner />
          </div>

          <div className="text-center bg-linear-to-r from-primary/10 to-[#0042ff]/10 p-8 rounded-xl border border-primary/20 mb-10">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to Try Dotline?
            </h2>
            <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
              Download Dotline and customize your crosshair experience on
              Windows and Linux
            </p>

            {primaryDownload && (
              <a
                href={primaryDownload}
                download={primaryName ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block animate-pulse-slow"
              >
                <Button size="lg">
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
        <style>
          {`:root {
  --background: oklch(0.99 0.002 160);
  --foreground: oklch(0.15 0.01 160);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0.01 160);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.01 160);
  --primary: oklch(0.62 0.17 150);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.96 0.008 155);
  --secondary-foreground: oklch(0.2 0.02 150);
  --muted: oklch(0.96 0.008 155);
  --muted-foreground: oklch(0.5 0.015 160);
  --accent: oklch(0.97 0.025 152);
  --accent-foreground: oklch(0.4 0.12 150);
  --destructive: oklch(0.6 0.22 25);
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.9 0.008 155);
  --input: oklch(0.9 0.008 155);
  --ring: oklch(0.62 0.17 150);
  --chart-1: oklch(0.72 0.19 150);
  --chart-2: oklch(0.7 0.15 162);
  --chart-3: oklch(0.61 0.22 293);
  --chart-4: oklch(0.66 0.21 354);
  --chart-5: oklch(0.62 0.19 260);
  --sidebar: oklch(0.98 0.005 155);
  --sidebar-foreground: oklch(0.5 0.015 160);
  --sidebar-primary: oklch(0.62 0.17 150);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.94 0.045 155);
  --sidebar-accent-foreground: oklch(0.4 0.12 150);
  --sidebar-border: oklch(0.9 0.008 155);
  --sidebar-ring: oklch(0.62 0.17 150);
  --font-sans: Poppins, sans-serif;
  --font-serif: serif;
  --font-mono: Roboto Mono, monospace;
  --radius: 0.65rem;
  --shadow-2xs: 0px 1px 2px 0px hsl(150 40% 50% / 0.04);
  --shadow-xs: 0px 1px 3px 0px hsl(150 40% 50% / 0.06);
  --shadow-sm: 0px 2px 4px 0px hsl(150 40% 50% / 0.08), 0px 1px 2px -1px hsl(150 40% 50% / 0.08);
  --shadow: 0px 2px 6px 0px hsl(150 40% 50% / 0.1), 0px 2px 4px -1px hsl(150 40% 50% / 0.1);
  --shadow-md: 0px 4px 8px 0px hsl(150 40% 50% / 0.12), 0px 2px 4px -1px hsl(150 40% 50% / 0.12);
  --shadow-lg: 0px 6px 12px 0px hsl(150 40% 50% / 0.14), 0px 4px 6px -1px hsl(150 40% 50% / 0.14);
  --shadow-xl: 0px 10px 20px 0px hsl(150 40% 50% / 0.16), 0px 8px 10px -1px hsl(150 40% 50% / 0.16);
  --shadow-2xl: 0px 15px 30px 0px hsl(150 40% 50% / 0.2);
  --tracking-normal: 0rem;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.11 0.01 160);
  --foreground: oklch(0.98 0.005 160);
  --card: oklch(0.15 0.012 160);
  --card-foreground: oklch(0.98 0.005 160);
  --popover: oklch(0.16 0.012 160);
  --popover-foreground: oklch(0.98 0.005 160);
  --primary: oklch(0.7 0.19 150);
  --primary-foreground: oklch(0.12 0.02 150);
  --secondary: oklch(0.2 0.015 155);
  --secondary-foreground: oklch(0.98 0.005 160);
  --muted: oklch(0.22 0.015 155);
  --muted-foreground: oklch(0.65 0.02 160);
  --accent: oklch(0.25 0.04 152);
  --accent-foreground: oklch(0.75 0.18 150);
  --destructive: oklch(0.55 0.2 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.24 0.015 155);
  --input: oklch(0.26 0.015 155);
  --ring: oklch(0.7 0.19 150);
  --chart-1: oklch(0.75 0.18 150);
  --chart-2: oklch(0.73 0.15 162);
  --chart-3: oklch(0.68 0.16 293);
  --chart-4: oklch(0.7 0.18 354);
  --chart-5: oklch(0.68 0.14 260);
  --sidebar: oklch(0.13 0.012 160);
  --sidebar-foreground: oklch(0.7 0.02 160);
  --sidebar-primary: oklch(0.7 0.19 150);
  --sidebar-primary-foreground: oklch(0.12 0.02 150);
  --sidebar-accent: oklch(0.22 0.04 152);
  --sidebar-accent-foreground: oklch(0.75 0.18 150);
  --sidebar-border: oklch(0.22 0.015 155);
  --sidebar-ring: oklch(0.7 0.19 150);
  --font-sans: Poppins, sans-serif;
  --font-serif: serif;
  --font-mono: Roboto Mono, monospace;
  --radius: 0.65rem;
  --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.08);
  --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.12);
  --shadow-sm: 0px 2px 4px 0px hsl(0 0% 0% / 0.16), 0px 1px 2px -1px hsl(0 0% 0% / 0.16);
  --shadow: 0px 2px 6px 0px hsl(0 0% 0% / 0.2), 0px 2px 4px -1px hsl(0 0% 0% / 0.2);
  --shadow-md: 0px 4px 8px 0px hsl(0 0% 0% / 0.24), 0px 2px 4px -1px hsl(0 0% 0% / 0.24);
  --shadow-lg: 0px 6px 12px 0px hsl(0 0% 0% / 0.28), 0px 4px 6px -1px hsl(0 0% 0% / 0.28);
  --shadow-xl: 0px 10px 20px 0px hsl(0 0% 0% / 0.32), 0px 8px 10px -1px hsl(0 0% 0% / 0.32);
  --shadow-2xl: 0px 15px 30px 0px hsl(0 0% 0% / 0.4);
}`}
        </style>
      </div>
    </>
  );
}
