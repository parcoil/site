import JsonYaml from "@/components/pages/tools/JsonYaml";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("json-yaml");

export default function Page() {
  return (
    <ToolPage
      slug="json-yaml"
      about={
        <>
          <h2>JSON vs. YAML</h2>
          <p>
            JSON and YAML describe the same kinds of data: objects, lists, strings, numbers and
            booleans. JSON is strict and ideal for APIs, while YAML uses indentation instead of
            braces, allows comments and is popular for configuration files like Docker Compose,
            Kubernetes manifests, GitHub Actions and Ansible playbooks.
          </p>
          <h2>Conversion Notes</h2>
          <ul>
            <li>Comments in YAML are dropped when converting to JSON, since JSON has none</li>
            <li>Files with several YAML documents separated by <code>---</code> become a JSON array</li>
            <li>Anchors and aliases are expanded into their full values</li>
            <li>Syntax errors show the line and column so you can find them quickly</li>
          </ul>
        </>
      }
    >
      <JsonYaml />
    </ToolPage>
  );
}
