import FindReplace from "@/components/pages/tools/FindReplace";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("find-replace");

export default function Page() {
  return (
    <ToolPage
      slug="find-replace"
      about={
        <>
          <h2>Find and Replace Options</h2>
          <ul>
            <li><strong>Match case</strong> - only replace text with the same capitalization</li>
            <li>
              <strong>Whole words only</strong> - replace &ldquo;cat&rdquo; but not the
              &ldquo;cat&rdquo; inside &ldquo;concatenate&rdquo;
            </li>
            <li>
              <strong>Regular expression</strong> - use patterns like <code>\d+</code> to match any
              number, or <code>(\w+)@(\w+)</code> with <code>$1</code> and <code>$2</code> in the
              replacement to rearrange text
            </li>
          </ul>
          <h2>Handy Uses</h2>
          <ul>
            <li>Rename a character or product across a whole document</li>
            <li>Swap straight quotes for curly quotes or fix repeated typos</li>
            <li>Remove tracking parameters from a list of links</li>
            <li>Reformat dates, phone numbers or CSV columns with regex groups</li>
          </ul>
        </>
      }
    >
      <FindReplace />
    </ToolPage>
  );
}
