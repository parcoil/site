import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";
import { format } from "date-fns";
import { ChevronRightIcon } from "lucide-react";
import { getCoverComponent } from "@/components/blog/covers";

export const metadata = {
  title: "Blog - Parcoil",
  description: "Latest updates, tutorials, and insights from Parcoil.",
};

function PostThumbnail({
  cover,
  coverComponent,
  title,
}: {
  cover?: string;
  coverComponent?: string;
  title: string;
}) {
  if (coverComponent) {
    const Component = getCoverComponent(coverComponent);
    if (Component) {
      return (
        <div className="w-full aspect-video overflow-hidden rounded-lg bg-muted pointer-events-none">
          <Component />
        </div>
      );
    }
  }

  if (cover) {
    return (
      <div className="w-full aspect-video overflow-hidden rounded-lg bg-muted">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
      <span className="text-muted-foreground/30 text-4xl font-bold select-none">
        P
      </span>
    </div>
  );
}

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="max-w-4xl border-b pb-10 mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Parcoil
        </p>
        <h1 className="text-5xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Updates, tutorials, and insights from the team.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-lg">
            No posts yet — check back soon.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors overflow-hidden"
              >
                <div className="p-3 pb-0">
                  <PostThumbnail
                    cover={post.cover}
                    coverComponent={post.coverComponent}
                    title={post.title}
                  />
                </div>

                <div className="flex flex-col flex-1 p-4 pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    <time dateTime={post.date}>
                      {format(new Date(post.date), "MMM d, yyyy")}
                    </time>
                    {post.author && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40 inline-block" />
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-lg font-bold tracking-tight leading-snug mb-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {(post.description || post.excerpt) && (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1">
                      {post.description || post.excerpt}
                    </p>
                  )}

                  <span className="inline-flex items-center gap-0.5 mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Read article
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
