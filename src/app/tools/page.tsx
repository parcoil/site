import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import BannerAd from "@/components/BannerAd";
import ToolsDirectory from "@/components/tools/ToolsDirectory";
import { listedTools } from "@/lib/tools";
import { SITE_URL, TOOL_BANNER_AD_KEY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Online Tools | Image Converter, Password Generator, JSON Formatter & More | Parcoil",
  description: `${listedTools.length}+ free online tools including an image converter, image compressor, password generator, QR code generator, JSON formatter, word counter, keyboard tester and more. Everything runs in your browser. No sign-up required.`,
  keywords: [
    "online tools",
    "free tools",
    "image converter",
    "image compressor",
    "password generator",
    "qr code generator",
    "json formatter",
    "word counter",
    "unit converter",
    "keyboard tester",
    "developer tools",
    "browser tools",
  ],
  alternates: { canonical: `${SITE_URL}/tools` },
};

export default function Page() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Free Online Tools</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A growing collection of {listedTools.length} free, simple and useful tools for
            everyday tasks. No sign-up required, and everything runs directly in your browser.
          </p>
        </div>

        <ToolsDirectory />

        <section className="py-8 px-4 mt-8">
          <AdBanner />
        </section>

        <section className="py-8 px-4 flex justify-center">
          <BannerAd adKey={TOOL_BANNER_AD_KEY} width={300} height={250} />
        </section>

        <section className="mt-12 max-w-3xl mx-auto prose dark:prose-invert">
          <h2>Free Online Tools That Respect Your Privacy</h2>
          <p>
            Parcoil offers a collection of free online tools for developers, designers, creators
            and everyday users. Almost every tool runs entirely in your browser with no
            server-side processing, so your files and data never leave your device.
          </p>

          <h3>Why Use Our Tools?</h3>
          <ul>
            <li>
              <strong>100% Free</strong> - No subscriptions, no hidden fees, no sign-up required
            </li>
            <li>
              <strong>Privacy First</strong> - Images, audio, video and text are processed
              locally in your browser and never uploaded
            </li>
            <li>
              <strong>Fast &amp; Reliable</strong> - No waiting for uploads or server queues
            </li>
            <li>
              <strong>Mobile Friendly</strong> - Works great on desktop, tablet, and phone
            </li>
          </ul>

          <h3>Image, Audio &amp; Video Converters</h3>
          <p>
            Convert images between PNG, JPG, WebP, AVIF, GIF, BMP and ICO, compress photos for
            the web, resize and crop images, strip EXIF metadata, make favicons, turn videos into
            GIFs and extract MP3 audio from video. Because conversion happens on your device, even
            large batches finish quickly and stay private.
          </p>

          <h3>Developer Utilities</h3>
          <p>
            Format JSON, convert JSON to CSV or YAML, decode JWTs, test regular expressions,
            generate hashes and UUIDs, encode Base64, URL and HTML entities, convert Unix
            timestamps, explain cron expressions and calculate subnets.
          </p>

          <h3>Device Tests</h3>
          <p>
            Check that your keyboard, mouse, gamepad, webcam, microphone and speakers work, find
            dead pixels, measure your monitor&apos;s refresh rate, and test your click speed,
            typing speed and reaction time.
          </p>
        </section>
      </div>
    </div>
  );
}
