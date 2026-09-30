import Image from "next/image";
import Link from "next/link";
import { Download, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProjectHref, type Project } from "@/lib/projects";
import { GithubIcon } from "@/components/Githubicon";

function ProjectCard({
  project,
  minimal = false,
}: {
  project: Project;
  minimal?: boolean;
}) {
  const href = getProjectHref(project);

  if (minimal) {
    return (
      <Link href={href} className="group block h-full">
        <Card className="flex h-full items-center gap-4 p-5 transition-shadow duration-200 group-hover:shadow-md">
          <div className="shrink-0 rounded-lg bg-background border p-2">
            <Image
              src={project.logo}
              alt={`${project.name} logo`}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
        </Card>
      </Link>
    );
  }

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
                <GithubIcon size={16} />
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

export default ProjectCard;
