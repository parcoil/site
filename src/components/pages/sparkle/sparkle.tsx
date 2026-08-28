"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Download,
  Shield,
  ChevronDown,
  Star,
  Box,
  LayoutGrid,
  Trash2,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CodeTabs } from "@/components/code-tabs";
import AdBanner from "@/components/AdBanner";
import { ReactLenis } from "lenis/react";
import Script from "next/script";
import posthog from "posthog-js";
import { sendGAEvent } from "@next/third-parties/google";

const faqs = [
  {
    question: "Is Sparkle safe to use?",
    answer:
      "Yes! Sparkle only makes reversible changes. You can create system restore points before applying any tweaks.",
  },
  {
    question: "Which versions of Windows are supported?",
    answer: "Sparkle supports Windows 10 and 11.",
  },
  {
    question: "Can I undo changes made by Sparkle?",
    answer:
      "Yes, all tweaks are reversible. You can either use Sparkle's built-in restore option or a system restore point.",
  },
  {
    question: "Do I need an internet connection to use Sparkle?",
    answer:
      "The auto-updates require an internet connection. Most other features should work offline.",
  },
  {
    question: "How often is Sparkle updated?",
    answer:
      "Sparkle is actively maintained, with new features, versions and bug fixes released regularly. Check GitHub or here for the latest version.",
  },
  {
    question: "What should I do if I encounter an error?",
    answer:
      "Visit our GitHub Issues page to report bugs or join our Discord server for support.",
  },
  {
    question: "Why does Sparkle ask for admin permissions?",
    answer:
      "Admin permissions are required to apply system-level tweaks and optimizations and using/creating restore points.",
  },
  {
    question: "Why am i forced to update sparkle each time i open it?",
    answer:
      "Sparkle automatically checks for updates on launch. If an update is available, it will prompt you to update before continuing. The reason for this is microsoft is changeing windows rapidly and some tweaks may stop working or cause issues if not updated. By enforcing updates, we can ensure users have the best experience and avoid potential bugs from outdated versions.",
  },
  {
    question: "Why am i seeing ads on the website?",
    answer:
      "To keep Sparkle free and open-source, we rely on ad revenue to cover hosting and development costs. We use non-intrusive ads that do not affect your experience on the site. If you find the ads disruptive, consider supporting us on GitHub or sharing Sparkle with friends!",
  },
];

