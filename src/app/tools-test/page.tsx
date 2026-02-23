import { Button } from "@/components/ui/button";
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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tools | Parcoil",
  description: "Free online tools to help with everyday tasks",
};

const tools = [
  {
    name: "Password Generator",
    description: "Generate secure, random passwords",
    link: "/tools/password-generator",
    icon: <LockKeyhole className="h-5 w-5" />,
  },
  {
    name: "Base64 Encoder",
    description: "Encode and decode base64 format",
    link: "/tools/base64",
    icon: <File className="h-5 w-5" />,
  },
  {
    name: "QR Code Generator",
    description: "Create QR codes for URLs or text",
    link: "/tools/qr-code",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    name: "Color Picker",
    description: "Pick and convert colors",
    link: "/tools/color-picker",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    name: "JSON Formatter",
    description: "Format and validate JSON",
    link: "/tools/json-formatter",
    icon: <Code className="h-5 w-5" />,
  },
  {
    name: "URL Encoder",
    description: "Encode and decode URLs",
    link: "/tools/url-encoder",
    icon: <LinkIcon className="h-5 w-5" />,
  },
  {
    name: "Hash Generator",
    description: "Generate MD5, SHA hashes",
    link: "/tools/hash-generator",
    icon: <LockKeyhole className="h-5 w-5" />,
  },
  {
    name: "IP Info",
    description: "Get your IP address info",
    link: "/tools/ip",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    name: "Unit Converter",
    description: "Convert length, weight, temp",
    link: "/tools/unit-converter",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    name: "Word Counter",
    description: "Count words and characters",
    link: "/tools/word-counter",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: "Text Case Converter",
    description: "Transform text case formats",
    link: "/tools/text-case-converter",
    icon: <Type className="h-5 w-5" />,
  },
  {
    name: "UUID Generator",
    description: "Generate unique identifiers",
    link: "/tools/uuid-generator",
    icon: <Key className="h-5 w-5" />,
  },
];

export default function Page() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Free Tools</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simple, browser-based utilities. No sign-up required.
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
      </div>
    </div>
  );
}
