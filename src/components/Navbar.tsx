"use client";
import { useState } from "react";
import { Menu, X, PenToolIcon as Tools } from "lucide-react";
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
import { Badge } from "./ui/badge";
import Logo from "./logo";
import { GithubIcon } from "@/components/Githubicon";
import { featuredTools, listedTools, toolHref } from "@/lib/tools";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="w-48">
            <Link
              className="text-2xl font-bold hover:text-primary flex text-center items-center gap-2 transition-all"
              href={"/"}
            >
              <Logo className="w-12.5 h-12.5 text-primary" />
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
                    <ul className="grid gap-2 p-4 w-[500px] lg:w-[640px] grid-cols-[180px_1fr_1fr]">
                      <li className="row-span-4">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-primary/20 to-primary/50 p-6 no-underline outline-hidden focus:shadow-md"
                            href="/tools"
                          >
                            <Tools className="h-6 w-6 mb-2" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              All Tools
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Browse all {listedTools.length} of Parcoil&apos;s free tools.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {featuredTools.map((tool) => (
                        <li key={tool.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={toolHref(tool)}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none flex items-center">
                                <tool.icon className="h-4 w-4 mr-2 shrink-0" />
                                {tool.name}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {tool.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
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
                    <a href="/blog">Blog</a>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="/dotline">
                      Dotline <Badge variant="default">NEW</Badge>
                    </a>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="hidden md:inline-flex"
            >
              <a
                href="https://github.com/Parcoil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <GithubIcon className="h-4 w-4 text-foreground" />
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
        <div className="md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/projects" className="flex items-center">
                <GithubIcon className="h-5 w-5 mr-2" />
                Projects
              </a>
            </Button>

            <div className="space-y-1">
              <div className="flex items-center px-2 py-1">
                <Tools className="h-5 w-5 mr-2" />
                <span className="font-medium">Tools</span>
              </div>
              <div className="pl-4 border-l-2 border-muted space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/tools" onClick={closeMobileMenu}>
                    <Tools className="h-4 w-4 mr-2" />
                    All Tools
                  </Link>
                </Button>
                {featuredTools.map((tool) => (
                  <Button
                    key={tool.slug}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={toolHref(tool)} onClick={closeMobileMenu}>
                      <tool.icon className="h-4 w-4 mr-2" />
                      {tool.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/sparkle">Sparkle</a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/blog">Blog</a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/dotline">
                Dotline <Badge variant="default">NEW</Badge>
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a
                href="https://github.com/parcoil"
                className="flex items-center"
              >
                <GithubIcon className="h-5 w-5 mr-2" />
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
