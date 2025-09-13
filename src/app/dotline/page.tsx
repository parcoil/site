import React from "react";
import DotlineClient from "@/components/pages/dotline/dotline";

export const metadata = {
  title: "Dotline | Crosshair Overlay",
  description:
    "Dotline is a free, open-source crosshair overlay for Windows and Linux",
  keywords: [
    "crosshair overlay",
    "dotline",
    "windows",
    "linux",
    "overlay",
    "crosshair",
    "crosshairx",
    "crosshair x",
    "free",
    "open source",
  ],
  openGraph: {
    title: "Dotline | Crosshair Overlay",
    description:
      "Improve your aim with Dotline's customizable crosshair overlay",
    type: "website",
    url: "https://parcoil.com/dotline",
    images: [
      {
        url: "/dotlinebanner.png",
        width: 1200,
        height: 630,
        alt: "Dotline Crosshair Overlay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dotline - Crosshair Overlay",
    description:
      "Improve your aim with Dotline's customizable crosshair overlay",
    images: ["/dotlinebanner.png"],
  },
  canonical: "https://parcoil.com/dotline",
};

export default function Page() {
  return <DotlineClient />;
}
