import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  LockKeyhole,
  File,
  QrCode,
  Palette,
  Type,
  Search,
  ArrowRight,
  LinkIcon,
  Code,
  Shield,
  Calculator,
  FileText,
  Key,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Tools | Parcoil",
  description: "Free online tools to help with everyday tasks",
  keywords: [
    "tools",
    "utilities",
    "online tools",
    "free tools",
    "web tools",
    "Parcoil",
  ],
};
function page() {
  const tools = [
    {
      name: "Base64 Encoder/Decoder",
      description:
        "Encode and decode text to/from base64 format quickly and easily",
      link: "/tools/base64",
      icon: <File size={28} />,
      category: "encoding",
      tag: "Data",
      popular: true,
    },
    {
      name: "Password Generator",
      description:
        "Generate secure, random passwords with customizable options",
      link: "/tools/password-generator",
      icon: <LockKeyhole size={28} />,
      category: "security",
      tag: "Security",
      popular: true,
    },
    {
      name: "IP Info",
      description: "Get detailed information about your IP address and network",
      link: "/tools/ip",
      icon: <Globe size={28} />,
      category: "network",
      tag: "Network",
    },
    {
      name: "QR Code Generator",
      description:
        "Create QR codes for URLs or text that can be scanned with any device",
      link: "/tools/qr-code",
      icon: <QrCode size={28} />,
      category: "encoding",
      tag: "Media",
      popular: true,
    },
    {
      name: "Color Picker & Converter",
      description:
        "Select colors visually and convert between HEX, RGB, and HSL formats",
      link: "/tools/color-picker",
      icon: <Palette size={28} />,
      category: "design",
      tag: "Design",
      popular: true,
    },
    {
      name: "Text Case Converter",
      description:
        "Transform text between different case formats with a single click",
      link: "/tools/text-case-converter",
      icon: <Type size={28} />,
      category: "text",
      tag: "Text",
    },
    {
      name: "URL Encoder/Decoder",
      description:
        "Encode and decode URLs for safe transmission over the internet",
      link: "/tools/url-encoder",
      icon: <LinkIcon size={28} />,
      category: "encoding",
      tag: "Web",
    },
    {
      name: "JSON Formatter",
      description:
        "Format, validate, and minify JSON data for better readability",
      link: "/tools/json-formatter",
      icon: <Code size={28} />,
      category: "text",
      tag: "Data",
      popular: true,
    },
    {
      name: "Unit Converter",
      description:
        "Convert between different units of length, weight, and temperature",
      link: "/tools/unit-converter",
      icon: <Calculator size={28} />,
      category: "converter",
      tag: "Math",
      popular: true,
    },
    {
      name: "Word Counter",
      description:
        "Count words, characters, and lines in your text with real-time updates",
      link: "/tools/word-counter",
      icon: <FileText size={28} />,
      category: "text",
      tag: "Text",
    },
    {
      name: "UUID Generator",
      description:
        "Generate random UUIDs for unique identifiers in your applications",
      link: "/tools/uuid-generator",
      icon: <Key size={28} />,
      category: "generator",
      tag: "ID",
    },
  ];

  const categories = [
    { id: "all", name: "All Tools" },
    { id: "popular", name: "Popular" },
    { id: "text", name: "Text Tools" },
    { id: "encoding", name: "Encoding" },
    { id: "security", name: "Security" },
    { id: "design", name: "Design" },
    { id: "network", name: "Network" },
    { id: "converter", name: "Converters" },
    { id: "generator", name: "Generators" },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Free Online Tools</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of free, simple, and useful online tools to help with
            everyday tasks. No sign-up required, and all tools work directly in
            your browser.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="mb-4">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools
                  .filter((tool) =>
                    category.id === "all"
                      ? true
                      : category.id === "popular"
                      ? tool.popular
                      : tool.category === category.id
                  )
                  .map((tool) => (
                    <Card
                      key={tool.name}
                      className="flex flex-col h-full transition-all duration-200 hover:shadow-lg"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              {tool.icon}
                            </div>
                            <h2 className="text-xl font-bold">{tool.name}</h2>
                          </div>
                          <Badge variant="secondary">{tool.tag}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground">
                          {tool.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link href={tool.link} className="w-full">
                          <Button className="w-full group" size="sm">
                            Use Tool
                            <ArrowRight
                              size={16}
                              className="ml-2 transition-transform group-hover:translate-x-1"
                            />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
              </div>

              {category.id !== "all" &&
                tools.filter((tool) =>
                  category.id === "popular"
                    ? tool.popular
                    : tool.category === category.id
                ).length === 0 && (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No tools found
                    </h3>
                    <p className="text-muted-foreground">
                      There are no tools in this category yet.
                    </p>
                  </div>
                )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 w-full">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}

export default page;
