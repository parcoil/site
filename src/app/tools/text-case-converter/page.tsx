import TextCaseConverter from "@/components/pages/tools/TextCaseConverter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("text-case-converter");

export default function Page() {
  return (
    <ToolPage
      slug="text-case-converter"
      about={
        <>
          <h2>About Text Cases</h2>
          <p>
            Different text cases are used in various contexts in programming, writing, and design.
            Understanding these formats helps you maintain consistency in your projects.
          </p>
          <h3>Common Text Cases</h3>
          <ul>
            <li><strong>UPPERCASE</strong> - All characters are capitalized</li>
            <li><strong>lowercase</strong> - All characters are in small letters</li>
            <li><strong>Title Case</strong> - The First Letter Of Each Word Is Capitalized</li>
            <li><strong>camelCase</strong> - First word lowercase, each following word capitalized, no spaces</li>
            <li><strong>PascalCase</strong> - Every word capitalized, no spaces</li>
            <li><strong>snake_case</strong> - All lowercase with underscores between words</li>
            <li><strong>kebab-case</strong> - All lowercase with hyphens between words</li>
          </ul>
          <h3>When to Use Different Cases</h3>
          <ul>
            <li><strong>UPPERCASE</strong> - Headlines, acronyms, constants in programming</li>
            <li><strong>Title Case</strong> - Titles, headings, book names</li>
            <li><strong>camelCase</strong> - JavaScript variables and functions</li>
            <li><strong>PascalCase</strong> - Class names in many programming languages</li>
            <li><strong>snake_case</strong> - Python variables, SQL table names</li>
            <li><strong>kebab-case</strong> - CSS class names, URLs, HTML IDs and attributes</li>
          </ul>
          <p>
            The programming cases understand existing camelCase and PascalCase, so converting{" "}
            <code>userAccountId</code> to snake_case gives <code>user_account_id</code>.
          </p>
        </>
      }
    >
      <TextCaseConverter />
    </ToolPage>
  );
}
