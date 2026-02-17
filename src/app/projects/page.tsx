import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Globe,
  Download,
  Code,
  Gamepad2,
  Sparkles,
  ExternalLink,
  Crosshair,
} from "lucide-react";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export const metadata = {
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
  const projects = [
    {
      name: "Sparkle",
      description:
        "A powerful Windows Optimization App that helps Debloat Windows and improve system performance. open-source and regularly updated.",
      repo: "https://github.com/parcoil/Sparkle",
      download: "/sparkle",
      site: "/sparkle",
      icon: <Sparkles size={24} />,
      category: "software",
      tags: ["Windows", "Optimization"],
      featured: true,
    },
    {
      name: "Dotline",
      description: "A modern crosshair overlay app for Windows/Linux",
      repo: "https://github.com/parcoil/dotline",
      download: "/dotline",
      site: "/dotline",
      icon: <Crosshair size={24} />,
      category: "software",
      tags: ["Windows", "Overlay", "Linux"],
      featured: true,
    },
    {
      name: "Lunaar.org",
      description: "An proxy/unblocked games website with 300+games.",
      repo: "https://github.com/Parcoil/lunaar.org",
      icon: <Gamepad2 size={24} />,
      site: "https://lunaar.org",
      category: "website",
      tags: ["Games", "Web"],
      featured: true,
    },
    {
      name: "Cloakjs",
      description:
        "A lightweight JavaScript library for creating tab cloaks on websites. Helps users bypass content blockers.",
      repo: "https://github.com/Parcoil/Cloak",
      icon: <Code size={24} />,
      category: "library",
      tags: ["JavaScript", "Privacy"],
      featured: true,
    },

    {
      name: "Starlight",
      description: "A unblocked games site with a great UI made with react",
      repo: "https://github.com/Parcoil/starlight",
      icon: <Gamepad2 size={24} />,
      site: "https://gostarlight.xyz",
      category: "website",
      tags: ["Games", "Web"],
    },
  ];

  const categories = {
    featured: "Featured Projects",
    library: "Libraries & Frameworks",
    website: "Websites & Web Apps",
    software: "Desktop Software",
  };
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our projects and tools. Most projects are freely available
            on GitHub and maintained by the Parcoil team.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter((project) => project.featured)
              .map((project, index) => (
                <Card
                  key={index}
                  className="flex flex-col h-full transition-all duration-200 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {project.icon}
                        </div>
                        <h3 className="text-xl font-bold">{project.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        {project.tags &&
                          project.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grow">
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 flex-wrap">
                    {project.repo && (
                      <Link
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="secondary"
                          className="w-full"
                          size="sm"
                        >
                          <Github className="mr-2" size={16} />
                          GitHub
                        </Button>
                      </Link>
                    )}
                    {project.site && (
                      <Link
                        href={project.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full" size="sm">
                          <Globe className="mr-2" size={16} />
                          Visit Site
                        </Button>
                      </Link>
                    )}
                    {project.download && (
                      <Link href={project.download} className="flex-1">
                        <Button className="w-full" size="sm">
                          <Download className="mr-2" size={16} />
                          Download
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>

        {Object.entries(categories)
          .filter(([categoryId]) => categoryId !== "featured")
          .map(([categoryId, categoryName]) => {
            const categoryProjects = projects.filter(
              (project) => project.category === categoryId
            );
            if (categoryProjects.length === 0) return null;

            return (
              <div key={categoryId} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                  {categoryName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProjects.map((project, index) => (
                    <Card
                      key={index}
                      className="flex flex-col h-full transition-all duration-200 hover:shadow-lg"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              {project.icon}
                            </div>
                            <h3 className="text-xl font-bold">
                              {project.name}
                            </h3>
                          </div>
                          <div className="flex gap-1">
                            {project.tags &&
                              project.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grow">
                        <p className="text-muted-foreground">
                          {project.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex gap-2 flex-wrap">
                        {project.repo && (
                          <Link
                            href={project.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="secondary"
                              className="w-full"
                              size="sm"
                            >
                              <Github className="mr-2" size={16} />
                              GitHub
                            </Button>
                          </Link>
                        )}
                        {project.site && (
                          <Link
                            href={project.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Globe className="mr-2" size={16} />
                              Visit Site
                            </Button>
                          </Link>
                        )}
                        {project.download && (
                          <Link href={project.download} className="flex-1">
                            <Button className="w-full" size="sm">
                              <Download className="mr-2" size={16} />
                              Download
                            </Button>
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

        <div className="mt-12 text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Interested in Contributing?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Our projects are open-source and welcome contributions. Check out
            our GitHub repositories to get started, report issues, or submit
            pull requests.
          </p>
          <Link
            href="https://github.com/Parcoil"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="group">
              <Github className="mr-2" size={18} />
              Visit Our GitHub
              <ExternalLink
                size={14}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}

export default page;
