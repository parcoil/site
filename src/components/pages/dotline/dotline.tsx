"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";
import {
  Download,
  ExternalLink,
  Check,
  X,
  Palette,
  Layers,
  Settings,
  Share,
} from "lucide-react";
import posthog from "posthog-js";
import Script from "next/script";

const BASE_PATH = "/dotline";
const FALLBACK_URL = "https://github.com/Parcoil/dotline/releases/latest";
const GITHUB_URL = "https://github.com/Parcoil/dotline";
const DISCORD_URL = "https://discord.com/invite/En5YJYWj3Z";

const FEATURES = [
  {
    icon: Palette,
    title: "Full Customization",
    description:
      "Adjust color, opacity, thickness, length, gap, rotation, outlines, and center dots.",
  },
  {
    icon: Layers,
    title: "Built-in Presets",
    description:
      "10+ community presets like Green Classic, Tactical Orange, and Sniper Blue ready to use.",
  },
  {
    icon: Settings,
    title: "Crosshair Editor",
    description:
      "A dedicated editor with live preview, library management, and import/export via .dotline files.",
  },
  {
    icon: Share,
    title: "Share Crosshairs with Others",
    description:
      "Export your crosshair setup and share it with friends or the community.",
  },
];

const GAMES = [
  { name: "CS2", image: "/dotline/cs2.jpg" },
  { name: "Rust", image: "/dotline/rust.png" },
  { name: "Marvel Rivals", image: "/dotline/marvelrivals.webp" },
  { name: "Minecraft", image: "/dotline/minecraft.png" },
];

type OS = "windows" | "linux" | "macos";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "windows";
}

interface GitHubData {
  version: string | null;
  downloads: number | null;
  windowsUrl: string | null;
  linuxAppImage: string | null;
  linuxDeb: string | null;
}

async function getGitHubData(): Promise<GitHubData> {
  try {
    const [latest, releases] = await Promise.all([
      fetch(
        "https://api.github.com/repos/Parcoil/dotline/releases/latest",
      ).then((r) => r.json()),
      fetch(
        "https://api.github.com/repos/Parcoil/dotline/releases?per_page=100",
      ).then((r) => r.json()),
    ]);

    const downloads = Array.isArray(releases)
      ? releases.reduce(
          (sum, release) =>
            sum +
            release.assets.reduce(
              (s, asset) =>
                asset.name.endsWith(".yml") || asset.name.endsWith(".blockmap")
                  ? s
                  : s + asset.download_count,
              0,
            ),
          0,
        )
      : 0;

    const findAsset = (ext: string) =>
      latest.assets?.find((asset) => asset.name.endsWith(ext))
        ?.browser_download_url ?? null;

    return {
      version: latest.tag_name ?? null,
      downloads,
      windowsUrl: findAsset(".exe"),
      linuxAppImage: findAsset(".AppImage"),
      linuxDeb: findAsset(".deb"),
    };
  } catch {
    return {
      version: null,
      downloads: null,
      windowsUrl: null,
      linuxAppImage: null,
      linuxDeb: null,
    };
  }
}

function DotlineLogo({ className }: { className?: string }) {
  return (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      className={className}
      aria-hidden="true"
    >
      <style>{`.a{stroke:currentColor;stroke-width:10}.b{fill:none;stroke:currentColor;stroke-width:10}`}</style>
      <g>
        <path className="a" d="m50 1v34z" />
        <path className="a" d="m50 65v35z" />
        <path className="a" d="m35 50h-35z" />
        <path className="a" d="m100 50h-35z" />
        <path
          fillRule="evenodd"
          className="b"
          d="m50 83c-18.2 0-33-14.8-33-33 0-18.2 14.8-33 33-33 18.2 0 33 14.8 33 33 0 18.2-14.8 33-33 33z"
        />
      </g>
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function WindowsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 128" {...props}>
      <path
        fill="currentColor"
        d="M67.328 67.331h60.669V128H67.328zm-67.325 0h60.669V128H.003zM67.328 0h60.669v60.669H67.328zM.003 0h60.669v60.669H.003z"
      />
    </svg>
  );
}

function LinuxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M113.823 104.595c-1.795-1.478-3.629-2.921-5.308-4.525-1.87-1.785-3.045-3.944-2.789-6.678.147-1.573-.216-2.926-2.113-3.452.446-1.154.864-1.928 1.033-2.753.188-.92.178-1.887.204-2.834.264-9.96-3.334-18.691-8.663-26.835-2.454-3.748-5.017-7.429-7.633-11.066-4.092-5.688-5.559-12.078-5.633-18.981a47.564 47.564 0 00-1.081-9.475C80.527 11.956 77.291 7.233 71.422 4.7c-4.497-1.942-9.152-2.327-13.901-1.084-6.901 1.805-11.074 6.934-10.996 14.088.074 6.885.417 13.779.922 20.648.288 3.893-.312 7.252-2.895 10.34-2.484 2.969-4.706 6.172-6.858 9.397-1.229 1.844-2.317 3.853-3.077 5.931-2.07 5.663-3.973 11.373-7.276 16.5-1.224 1.9-1.363 4.026-.494 6.199.225.563.363 1.429.089 1.882-2.354 3.907-5.011 7.345-10.066 8.095-3.976.591-4.172 1.314-4.051 5.413.1 3.337.061 6.705-.28 10.021-.363 3.555.008 4.521 3.442 5.373 7.924 1.968 15.913 3.647 23.492 6.854 3.227 1.365 6.465.891 9.064-1.763 2.713-2.771 6.141-3.855 9.844-3.859 6.285-.005 12.572.298 18.86.369 1.702.02 2.679.653 3.364 2.199.84 1.893 2.26 3.284 4.445 3.526 4.193.462 8.013-.16 11.19-3.359 3.918-3.948 8.436-7.066 13.615-9.227 1.482-.619 2.878-1.592 4.103-2.648 2.231-1.922 2.113-3.146-.135-5zM62.426 24.12c.758-2.601 2.537-4.289 5.243-4.801 2.276-.43 4.203.688 5.639 3.246 1.546 2.758 2.054 5.64.734 8.658-1.083 2.474-1.591 2.707-4.123 1.868-.474-.157-.937-.343-1.777-.652.708-.594 1.154-1.035 1.664-1.382 1.134-.772 1.452-1.858 1.346-3.148-.139-1.694-1.471-3.194-2.837-3.175-1.225.017-2.262 1.167-2.4 2.915-.086 1.089.095 2.199.173 3.589-3.446-1.023-4.711-3.525-3.662-7.118zm-12.75-2.251c1.274-1.928 3.197-2.314 5.101-1.024 2.029 1.376 3.547 5.256 2.763 7.576-.285.844-1.127 1.5-1.716 2.241l-.604-.374c-.23-1.253-.276-2.585-.757-3.733-.304-.728-1.257-1.184-1.919-1.762-.622.739-1.693 1.443-1.757 2.228-.088 1.084.477 2.28.969 3.331.311.661 1.001 1.145 1.713 1.916l-1.922 1.51c-3.018-2.7-3.915-8.82-1.871-11.909zM87.34 86.075c-.203 2.604-.5 2.713-3.118 3.098-1.859.272-2.359.756-2.453 2.964a101.744 101.744 0 00-.012 7.753c.061 1.77-.537 3.158-1.755 4.393-6.764 6.856-14.845 10.105-24.512 8.926-4.17-.509-6.896-3.047-9.097-6.639.98-.363 1.705-.607 2.412-.894 3.122-1.27 3.706-3.955 1.213-6.277-1.884-1.757-3.986-3.283-6.007-4.892-1.954-1.555-3.934-3.078-5.891-4.629-1.668-1.323-2.305-3.028-2.345-5.188-.094-5.182.972-10.03 3.138-14.747 1.932-4.209 3.429-8.617 5.239-12.885.935-2.202 1.906-4.455 3.278-6.388 1.319-1.854 2.134-3.669 1.988-5.94-.084-1.276-.016-2.562-.016-3.843l.707-.352c1.141.985 2.302 1.949 3.423 2.959 4.045 3.646 7.892 3.813 12.319.67 1.888-1.341 3.93-2.47 5.927-3.652.497-.294 1.092-.423 1.934-.738 2.151 5.066 4.262 10.033 6.375 15 1.072 2.524 1.932 5.167 3.264 7.547 2.671 4.775 4.092 9.813 4.07 15.272-.012 2.83.137 5.67-.081 8.482z"
      />
    </svg>
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Discord</title>
      <path
        fill="currentColor"
        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
      />
    </svg>
  );
}

