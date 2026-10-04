import RegexTester from "@/components/pages/tools/RegexTester";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("regex-tester");

export default function Page() {
  return (
    <ToolPage
      slug="regex-tester"
      about={
        <>
          <h2>Regex Cheat Sheet</h2>
          <ul>
            <li><code>.</code> any character, <code>\d</code> digit, <code>\w</code> word character, <code>\s</code> whitespace</li>
            <li><code>*</code> zero or more, <code>+</code> one or more, <code>?</code> optional, <code>{"{2,4}"}</code> between 2 and 4</li>
            <li><code>^</code> start and <code>$</code> end of the string (or line with the m flag)</li>
            <li><code>[abc]</code> any of a, b or c; <code>[^abc]</code> anything else</li>
            <li><code>(…)</code> capture group, <code>(?:…)</code> non-capturing, <code>(?&lt;name&gt;…)</code> named group</li>
            <li><code>a|b</code> either a or b; <code>\b</code> word boundary</li>
            <li><code>(?=…)</code> lookahead, <code>(?&lt;=…)</code> lookbehind</li>
          </ul>
          <h2>Flags</h2>
          <ul>
            <li><strong>g</strong> finds every match instead of just the first</li>
            <li><strong>i</strong> ignores upper and lower case</li>
            <li><strong>m</strong> makes <code>^</code> and <code>$</code> match at line breaks</li>
            <li><strong>s</strong> lets <code>.</code> match line breaks too</li>
            <li><strong>u</strong> enables full Unicode matching</li>
          </ul>
          <p>
            This tester uses your browser&apos;s JavaScript regex engine, so results match exactly
            what your JavaScript or TypeScript code will do.
          </p>
        </>
      }
    >
      <RegexTester />
    </ToolPage>
  );
}