const features = [
  {
    title: "Debloat Windows",
    description:
      "Removes unnecessary Windows features and apps to free up resources and improve performance.",
    icon: Star,
    iconColor: "text-teal-500",
  },
  {
    title: "Apply Tweaks",
    description:
      "Apply various tweaks to debloat windows, disable game bar, enable detailed bsod And more ",
    icon: Wrench,
    iconColor: "text-pink-500",
  },
  {
    title: "Clean Temporary Files",
    description:
      "Remove temporary files, caches, and logs to free up valuable disk space.",
    icon: Trash2,
    iconColor: "text-yellow-500",
  },
  {
    title: "Safe & Reversible",
    description:
      "All changes can be easily undone with system restore points or by reverting settings.",
    icon: Shield,
    iconColor: "text-red-500",
  },
  {
    title: "App Installer",
    description:
      "Quickly install your favorite applications using winget or chocolatey without leaving Sparkle.",
    icon: LayoutGrid,
    iconColor: "text-blue-500",
  },
  {
    title: "System Utilities",
    description:
      "Run essential system tools like SFC, Check Disk, and DISM from a simple, intuitive interface.",
    icon: Box,
    iconColor: "text-green-500",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/Parcoil/Sparkle/releases/latest",
    );
    if (!res.ok) throw new Error("Failed to fetch release");
    const release = await res.json();

    const setupAsset = release.assets.find((asset) =>
      asset.name.endsWith("-setup.exe"),
    );

    const portableAsset = release.assets.find((asset) =>
      asset.name.endsWith("-win.zip"),
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
      "https://api.github.com/repos/Parcoil/Sparkle/releases",
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
  const [version, setVersion] = useState("");
  const [downloads, setDownloads] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [portableUrl, setPortableUrl] = useState("");
  const [showMovedAlert, setShowMovedAlert] = useState(false);
  const [logoKey, setLogoKey] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("ref") === "parcoil-sparkle-page") {
        setShowMovedAlert(true);
      }
    }

    getLatestRelease().then((data) => {
      setVersion(data.version ?? "");
      setDownloadUrl(data.downloadUrl);
      setPortableUrl(data.portableUrl ?? "");
    });

    getTotalDownloads().then((total) => {
      if (total !== null) {
        setDownloads(total.toLocaleString("en-US"));
      }
    });
  }, []);

  function handleDownload(type: "exe" | "zip") {
    const url = type === "exe" ? downloadUrl : portableUrl;
    if (!url || typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
    posthog.capture("sparkle_download_button", {
      download_type: type,
      location: "hero",
      app_version: version || "unknown",
    });
    sendGAEvent("event", "sparkle_download_button", {
      value: type === "exe" ? "homepage_button_exe" : "homepage_button_zip",
      app_version: version || "unknown",
    });
  }

  const replayLogoAnimation = () => {
    setLogoKey((prev) => prev + 1);
  };

  const installMethods = [
    {
      label: "PowerShell",
      value: "powershell",
      code: "irm https://getsparkle.net/get | iex",
    },
    {
      label: "Chocolatey",
      value: "chocolatey",
      code: "choco install sparkle --version=2.13.0",
    },
  ];

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1565760898646999"
        crossOrigin="anonymous"
      />
      <ReactLenis root />
      <div className="mt-10 flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center">
          {showMovedAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 mb-6 w-full max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-card-foreground"
            >
              Hello Parcoil user, Sparkle has moved to getsparkle.net
            </motion.div>
          )}
          <motion.img
            key={logoKey}
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            onClick={replayLogoAnimation}
            src="/sparklelogo.png"
            alt="Sparkle Logo"
            className="mb-6 h-20 w-20 cursor-pointer sm:h-24 sm:w-24"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-4"
          >
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.35 }}
              className="mb-4 text-center text-4xl font-medium sm:text-5xl md:text-7xl"
            >
              Take control of your PC.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.35, delay: 0.06 }}
              className="text-center text-base text-muted-foreground sm:text-lg"
            >
              Open-Source tool to optimize Windows and boost gaming performance
              <br />
              and enhance privacy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-6 flex flex-col items-center space-y-2 text-center sm:flex-row sm:space-y-0 sm:space-x-8 sm:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center space-x-2"
            >
              <p className="text-sm font-medium text-muted-foreground">
                Latest Version{" "}
                <motion.span
                  key={version}
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="font-semibold text-primary"
                >
                  {version || "..."}
                </motion.span>
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="flex items-center space-x-2"
            >
              <p className="text-sm font-medium text-muted-foreground">
                Downloads{" "}
                <motion.span
                  key={downloads}
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.06,
                  }}
                  className="font-semibold text-primary"
                >
                  {downloads || "..."}
                </motion.span>
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="hidden w-full flex-col justify-center space-y-2 sm:flex sm:w-auto sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.12 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-center sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full sm:w-56" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleDownload("exe")}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Installer (.exe)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload("zip")}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Portable (.zip)</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="mt-4 flex flex-col items-center justify-center space-y-2 px-4 text-center sm:hidden"
          >
            <p className="text-sm font-semibold text-primary">
              Please visit this page on a Windows PC to download Sparkle
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.24 }}
            className="mt-4 text-sm text-muted-foreground select-none"
          >
            CLI Install:
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <CodeTabs
              tabs={installMethods}
              className="w-full sm:w-sm gap-0 mt-4 z-40!"
            />
          </motion.div>

          <div className="relative w-full max-w-5xl flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="absolute inset-0 dark:bg-accent/20 bg-primary/30 blur-3xl rounded-full -z-10"
            />
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              whileHover={{ scale: 1.05 }}
              src="/showcase.png"
              alt="Sparkle app showcase"
              className="mt-6 aspect-video w-full max-w-full rounded-md border-2 border-primary transition-all duration-300 sm:max-w-200 dark:border-accent relative z-10"
            />
          </div>

          <div className="w-full py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Features
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Powerful Tweaks to optimize your Windows experience
                </p>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                  >
                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/20 h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <motion.div
                          transition={{ duration: 0.3 }}
                          className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/40 text-primary"
                        >
                          <feature.icon
                            className={`h-5 w-5 ${feature.iconColor}`}
                          />
                        </motion.div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-semibold">
                            {feature.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="mt-2 text-xs text-muted-foreground">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
              <p className="text-center text-sm font-medium mt-3 mb-3 text-muted-foreground">
                With more features in the app{" "}
              </p>
            </div>

            <div className="flex justify-center">
              <AdBanner />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                  FAQs
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Frequently Asked Questions
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <Accordion type="single" className="mt-6 space-y-2" collapsible>
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={faq.question}
                      variants={fadeInUp}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                    >
                      <AccordionItem value={faq.question}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            </div>

            <div className="flex justify-center">
              <AdBanner />
            </div>

            <div className="flex justify-center">
              <AdBanner />
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
:root {
  --background: oklch(0.9751 0.0127 244.2507);
  --foreground: oklch(0.2705 0.0457 249.8541);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2705 0.0457 249.8541);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2705 0.0457 249.8541);
  --primary: oklch(0.6602 0.1878 250.1786);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.9179 0.0403 254.0389);
  --secondary-foreground: oklch(0.3503 0.0828 251.4412);
  --muted: oklch(0.9506 0.0172 248.0089);
  --muted-foreground: oklch(0.5639 0.039 248.5213);
  --accent: oklch(0.9111 0.0467 243.3949);
  --accent-foreground: oklch(0.2705 0.0457 249.8541);
  --destructive: oklch(0.6861 0.2061 14.9941);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.903 0.0261 248.1176);
  --input: oklch(0.903 0.0261 248.1176);
  --ring: oklch(0.6602 0.1878 250.1786);
  --chart-1: oklch(0.6602 0.1878 250.1786);
  --chart-2: oklch(0.6755 0.1765 252.2592);
  --chart-3: oklch(0.7469 0.1352 250.366);
  --chart-4: oklch(0.828 0.0898 248.9586);
  --chart-5: oklch(0.522 0.1771 255.8297);
  --sidebar: oklch(0.9506 0.0172 248.0089);
  --sidebar-foreground: oklch(0.2705 0.0457 249.8541);
  --sidebar-primary: oklch(0.6602 0.1878 250.1786);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.9111 0.0467 243.3949);
  --sidebar-accent-foreground: oklch(0.2705 0.0457 249.8541);
  --sidebar-border: oklch(0.903 0.0261 248.1176);
  --sidebar-ring: oklch(0.6602 0.1878 250.1786);
  --font-sans: Poppins, sans-serif;
  --font-serif: Poppins, ui-sans-serif, sans-serif, system-ui;
  --font-mono: Fira Code, ui-monospace, monospace;
  --radius: 0.675rem;
  --shadow-2xs: 0px 4px 10px 0px hsl(240 30% 25% / 0.06);
  --shadow-xs: 0px 4px 10px 0px hsl(240 30% 25% / 0.06);
  --shadow-sm: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12);
  --shadow: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12);
  --shadow-md: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 2px 4px -1px hsl(240 30% 25% / 0.12);
  --shadow-lg: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 4px 6px -1px hsl(240 30% 25% / 0.12);
  --shadow-xl: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 8px 10px -1px hsl(240 30% 25% / 0.12);
  --shadow-2xl: 0px 4px 10px 0px hsl(240 30% 25% / 0.3);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark, .oled {
  --background: oklch(0.1801 0.0191 255.7673);
  --foreground: oklch(0.9219 0.0231 258.3605);
  --card: oklch(0.241 0.0306 256.8678);
  --card-foreground: oklch(0.9219 0.0231 258.3605);
  --popover: oklch(0.241 0.0306 256.8678);
  --popover-foreground: oklch(0.9219 0.0231 258.3605);
  --primary: oklch(0.6602 0.1878 250.1786);
  --primary-foreground: oklch(0.1801 0.0191 255.7673);
  --secondary: oklch(0.31 0.0445 249.4384);
  --secondary-foreground: oklch(0.8516 0.0529 248.4481);
  --muted: oklch(0.2759 0.0409 260.3189);
  --muted-foreground: oklch(0.6643 0.0375 248.3916);
  --accent: oklch(0.3509 0.0612 253.8448);
  --accent-foreground: oklch(0.9219 0.0231 258.3605);
  --destructive: oklch(0.6861 0.2061 14.9941);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.2836 0.0451 259.1754);
  --input: oklch(0.354 0.0586 258.2773);
  --ring: oklch(0.6602 0.1878 250.1786);
  --chart-1: oklch(0.6602 0.1878 250.1786);
  --chart-2: oklch(0.669 0.1837 248.8066);
  --chart-3: oklch(0.6755 0.1765 252.2592);
  --chart-4: oklch(0.7469 0.1352 250.366);
  --chart-5: oklch(0.828 0.0898 248.9586);
  --sidebar: oklch(0.241 0.0306 256.8678);
  --sidebar-foreground: oklch(0.9219 0.0231 258.3605);
  --sidebar-primary: oklch(0.6602 0.1878 250.1786);
  --sidebar-primary-foreground: oklch(0.1801 0.0191 255.7673);
  --sidebar-accent: oklch(0.3509 0.0612 253.8448);
  --sidebar-accent-foreground: oklch(0.9219 0.0231 258.3605);
  --sidebar-border: oklch(0.354 0.0586 258.2773);
  --sidebar-ring: oklch(0.6602 0.1878 250.1786);
  --font-sans: Poppins, sans-serif;
  --font-serif: Poppins, ui-sans-serif, sans-serif, system-ui;
  --font-mono: Fira Code, ui-monospace, monospace;
  --radius: 0.675rem;
  --shadow-2xs: 0px 4px 10px 0px hsl(240 30% 25% / 0.06);
  --shadow-xs: 0px 4px 10px 0px hsl(240 30% 25% / 0.06);
  --shadow-sm: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12);
  --shadow: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12);
  --shadow-md: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 2px 4px -1px hsl(240 30% 25% / 0.12);
  --shadow-lg: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 4px 6px -1px hsl(240 30% 25% / 0.12);
  --shadow-xl: 0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 8px 10px -1px hsl(240 30% 25% / 0.12);
  --shadow-2xl: 0px 4px 10px 0px hsl(240 30% 25% / 0.3);
}
        `}
      </style>
    </>
  );
}
