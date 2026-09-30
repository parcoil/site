import JSONFormatter from "@/components/pages/tools/JSONFormatter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("json-formatter");

export default function Page() {
  return (
    <ToolPage
      slug="json-formatter"
      about={
        <>
          <h2>About JSON</h2>
          <p>
            JSON (JavaScript Object Notation) is a lightweight data-interchange format that&apos;s
            easy for humans to read and write, and easy for machines to parse and generate.
            It&apos;s widely used for APIs, configuration files, and data storage.
          </p>
          <h2>Features</h2>
          <ul>
            <li>Live validation with the exact line and column of any syntax error</li>
            <li>Format with 2 spaces, 4 spaces or tabs, or minify to a single line</li>
            <li>Sort object keys alphabetically to make diffs easier to read</li>
          </ul>
          <h2>Common JSON Errors</h2>
          <ul>
            <li>Trailing commas after the last item in an object or array</li>
            <li>Single quotes instead of double quotes around strings and keys</li>
            <li>Unquoted keys, as in JavaScript object literals</li>
            <li>Comments, which standard JSON doesn&apos;t allow</li>
          </ul>
        </>
      }
    >
      <JSONFormatter />
    </ToolPage>
  );
}
