import {
  Globe,
  LockKeyhole,
  File,
  QrCode,
  Palette,
  Type,
  LinkIcon,
  Code,
  Calculator,
  FileText,
  Key,
} from "lucide-react";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Free Online Tools | Password Generator, JSON Formatter & More | Parcoil",
  description: "Free online tools including password generator, base64 encoder, QR code generator, color picker, JSON formatter, URL encoder, hash generator, and more. No sign-up required.",
  keywords: [
    "online tools",
    "free tools",
    "password generator",
    "base64 encoder",
    "qr code generator",
    "json formatter",
    "color picker",
    "url encoder",
    "hash generator",
    "word counter",
    "unit converter",
    "uuid generator",
    "text converter",
  ],
};

const tools = [
  {
    name: "Password Generator",
    description: "Create strong, secure passwords with customizable options",
    link: "/tools/password-generator",
    icon: <LockKeyhole className="h-5 w-5" />,
  },
  {
    name: "Base64 Encoder",
    description: "Encode and decode text to Base64 format instantly",
    link: "/tools/base64",
    icon: <File className="h-5 w-5" />,
  },
  {
    name: "QR Code Generator",
    description: "Generate QR codes for URLs, text, and more",
    link: "/tools/qr-code",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    name: "Color Picker",
    description: "Pick colors and convert between HEX, RGB, HSL",
    link: "/tools/color-picker",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    link: "/tools/json-formatter",
    icon: <Code className="h-5 w-5" />,
  },
  {
    name: "URL Encoder",
    description: "Encode and decode URLs for safe transmission",
    link: "/tools/url-encoder",
    icon: <LinkIcon className="h-5 w-5" />,
  },
  {
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes",
    link: "/tools/hash-generator",
    icon: <LockKeyhole className="h-5 w-5" />,
  },
  {
    name: "IP Info",
    description: "View your public IP address and location details",
    link: "/tools/ip",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    name: "Unit Converter",
    description: "Convert length, weight, temperature, and volume",
    link: "/tools/unit-converter",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    name: "Word Counter",
    description: "Count words, characters, sentences, and lines",
    link: "/tools/word-counter",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: "Text Case Converter",
    description: "Convert text to uppercase, lowercase, camelCase, and more",
    link: "/tools/text-case-converter",
    icon: <Type className="h-5 w-5" />,
  },
  {
    name: "UUID Generator",
    description: "Generate random UUID v4 identifiers",
    link: "/tools/uuid-generator",
    icon: <Key className="h-5 w-5" />,
  },
];

export default function Page() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Free Online Tools</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A collection of free, simple, and useful online tools to help with everyday tasks. No sign-up required, and all tools work directly in your browser.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.link}
              className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {tool.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <section className="py-8 px-4 mt-8">
          <AdBanner />
        </section>

        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Free Online Developer Tools</h2>
          <p className="text-muted-foreground mb-4">
            Parcoil offers a collection of free online tools for developers, designers, and everyday users. 
            All tools run directly in your browser with no server-side processing, ensuring your data stays private.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Why Use Our Tools?</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>100% Free</strong> - No subscriptions, no hidden fees, no sign-up required</li>
            <li><strong>Privacy First</strong> - All processing happens locally in your browser</li>
            <li><strong>Fast & Reliable</strong> - No waiting for server responses, instant results</li>
            <li><strong>Mobile Friendly</strong> - Works great on desktop, tablet, and phone</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">Popular Tools</h3>
          <p className="text-muted-foreground">
            Our <strong>Password Generator</strong> creates strong, secure passwords with customizable length and character options. 
            The <strong>JSON Formatter</strong> helps developers beautify, minify, and validate JSON data instantly. 
            Use the <strong>QR Code Generator</strong> to create scannable codes for URLs, text, or contact information. 
            The <strong>Color Picker</strong> lets designers select and convert colors between HEX, RGB, and HSL formats.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Developer Utilities</h3>
          <p className="text-muted-foreground">
            For developers, we offer essential encoding and decoding tools including <strong>Base64 Encoder/Decoder</strong>, 
            <strong>URL Encoder/Decoder</strong>, and <strong>Hash Generator</strong> supporting MD5, SHA-1, SHA-256, and SHA-512 algorithms. 
            Generate unique identifiers with our <strong>UUID Generator</strong> or check your public IP address with <strong>IP Info</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
