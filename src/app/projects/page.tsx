import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Globe, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Projects | Parcoil",
  description: "Explore projects created by Parcoil",
  keywords: [
    "projects",
    "open source",
    "github",
    "Parcoil",
    "web development",
    "tools",
  ],
};

const projects = [
  {
    name: "Sparkle",
    description:
      "A powerful Windows Optimization App that helps Debloat Windows and improve system performance. Open-source and regularly updated.",
    repo: "https://github.com/parcoil/Sparkle",
    download: "/sparkle",
    site: "/sparkle",
    logo: "/sparklelogo.png",
    tags: ["Windows", "Optimization"],
  },
  {
    name: "Dotline",
    description: "A modern crosshair overlay app for Windows/Linux",
    repo: "https://github.com/parcoil/dotline",
    download: "/dotline",
    site: "/dotline",
    logo: "/projects/dotline.png",
    tags: ["Windows", "Overlay", "Linux"],
  },
  {
    name: "Lunaar.org",
    description: "An proxy/unblocked games website with 300+ games.",
    repo: "https://github.com/Parcoil/lunaar.org",
    site: "https://lunaar.org",
    logo: "/projects/lunaar.svg",
    tags: ["Games", "Web"],
  },
];

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <Card className="flex flex-col h-full transition-shadow duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-background border">
            <Image
              src={project.logo}
              alt={`${project.name} logo`}
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold leading-tight">
            {project.name}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="grow flex flex-col gap-4 pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-auto">
          {project.repo && (
            <Link
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full" size="sm">
                <Github size={16} />
                Repo
              </Button>
            </Link>
          )}
          {project.site && (
            <Link
              href={project.site}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full" size="sm">
                <Globe size={16} />
                Visit
              </Button>
            </Link>
          )}
          {project.download && (
            <Link href={project.download} className="w-full">
              <Button className="w-full" size="sm">
                <Download size={16} />
                Download
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function page() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-16 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Our Projects
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Open-source software and tools maintained by the Parcoil team. Most
            are freely available on GitHub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>

        <div className="mt-5 border rounded-xl p-8 text-center bg-card">
          <h2 className="text-2xl font-bold mb-2">
            Interested in Contributing?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Our projects welcome contributions. Check out our GitHub to get
            started, report issues, or submit pull requests.
          </p>
          <Link
            href="https://github.com/Parcoil"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              <Github size={18} />
              Visit Our GitHub
            </Button>
          </Link>
        </div>

        <div className="mt-16">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}

export default page;
