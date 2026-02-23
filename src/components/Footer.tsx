import Link from "next/link";
import { Github, Mail } from "lucide-react";
import Logo from "./logo";

function Footer() {
  const year = new Date().getFullYear();

  const links = {
    projects: [
      { label: "Sparkle", href: "/sparkle" },
      { label: "Dotline", href: "/dotline" },
      { label: "All Projects", href: "/projects" },
    ],
    tools: [
      { label: "Password Generator", href: "/tools/password-generator" },
      { label: "Base64 Encoder", href: "/tools/base64" },
      { label: "All Tools", href: "/tools" },
    ],
    info: [
      // { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  };

  return (
    <footer className="border-t bg-card">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold mb-3"
            >
              <Logo className="w-6 h-6 text-primary" />
              <span>Parcoil</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Open-source utilities and tools for everyone.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Parcoil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@parcoil.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Projects</h3>
            <ul className="space-y-2">
              {links.projects.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Tools</h3>
            <ul className="space-y-2">
              {links.tools.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Info</h3>
            <ul className="space-y-2">
              {links.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          &copy; {year} Parcoil. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
