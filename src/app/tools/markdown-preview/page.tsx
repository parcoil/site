import MarkdownEditor from "@/components/pages/tools/MarkdownEditor";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("markdown-preview");

export default function Page() {
  return (
    <ToolPage
      slug="markdown-preview"
      about={
        <>
          <h2>Markdown Quick Reference</h2>
          <ul>
            <li><code># Heading</code>, <code>## Subheading</code></li>
            <li><code>**bold**</code>, <code>*italic*</code>, <code>~~strikethrough~~</code></li>
            <li><code>[link text](https://example.com)</code> and <code>![alt text](image.png)</code></li>
            <li><code>- item</code> for bullets, <code>1. item</code> for numbered lists</li>
            <li><code>- [ ] task</code> and <code>- [x] done</code> for checklists</li>
            <li><code>`code`</code> inline, or triple backticks for code blocks</li>
            <li><code>&gt; quote</code> for blockquotes and <code>---</code> for a divider</li>
          </ul>
          <h2>GitHub Flavored Markdown</h2>
          <p>
            This editor supports the GitHub extensions used in READMEs, issues and docs sites:
            tables, task lists, strikethrough and automatic links. Copy the generated HTML to paste
            into a CMS or email, or download a standalone HTML page.
          </p>
          <p>
            Your writing never leaves your browser, and raw HTML in the preview is sanitized so
            pasted content can&apos;t run scripts.
          </p>
        </>
      }
    >
      <MarkdownEditor />
    </ToolPage>
  );
}
