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
  Globe,
  AsteriskSquare,
  ChevronDown,
  Box,
  Copy,
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
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";

async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/Parcoil/Sparkle/releases/latest"
    );
    if (!res.ok) throw new Error("Failed to fetch release");
    const release = await res.json();

    const setupAsset = release.assets.find((asset) =>
      asset.name.endsWith("-setup.exe")
    );

    const portableAsset = release.assets.find(
      (asset) =>
        asset.name.includes("win-unpacked") && asset.name.endsWith(".zip")
    );

    return {
      version: release.tag_name,
      downloadUrl: setupAsset?.browser_download_url ?? release.html_url,
      downloadName: setupAsset?.name ?? null,
      portableUrl: portableAsset?.browser_download_url ?? null,
      portableName: portableAsset?.name ?? null,
    };
  } catch {
    return {
      version: null,
      downloadUrl: "https://github.com/Parcoil/Sparkle/releases/latest",
      downloadName: null,
      portableUrl: null,
      portableName: null,
    };
  }
}

async function getTotalDownloads() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/Parcoil/Sparkle/releases"
    );
    if (!res.ok) throw new Error("Failed to fetch releases");
    const releases = await res.json();

    let totalDownloads = 0;
    releases.forEach((release) => {
      const version = release.tag_name;
      if (version && version >= "2.0.0") {
        release.assets.forEach((asset) => {
          if (asset.name.endsWith(".exe") || asset.name.endsWith(".zip")) {
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

export default function SparkleClient() {
  const [version, setVersion] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState(null);
  const [portableUrl, setPortableUrl] = useState("");
  const [portableName, setPortableName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [totalDownloads, setTotalDownloads] = useState(null);

  const features = [
    {
      icon: <LayoutGrid className="text-green-500" />,
      title: "Debloat Windows",
      description:
        "Removes Unnecessary Windows Features And Apps (RECOMMENDED)",
      categories: ["Performance", "Privacy"],
    },
    {
      icon: <Zap className="text-[#0096ff]" />,
      title: "System Optimization",
      description: "Enhance system performance and responsiveness with tweaks.",
      categories: ["Performance"],
    },
    {
      icon: <Trash2 className="text-red-500" />,
      title: "Clear temporary files",
      description: "Remove temporary files, caches, and logs to free up space.",
    },
    {
      icon: <AlertCircle className="text-orange-400" />,
      title: "Safe & Reversible",
      description:
        "All changes can be undone with restore points, disabling the tweak, or changing system settings.",
    },
    {
      icon: <AsteriskSquare className="text-primary" />,
      title: "Built-in App Installer",
      description: "Sparkle has a winget powered app installer built in!",
    },
    {
      icon: <Box className="text-cyan-500" />,
      title: "Utilities Page",
      description: "Run System File Checker (SFC), Check Disk, DSIM from a GUI",
    },
    {
      icon: <Globe className="text-yellow-500" />,
      title: "DNS Changer",
      new: true,
      description:
        "Change your DNS settings to improve internet speed and security.",
    },
  ];

  const powershellScript =
    "irm https://raw.githubusercontent.com/Parcoil/Sparkle/v2/get.ps1 | iex";

  const handleCopyScript = () => {
    navigator.clipboard.writeText(powershellScript);
    toast.success("Copied to clipboard");
  };

  useEffect(() => {
    setLoading(true);
    getLatestRelease().then((data) => {
      setVersion(data.version);
      setDownloadUrl(data.downloadUrl);
      setDownloadName(data.downloadName);
      setPortableUrl(data.portableUrl);
      setPortableName(data.portableName);
      setLoading(false);
    });

    getTotalDownloads().then((total) => {
      setTotalDownloads(total);
    });

    fetch(
      "https://raw.githubusercontent.com/Parcoil/Sparkle/refs/heads/v2/src/renderer/src/assets/apps.json"
    )
      .then((res) => res.json())
      .then((data) => {
        // Ensure we have a valid apps array
        if (data && Array.isArray(data.apps)) {
          setApps(data.apps);
        } else {
          setApps([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch apps:", error);
        setApps([]);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <ReactLenis root />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-bounce-slow">
            <Image
              className=""
              src="/sparklelogo.png"
              alt="Sparkle Logo"
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#0096ff] to-[#0042ff] bg-clip-text text-transparent animate-gradient">
            Sparkle
          </h1>
          <p className="text-lg md:text-xl text-black dark:text-gray-300 mb-4">
            The ultimate tool to optimize Windows and boost gaming performance
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            {version && (
              <p className="text-sm text-muted-foreground">
                Latest Version:{" "}
                <a href="https://github.com/Parcoil/Sparkle">
                  <strong className="text-[#0096ff]">{version}</strong>
                </a>
              </p>
            )}
            {totalDownloads && (
              <p className="text-sm text-muted-foreground">
                Total Downloads:{" "}
                <strong className="text-[#0096ff]">
                  {totalDownloads.toLocaleString()}
                </strong>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {loading ? (
              <Button
                disabled
                size="lg"
                className="bg-[#0096ff] hover:bg-blue-600 text-black"
              >
                Loading...
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-[#0096ff] hover:bg-blue-600 text-black"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a
                      href={downloadUrl}
                      onClick={() => {
                        posthog.capture("sparkle_download_button", {
                          download_type: "exe",
                        });
                        sendGAEvent("event", "sparkle_download_button", {
                          value: "homepage_button_exe",
                          app_version: version ?? "unknown",
                        });
                      }}
                      download={downloadName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Windows Installer (.exe)
                    </a>
                  </DropdownMenuItem>
                  {portableUrl && (
                    <DropdownMenuItem asChild>
                      <a
                        href={portableUrl}
                        onClick={() => {
                          posthog.capture("sparkle_download_button", {
                            download_type: "zip",
                            app_version: version ?? "unknown",
                          });
                          sendGAEvent("event", "sparkle_download_button", {
                            value: "homepage_button_zip",
                          });
                        }}
                        download={portableName}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Portable Version (.zip)
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link href="https://github.com/Parcoil/Sparkle">
              <Button
                variant="outline"
                size="lg"
                className="border-[#0096ff] text-[#0096ff] hover:border-[#0096ff]/10"
              >
                <Github className="mr-2 h-5 w-5" /> View on GitHub
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center mb-8 mt-6">
          <div className="relative w-full max-w-[700px]">
            <div className="mb-2 text-sm text-muted-foreground text-center">
              Quick Install via PowerShell:
            </div>
            <div className="relative">
              <pre className="overflow-x-auto whitespace-nowrap rounded-[--radius] bg-muted p-3 text-sm font-mono select-all pr-12 text-secondary-foreground border border-[#0096ff]/20">
                {powershellScript}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1/2 right-2 transform -translate-y-1/2"
                onClick={handleCopyScript}
                aria-label="Copy PowerShell script"
                title={"Copy to clipboard"}
              >
                <Copy className="h-4 w-4 text-secondary-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <img
          src="https://raw.githubusercontent.com/Parcoil/Sparkle/refs/heads/v2/images/appshowcase.png"
          className="w-full max-w-3xl mx-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 mb-4"
          alt="Sparkle application screenshot"
        />

        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#0096ff] mb-8">
            Features
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Powerful optimizations to enhance your Windows experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="hover:border-[#0096ff] hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted group-hover:bg-[#0096ff]/10 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {feature.title}
                        {feature.new && (
                          <span className="text-white bg-red-500 text-xs px-2 py-0.5 rounded-full">
                            New in v2.6.0
                          </span>
                        )}
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#0096ff] mb-8">
            Installable Apps
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Easily install popular apps with Sparkle
          </p>
          <div className="marquee-container relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent dark:from-background z-10 pointer-events-none"></div>

            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent dark:from-background z-10 pointer-events-none"></div>
            <div className="marquee-track">
              {[...apps, ...apps]
                .sort(() => Math.random() - 0.5)
                .map((app, i) => (
                  <Card
                    key={i}
                    className="w-[280px] shrink-0 hover:border-[#0096ff] transition-all duration-300"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-8 h-8"
                          height={8}
                          width={8}
                        />

                        <CardTitle className="text-lg">{app.name}</CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="dark:text-gray-300 text-sm">
                      <CardDescription>Type: {app.category}</CardDescription>
                      <p>{app.info}</p>
                      {app.link && (
                        <a
                          href={app.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-blue-400 hover:underline"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Visit Site
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-[#0096ff]/10 to-[#0042ff]/10 p-8 rounded-xl border border-[#0096ff]/20 mb-10">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Optimize Your Windows PC?
          </h2>
          <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
            Download Sparkle and Debloat, Optimize, Clean your PC
          </p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={downloadName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block animate-pulse-slow"
              onClick={() => {
                posthog.capture("sparkle_download_button", {
                  download_type: "exe",
                  location: "bottom_cta",
                });
                sendGAEvent("event", "sparkle_download_button", {
                  value: "bottom_cta_exe",
                  app_version: version ?? "unknown",
                });
              }}
            >
              <Button
                size="lg"
                className="bg-[#0096ff] hover:bg-blue-600 text-black shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="mr-2 h-5 w-5" /> Get Sparkle Now
              </Button>
            </a>
          )}
        </div>

        <p className="text-sm text-orange-400 mt-10 text-center font-medium">
          ⚠️ Currently in Beta - Please report any issues on{" "}
          <a
            href="https://github.com/parcoil/sparkle"
            className="text-blue-500"
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
