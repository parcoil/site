export type Project = {
  name: string;
  description: string;
  repo: string;
  download?: string;
  site: string;
  logo: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    name: "Sparkle",
    description:
      "A Windows Optimization App that helps Debloat Windows and improve system performance. Open-source and regularly updated.",
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

export const getProjectHref = (project: Project) =>
  project.download || project.site;
