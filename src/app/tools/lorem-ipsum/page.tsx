import LoremIpsum from "@/components/pages/tools/LoremIpsum";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("lorem-ipsum");

export default function Page() {
  return (
    <ToolPage
      slug="lorem-ipsum"
      about={
        <>
          <h2>What Is Lorem Ipsum?</h2>
          <p>
            Lorem ipsum is scrambled Latin placeholder text used by designers and developers since
            the 1500s. It comes from Cicero&apos;s <em>De Finibus Bonorum et Malorum</em>, written in
            45 BC. Because it looks like real text but can&apos;t be read, it lets people judge a
            layout&apos;s typography and spacing without being distracted by the content.
          </p>
          <h2>Tips</h2>
          <ul>
            <li>Use paragraphs for articles and blog layouts, and words for buttons and headings</li>
            <li>Turn on &lt;p&gt; tags to paste straight into HTML</li>
            <li>Replace placeholder text with real content before launch; it isn&apos;t good for SEO</li>
          </ul>
        </>
      }
    >
      <LoremIpsum />
    </ToolPage>
  );
}
