import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Sparklecta from "@/components/Sparklecta";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import Logo from "@/components/logo";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Home | Parcoil",
  description:
    "Open source software and tools by Parcoil. Explore our projects like Sparkle, Dotline and more.",
};

// const GridBackground = () => (
//   <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]">
//     <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77 w-77 rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
//   </div>
// );

function Page() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* <GridBackground /> */}

      <main className="grow flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 relative border-b">
        <div className="max-w-5xl mx-auto z-10">
          {/* <Sparklecta /> */}

          <div className="items-center justify-center flex">
            <Logo className="w-30 h- text-primary" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Welcome to{" "}
            <span className="bg-primary bg-clip-text text-transparent">
              Parcoil
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-5 max-w-2xl mx-auto leading-relaxed">
            We build utilities and open-source projects designed to unblock the
            web or optimize your PC. Try{" "}
            <Link
              href="/sparkle"
              className="text-primary font-medium hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all"
            >
              Sparkle
            </Link>{" "}
            today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button>
                Explore Projects
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tools" className="w-full sm:w-auto">
              <Button variant="secondary">Browse Tools</Button>
            </Link>
          </div>
        </div>
      </main>

      <section className="px-4 pt-20 pb-16 relative border-b">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Projects
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Open-source software and tools maintained by the Parcoil team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.name} project={project} minimal />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button variant="outline">
                View All Projects
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-xs border bg-background/50">
          <AdBanner />
        </div>
      </section>
    </div>
  );
}

export default Page;
