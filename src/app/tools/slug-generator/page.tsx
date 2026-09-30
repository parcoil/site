import SlugGenerator from "@/components/pages/tools/SlugGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("slug-generator");

export default function Page() {
  return (
    <ToolPage
      slug="slug-generator"
      about={
        <>
          <h2>What Is a URL Slug?</h2>
          <p>
            A slug is the human-readable part of a URL that identifies a page, like{" "}
            <code>how-to-make-coffee</code> in <code>example.com/blog/how-to-make-coffee</code>.
            Good slugs are short, lowercase, use hyphens between words and describe the page, which
            helps both visitors and search engines.
          </p>
          <h2>What This Generator Does</h2>
          <ul>
            <li>Removes accents, so &ldquo;Café&rdquo; becomes <code>cafe</code></li>
            <li>Replaces <code>&amp;</code> with &ldquo;and&rdquo; and drops apostrophes</li>
            <li>Collapses spaces and punctuation into a single separator</li>
            <li>Trims separators from the start and end</li>
            <li>Handles many titles at once, one per line</li>
          </ul>
        </>
      }
    >
      <SlugGenerator />
    </ToolPage>
  );
}
