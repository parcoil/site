import TextDiff from "@/components/pages/tools/TextDiff";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("text-diff");

export default function Page() {
  return (
    <ToolPage
      slug="text-diff"
      about={
        <>
          <h2>How to Compare Two Texts</h2>
          <ol>
            <li>Paste the original version on the left and the changed version on the right</li>
            <li>Differences are highlighted instantly: removed lines in red, added lines in green</li>
            <li>Changed words inside a line are highlighted so small edits are easy to spot</li>
            <li>Switch between side-by-side and unified views, like in Git</li>
          </ol>
          <h2>What Can I Compare?</h2>
          <ul>
            <li>Drafts of essays, contracts and articles</li>
            <li>Code snippets and configuration files</li>
            <li>CSV exports and lists, to see which rows changed</li>
            <li>Two versions of an API response</li>
          </ul>
          <p>
            The comparison uses the Myers diff algorithm, the same one behind <code>git diff</code>,
            and runs entirely in your browser, so confidential documents never leave your device.
          </p>
        </>
      }
    >
      <TextDiff />
    </ToolPage>
  );
}
