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
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-gradient">
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

          <div className="text-center bg-gradient-to-r from-primary/10 to-[#0042ff]/10 p-8 rounded-xl border border-primary/20 mb-10">
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
  --background: 120 14.2857% 98.6275%;
  --foreground: 150 20.0000% 3.9216%;
  --card: 0 0% 100%;
  --card-foreground: 150 20.0000% 3.9216%;
  --popover: 0 0% 100%;
  --popover-foreground: 150 20.0000% 3.9216%;
  --primary: 146.9620 96.3415% 32.1569%;
  --primary-foreground: 0 0% 98.8235%;
  --secondary: 132 17.2414% 94.3137%;
  --secondary-foreground: 126.6667 21.9512% 8.0392%;
  --muted: 132 17.2414% 94.3137%;
  --muted-foreground: 144 5.1546% 38.0392%;
  --accent: 134.1176 62.9630% 94.7059%;
  --accent-foreground: 141.8182 100% 17.2549%;
  --destructive: 357.1123 78.9030% 53.5294%;
  --destructive-foreground: 0 0% 98.8235%;
  --border: 140.0000 8.8235% 86.6667%;
  --input: 140.0000 8.8235% 86.6667%;
  --ring: 146.9620 96.3415% 32.1569%;
  --chart-1: 143.0488 71.9298% 44.7059%;
  --chart-2: 159.2727 79.7101% 40.5882%;
  --chart-3: 258.5806 91.7160% 66.8627%;
  --chart-4: 330.3704 81.8182% 61.1765%;
  --chart-5: 217.3404 91.2621% 59.6078%;
  --sidebar: 140 20.0000% 97.0588%;
  --sidebar-foreground: 144 5.1546% 38.0392%;
  --sidebar-primary: 146.9620 96.3415% 32.1569%;
  --sidebar-primary-foreground: 0 0% 98.8235%;
  --sidebar-accent: 136.8750 61.5385% 89.8039%;
  --sidebar-accent-foreground: 141.8182 100% 17.2549%;
  --sidebar-border: 140.0000 8.8235% 86.6667%;
  --sidebar-ring: 146.9620 96.3415% 32.1569%;
  --font-sans: Poppins, sans-serif;
  --font-serif: serif;
  --font-mono: Roboto Mono, monospace;
  --radius: 0.65rem;
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.2;
  --shadow-color: #000000;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.10);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.10);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.20), 0 1px 2px -1px hsl(0 0% 0% / 0.20);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.20), 0 1px 2px -1px hsl(0 0% 0% / 0.20);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.20), 0 2px 4px -1px hsl(0 0% 0% / 0.20);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.20), 0 4px 6px -1px hsl(0 0% 0% / 0.20);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.20), 0 8px 10px -1px hsl(0 0% 0% / 0.20);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.50);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: 150 25% 1.5686%;
  --foreground: 140 20.0000% 97.0588%;
  --card: 140 30.0000% 3.9216%;
  --card-foreground: 140 20.0000% 97.0588%;
  --popover: 140 25% 4.7059%;
  --popover-foreground: 140 20.0000% 97.0588%;
  --primary: 145.5172 85.2941% 40%;
  --primary-foreground: 132 55.5556% 1.7647%;
  --secondary: 137.1429 17.0732% 8.0392%;
  --secondary-foreground: 140 20.0000% 97.0588%;
  --muted: 142.5000 16.0000% 9.8039%;
  --muted-foreground: 145.7143 6.0870% 54.9020%;
  --accent: 137.1429 36.8421% 11.1765%;
  --accent-foreground: 139.2857 57.8512% 52.5490%;
  --destructive: 357.4545 67.9012% 47.6471%;
  --destructive-foreground: 0 0% 97.2549%;
  --border: 137.1429 11.8644% 11.5686%;
  --input: 142.5000 11.7647% 13.3333%;
  --ring: 145.5172 85.2941% 40%;
  --chart-1: 139.2857 57.8512% 52.5490%;
  --chart-2: 157.4026 64.7059% 46.6667%;
  --chart-3: 254.5946 79.8561% 72.7451%;
  --chart-4: 332.4088 82.0359% 67.2549%;
  --chart-5: 217.5540 80.3468% 66.0784%;
  --sidebar: 144 38.4615% 2.5490%;
  --sidebar-foreground: 145.7143 7.0000% 60.7843%;
  --sidebar-primary: 145.5172 85.2941% 40%;
  --sidebar-primary-foreground: 132 55.5556% 1.7647%;
  --sidebar-accent: 139.0909 52.3810% 8.2353%;
  --sidebar-accent-foreground: 139.2857 57.8512% 52.5490%;
  --sidebar-border: 142.5000 16.0000% 9.8039%;
  --sidebar-ring: 145.5172 85.2941% 40%;
  --font-sans: Poppins, sans-serif;
  --font-serif: serif;
  --font-mono: Roboto Mono, monospace;
  --radius: 0.65rem;
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: oklch(0 0 0);
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}`}
        </style>
      </div>
    </>
  );
}
