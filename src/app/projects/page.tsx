import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import { GithubIcon } from "@/components/Githubicon";

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
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
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
              <GithubIcon size={18} />
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
