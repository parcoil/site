import type { MetadataRoute } from "next";
import { getSortedPostsData } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { toolHref, tools } from "@/lib/tools";

const STATIC_PAGES = ["", "/tools", "/projects", "/sparkle", "/dotline", "/blog", "/contact", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = STATIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const toolPages = tools.map((tool) => ({
    url: `${SITE_URL}${toolHref(tool)}`,
    changeFrequency: "monthly" as const,
    priority: tool.hidden ? 0.6 : 0.7,
  }));

  const posts = getSortedPostsData().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...pages, ...toolPages, ...posts];
}
