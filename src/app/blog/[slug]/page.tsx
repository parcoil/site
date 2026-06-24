import { getPostData, getAllPostSlugs } from "@/lib/blog";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import BlogCover from "@/components/blog/BlogCover";

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => path.params);
}

type post = {
  title: string;
  description?: string;
  date: string;
  author?: string;
  cover?: string;
  coverComponent?: string;
  content: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const post: post = await getPostData(slug);
    return {
      title: `${post.title} - Parcoil Blog`,
      description: post.description,
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

  let post: post;
  try {
    post = await getPostData(slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BlogCover cover={post.cover} coverComponent={post.coverComponent} />
      <article>
        <header className="mb-4">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
          <div className="flex items-center gap-2  mt-2">
            {post.author && (
              <div className="flex items-center gap-2">
                <img
                  src={`https://github.com/${post.author}.png`}
                  alt={`${post.author} avatar`}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="font-medium">{post.author}</p>
              </div>
            )}
            <p className="text-muted-foreground m-0">•</p>
            <time className="text-muted-foreground">
              {format(new Date(post.date), "MMMM d, yyyy")}
            </time>
          </div>
        </header>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none blog-root"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
