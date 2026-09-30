import LineTools from "@/components/pages/tools/LineTools";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("line-tools");

export default function Page() {
  return (
    <ToolPage
      slug="line-tools"
      about={
        <>
          <h2>Clean Up Lists in Seconds</h2>
          <p>
            Paste any list, such as email addresses, keywords, product codes or names, and the
            options are applied instantly in this order: trim whitespace, remove empty lines,
            remove duplicates, sort, then number the lines.
          </p>
          <h2>Sorting Options</h2>
          <ul>
            <li><strong>A → Z / Z → A</strong> - Natural alphabetical order, so &ldquo;item 2&rdquo; comes before &ldquo;item 10&rdquo;</li>
            <li><strong>Numeric</strong> - Sorts by the number at the start of each line</li>
            <li><strong>By length</strong> - Shortest lines first</li>
            <li><strong>Reverse</strong> - Flips the current order upside down</li>
            <li><strong>Shuffle</strong> - Random order using your browser&apos;s secure random generator</li>
          </ul>
        </>
      }
    >
      <LineTools />
    </ToolPage>
  );
}
