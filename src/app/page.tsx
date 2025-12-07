import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import Sparklecta from "@/components/Sparklecta";
import { Metadata } from "next";
import {
  Crosshair,
  Moon,
  Sparkle,
  Star,
  ArrowRight,
  Terminal,
  Activity,
  Download,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";
import Logo from "@/components/logo";

export const metadata: Metadata = {
  title: "Home | Parcoil",
  description:
    "Open source software and tools by Parcoil. Explore our projects like Sparkle, Lunaar and more.",
};

const GridBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
  </div>
);

function Page() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <GridBackground />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 relative">
        <div className="max-w-5xl mx-auto z-10">
          <Sparklecta />

          <div className="items-center justify-center flex mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 dark:bg-primary rounded-full dark:blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                {/* <Image
                  src="/parcoil.png"
                  width={160}
                  height={160}
                  alt="Parcoil Logo"
                  className="transition-transform hover:scale-105 duration-300 drop-shadow-2xl"
                  priority
                /> */}
                <Logo className="w-[160px] h-[160px] text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Welcome to{" "}
            <span className="bg-primary bg-clip-text text-transparent">
              Parcoil
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
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
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full"
              >
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tools" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full "
              >
                Browse Tools
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <section className="border-y bg-muted/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Terminal className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Projects
                </span>
              </div>
              <span className="text-4xl font-bold tracking-tighter">5+</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Download className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Sparkle Downloads
                </span>
              </div>
              <span className="text-4xl font-bold tracking-tighter">80K+</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Free Tools
                </span>
              </div>
              <span className="text-4xl font-bold tracking-tighter">13</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Projects
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From system optimizers to unblocked browsing, explore our suite of
              active applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProjectCard
              icon={<Sparkle className="h-6 w-6" />}
              title="Sparkle"
              description="Open-source Windows optimizer with 30+ tweaks, restore point manager, and utilities."
            />
            <ProjectCard
              icon={<Moon className="h-6 w-6" />}
              title="Lunaar"
              description="Unblocked games site with built-in proxies to bypass school restrictions."
            />
            <ProjectCard
              icon={<Crosshair className="h-6 w-6" />}
              title="Dotline"
              description="A modern, customizable Crosshair Overlay built for Windows and Linux."
            />
            <ProjectCard
              icon={<Star className="h-6 w-6" />}
              title="Starlight"
              description="React-based unblocked games and proxy site."
            />
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm border bg-background/50">
          <AdBanner />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full transform -translate-y-1/2"></div>
          <div className="relative rounded-3xl bg-gradient-to-b from-primary/10 to-background border border-primary/20 p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkle className="w-64 h-64 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
              Join thousands of users optimizing their digital experience with
              Parcoil tools.
            </p>
            <div className="relative z-10">
              <Link href="/projects">
                <Button size="lg" className="text-lg h-14 px-8 rounded-full">
                  View All Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-muted-foreground/10 bg-background/60 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export default Page;
