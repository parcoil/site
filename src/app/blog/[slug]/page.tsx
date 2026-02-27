import { getPostData, getAllPostSlugs } from "@/lib/blog";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => path.params);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const post = await getPostData(slug);
    return {
      title: `${post.title} - Parcoil Blog`,
      description: post.excerpt,
    };
  } catch {
    return {
      title: "Blog Post - Parcoil",
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostData(slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/blog">
        <Button variant="ghost" className="mb-8 pl-0 hover:pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <time className="text-muted-foreground">
            {format(new Date(post.date), "MMMM d, yyyy")}
          </time>
        </header>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none blog-root"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
