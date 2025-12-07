"use client";
import { useState } from "react";
import {
  Menu,
  X,
  Github,
  LockKeyhole,
  PenToolIcon as Tools,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/theme-changer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { File } from "lucide-react";
import { Globe } from "lucide-react";
import Image from "next/image";
import { Badge } from "./ui/badge";
import Logo from "./logo";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="w-48">
            <Link
              className="text-2xl font-bold hover:text-primary flex text-center items-center gap-2 transition-all"
              href={"/"}
            >
              {/* <Image src="/parcoil.png" alt="Parcoil" width="50" height="50" /> */}
              <Logo className="w-[50px] h-[50px] text-primary" />
              Parcoil
            </Link>
          </div>

          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="/projects">Projects</a>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/50 p-6 no-underline outline-none focus:shadow-md"
                            href="/tools"
                          >
                            <Tools className="h-6 w-6 mb-2" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              All Tools
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Browse all of Parcoil's tools and utilities.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <a
                          href="/tools/password-generator"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center">
                            <LockKeyhole className="h-4 w-4 mr-2" />
                            Password Generator
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug ">
                            Create secure, customizable passwords
                          </p>
                        </a>
                      </li>
                      <li>
                        <a
                          href="/tools/base64"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center">
                            <File className="h-4 w-4 mr-2" />
                            Base64 Encode/Decode
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug ">
                            Simple Base64 tool
                          </p>
                        </a>
                      </li>
                      <li>
                        <a
                          href="/tools/ip"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            IP Info
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug ">
                            Simple IP Tool
                          </p>
                        </a>
                      </li>
                      {/* <li>
                        <a
                          href="/tools/packages"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Packages
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Reusable code libraries and components
                          </p>
                        </a>
                      </li> */}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="/sparkle">Sparkle</a>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="/dotline">
                      Dotline <Badge variant="default">NEW</Badge>
                    </a>
                  </Button>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="/about">About</a>
                  </Button>
                </NavigationMenuItem> */}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" className="hidden md:inline-flex">
              <a
                href="https://github.com/Parcoil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <ModeToggle />

            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/projects" className="flex items-center">
                <Github className="h-5 w-5 mr-2" />
                Projects
              </a>
            </Button>

            <div className="space-y-1">
              <div className="flex items-center px-2 py-1">
                <Tools className="h-5 w-5 mr-2" />
                <span className="font-medium">Tools</span>
              </div>
              <div className="pl-4 border-l-2 border-muted space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/tools" className="flex items-center">
                    <Tools className="h-4 w-4 mr-2" />
                    All Tools
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href="/tools/password-generator"
                    className="flex items-center"
                  >
                    <LockKeyhole className="h-4 w-4 mr-2" />
                    Password Generator
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/tools/base64" className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    Base64 Tools
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/tools/ip" className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    IP info
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  {/* <a href="/tools/packages" className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Packages
                  </a> */}
                </Button>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/sparkle">Sparkle</a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/dotline">
                Dotline <Badge variant="default">NEW</Badge>
              </a>
            </Button>
            {/* <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/about">About</a>
            </Button> */}
            <Button variant="outline" className="w-full justify-start" asChild>
              <a
                href="https://github.com/parcoil"
                className="flex items-center"
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
