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
import { Crosshair, Moon, Sparkle, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Home | Parcoil",
  description:
    "Open source software and tools by Parcoil. Explore our projects like Sparkle, Lunaar, Starlight, and more.",
};

function Page() {
  return (
    <div className="min-h-[89vh] flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Sparklecta />
          <div className="items-center justify-center flex mb-8">
            <div className="relative">
              <Image
                src="/parcoil.png"
                width={150}
                height={150}
                alt="Parcoil Logo"
                className="transition-transform hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl -z-10"></div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold mb-2 bg-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent/60 dark:text-primary">
            Welcome to Parcoil
          </h1>
          {/* will most likely add back soon */}
          {/* <div className="mb-4">
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 font-semibold"
            >
              Unblocking The Web
            </Badge>
          </div> */}

          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            We build tools/projects like{" "}
            <a href="https://getsparkle.net" className="text-primary underline">
              Sparkle
            </a>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/projects">
              <Button
                size="lg"
                className="text-lg px-8 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explore Projects
              </Button>
            </Link>
            <Link href="/tools">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 transition-all duration-300 transform hover:scale-105"
              >
                Browse Tools
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Active Projects
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Sparkle className="text-primary-foreground" />
                </div>
                <CardTitle>Sparkle</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Open-source Windows optimizer with 30+ tweaks, restore point
                  manager, WinGet installer, and system utilities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Moon className="text-primary-foreground" />
                </div>
                <CardTitle>Lunaar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Unblocked games site with built in proxies to bypass school
                  restrictions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Crosshair className="text-primary-foreground" />
                </div>
                <CardTitle>Dotline</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  A Modern Crosshair Overlay for Windows/Linux
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Star className="text-primary-foreground" />
                </div>
                <CardTitle>Starlight</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  React based unblocked games/proxy site with fast performance.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Stats</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">5</div>
                <div className="text-muted-foreground">Active Projects</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">60K+</div>
                <div className="text-muted-foreground">Sparkle Downloads</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">13</div>
                <div className="text-muted-foreground">Free Tools</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          {/* dont know what else to say */}
          <h2 className="text-4xl font-bold mb-6">Ready to Take Control?</h2>
          <p className="text-xl mb-8 opacity-90">
            View our collection of tools/projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4 transition-all duration-300 transform hover:scale-105"
              >
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
