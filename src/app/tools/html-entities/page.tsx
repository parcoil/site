import HtmlEntities from "@/components/pages/tools/HtmlEntities";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("html-entities");

export default function Page() {
  return (
    <ToolPage
      slug="html-entities"
      about={
        <>
          <h2>What Are HTML Entities?</h2>
          <p>
            HTML entities are codes that represent characters which would otherwise be read as
            HTML. For example, <code>&amp;lt;</code> displays a literal <code>&lt;</code> instead
            of starting a tag. Escaping user-supplied text this way is also a basic defense against
            cross-site scripting (XSS).
          </p>
          <h2>Characters That Must Be Escaped</h2>
          <ul>
            <li><code>&amp;</code> becomes <code>&amp;amp;</code></li>
            <li><code>&lt;</code> becomes <code>&amp;lt;</code></li>
            <li><code>&gt;</code> becomes <code>&amp;gt;</code></li>
            <li><code>&quot;</code> becomes <code>&amp;quot;</code> inside attributes</li>
            <li><code>&#39;</code> becomes <code>&amp;#39;</code> inside attributes</li>
          </ul>
          <p>
            Decoding understands every named entity (like <code>&amp;copy;</code> or{" "}
            <code>&amp;nbsp;</code>) as well as decimal and hexadecimal numeric entities.
          </p>
        </>
      }
    >
      <HtmlEntities />
    </ToolPage>
  );
}