export default function DotlineClient() {
  const [github, setGithub] = useState<GitHubData | null>(null);
  const [os, setOs] = useState<OS>("windows");

  useEffect(() => {
    setOs(detectOS());
    getGitHubData().then(setGithub);
  }, []);

  const handleDownload = (format: string, url: string | null) => {
    if (!url) {
      window.open(FALLBACK_URL, "_blank", "noopener,noreferrer");
      return;
    }
    posthog.capture("download_clicked", {
      format,
      version: github?.version,
      url,
    });
    window.location.href = url;
  };

  const primaryUrl =
    os === "macos"
      ? "https://github.com/Parcoil/dotline#building-dotline"
      : os === "linux"
        ? (github?.linuxAppImage ?? FALLBACK_URL)
        : (github?.windowsUrl ?? FALLBACK_URL);
  const primaryLabel =
    os === "macos"
      ? "Build for macOS"
      : os === "linux"
        ? "Download for Linux"
        : "Download for Windows";
  const primaryFormat = os;

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1565760898646999"
        crossOrigin="anonymous"
      />
      <div className="flex min-h-screen flex-col">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.62_0.17_150/0.15),transparent)]" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-20 text-center md:pb-28">
            {github?.version && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
              >
                {github.version}
                <span className="h-3 w-px bg-primary/30" />
                {(github.downloads ?? 0).toLocaleString()} downloads
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mb-4 rounded-full bg-foreground p-4 dark:bg-logo"
            >
              <DotlineLogo className="text-logo dark:text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mb-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              A modern <span className="text-primary">crosshair overlay</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mb-8 max-w-xl text-lg text-muted-foreground md:text-xl"
            >
              Customize your crosshair with 5 styles, adjustable color, opacity,
              thickness, and more. Free, open-source, and cross-platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" asChild className="gap-2 px-6">
                <a
                  href={primaryUrl}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(primaryFormat, github ? primaryUrl : null);
                  }}
                >
                  {os === "linux" ? (
                    <LinuxIcon className="size-5" />
                  ) : os === "macos" ? (
                    <Download className="size-5" />
                  ) : (
                    <WindowsIcon className="size-5" />
                  )}
                  {primaryLabel}
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="gap-2 px-6"
              >
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <GithubIcon className="size-5" />
                  View on GitHub
                </a>
              </Button>
            </motion.div>
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              href="#download"
              className="mt-4 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              other downloads
            </motion.a>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl px-4 pb-20"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <img
              src="https://raw.githubusercontent.com/parcoil/dotline/refs/heads/main/images/appscreenshot.png"
              alt="Dotline app screenshot"
              className="w-full object-cover"
            />
          </div>
        </motion.section>

        <div className="mx-auto w-full max-w-6xl px-4 pb-20">
          <AdBanner />
        </div>

        <section
          id="features"
          className="border-t border-border bg-muted/30 px-4 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need
              </h2>
              <p className="mx-auto max-w-lg text-muted-foreground">
                Powerful customization in a lightweight, always-on-top overlay.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="games" className="px-4 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tested with popular games
              </h2>
              <p className="mb-10 text-muted-foreground">
                Works across a wide range of FPS and competitive titles.
              </p>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-3">
              {GAMES.map((game, index) => (
                <motion.div
                  key={game.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm"
                >
                  <img
                    src={`${BASE_PATH}${game.image}`}
                    alt={game.name}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  {game.name}
                </motion.div>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mt-8 text-sm text-muted-foreground"
            >
              And more - any game that allows windowed fullscreen mode.
            </motion.p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 pb-20">
          <AdBanner />
        </div>

        <section className="border-t border-border bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="mb-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                Dotline vs Others
              </h2>
              <p className="mb-10 text-center text-muted-foreground">
                A quick, high-level comparison to help you choose what fits your
                needs.
              </p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
                viewport={{ once: true }}
                className="rounded-xl border border-primary bg-card p-6 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-2">
                  <img
                    src="https://raw.githubusercontent.com/parcoil/dotline/refs/heads/main/resources/dotline.png"
                    alt="Dotline"
                    width={28}
                    height={28}
                  />
                  <span className="text-lg font-semibold">Dotline</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Open Source
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Community-driven, free
                </p>
                <ul className="mb-6 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Free &amp; open source
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Windows, Linux &amp; macOS
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    In-app crosshair editor
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    10+ presets with deep customization
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Import/Export configurations
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    No ads
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Portable and installer builds
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Auto updates
                  </li>
                </ul>
                <Button className="w-full gap-2" asChild>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="size-4" />
                    View on GitHub
                  </a>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-2">
                  <img
                    src="https://store-images.s-microsoft.com/image/apps.28166.14083481012137053.8dd52c3f-852b-4b54-a82f-7927fdfb0143.fb58a0a2-9434-4c2b-a457-a47de9656f83"
                    alt="Crosshair X"
                    width={28}
                    height={28}
                  />
                  <span className="text-lg font-semibold">Crosshair X</span>
                  <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                    Commercial
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Proprietary, distributed via Steam
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Paid software (proprietary)
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Only Windows support via Steam
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    Preset library and in-app editor
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Not open source
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    No ads
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Requires Steam for distribution
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-2">
                  <img
                    src="https://store-images.s-microsoft.com/image/apps.14369.13899847573165032.36bcfc47-3b27-4d4a-a723-9193b65b9ef2.92da79b2-055e-4c1b-98c6-f4d5a57e5acd"
                    alt="Crosshair v2"
                    width={28}
                    height={28}
                  />
                  <span className="text-lg font-semibold">Crosshair v2</span>
                  <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                    Commercial
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Proprietary, distributed via Steam
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Paid software (proprietary)
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Only Windows support via Steam
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Small preset library, no editor
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Not open source
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    No ads
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    Requires Steam for distribution
                  </li>
                </ul>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mt-6 text-center text-xs text-muted-foreground"
            >
              Crosshair X, Crosshair v2, and Dotline are separate, third-party
              products. Dotline is not affiliated with or endorsed by Crosshair
              X or Crosshair v2.
            </motion.p>
          </div>
        </section>

        <section
          id="download"
          className="border-t border-border bg-muted/30 px-4 py-20"
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Get dotline
              </h2>
              <p className="mb-10 text-muted-foreground">
                Free and open-source. Available on Windows, Linux, and macOS.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-1 font-semibold">Windows</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Installer &amp; portable
                </p>
                <Button
                  className="w-full gap-2"
                  asChild
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload("windows", github?.windowsUrl ?? null);
                  }}
                >
                  <a
                    href={github?.windowsUrl ?? FALLBACK_URL}
                    rel="noopener noreferrer"
                  >
                    <Download className="size-4" />
                    Download
                  </a>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-1 font-semibold">Linux</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  AppImage &amp; .deb
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full gap-2"
                    asChild
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload("appImage", github?.linuxAppImage ?? null);
                    }}
                  >
                    <a
                      href={github?.linuxAppImage ?? FALLBACK_URL}
                      rel="noopener noreferrer"
                    >
                      <Download className="size-4" />
                      AppImage
                    </a>
                  </Button>
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    asChild
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload("deb", github?.linuxDeb ?? null);
                    }}
                  >
                    <a
                      href={github?.linuxDeb ?? FALLBACK_URL}
                      rel="noopener noreferrer"
                    >
                      <Download className="size-4" />
                      .deb
                    </a>
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Arch Linux:{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs select-all">
                    yay -S dotline
                  </code>
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-1 font-semibold">macOS</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Build from source
                </p>
                <Button className="w-full gap-2" variant="outline" asChild>
                  <a
                    href="https://github.com/Parcoil/dotline#building-dotline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Instructions
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <AdBanner />
        </div>

        <p className="text-sm text-green-400 text-center font-medium mb-10">
          Currently in Alpha - Please report any issues on{" "}
          <a
            href={GITHUB_URL}
            className="text-primary underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
      <style>{`:root {
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
}

.oled {
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
}

.text-logo {
  color: oklch(0.7 0.19 150);
}

.bg-logo {
  background-color: oklch(0.7 0.19 150);
}`}</style>
    </>
  );
}
