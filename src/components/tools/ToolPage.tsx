import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import BannerAd from "@/components/BannerAd";
import RelatedTools from "@/components/tools/RelatedTools";
import { getCategory, getTool, toolHref } from "@/lib/tools";
import { SITE_URL, TOOL_BANNER_AD_KEY } from "@/lib/site";

type ToolPageProps = {
  slug: string;
  children: ReactNode;
  /** SEO copy shown under the tool. Plain h2/h3/p/ul/ol elements are styled automatically. */
  about?: ReactNode;
};

/** Shared shell for every tool page: heading, ads, about copy and related tools. */
export default function ToolPage({ slug, children, about }: ToolPageProps) {
  const tool = getTool(slug);
  const category = getCategory(tool.category);
  const intro = tool.intro ?? tool.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: intro,
    url: `${SITE_URL}${toolHref(tool)}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/tools#${category.id}`}
          className="hover:text-foreground transition-colors"
        >
          {category.name}
        </Link>
      </nav>

      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{tool.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{intro}</p>
      </header>

      {children}

      <section className="py-8 mt-6">
        <AdBanner />
      </section>

      {about && (
        <section className="prose dark:prose-invert max-w-3xl mx-auto">{about}</section>
      )}

      <RelatedTools slug={slug} />

      <section className="py-8 mt-8">
        <AdBanner />
      </section>

      <section className="py-8 flex justify-center">
        <BannerAd adKey={TOOL_BANNER_AD_KEY} width={300} height={250} />
      </section>
    </div>
  );
}
