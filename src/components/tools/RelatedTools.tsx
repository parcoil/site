import ToolLink from "@/components/tools/ToolLink";
import { getCategory, getRelatedTools, getTool } from "@/lib/tools";

export default function RelatedTools({ slug }: { slug: string }) {
  const related = getRelatedTools(slug);
  if (related.length === 0) return null;
  const category = getCategory(getTool(slug).category);

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">More {category.name} Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((tool) => (
          <ToolLink key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
