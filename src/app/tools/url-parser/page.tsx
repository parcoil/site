import UrlParser from "@/components/pages/tools/UrlParser";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("url-parser");

export default function Page() {
  return (
    <ToolPage
      slug="url-parser"
      about={
        <>
          <h2>Anatomy of a URL</h2>
          <p>
            Take <code>https://example.com:8080/docs/page?id=42&amp;lang=en#intro</code>:
          </p>
          <ul>
            <li><strong>Protocol</strong> - <code>https</code>, how the browser connects</li>
            <li><strong>Host</strong> - <code>example.com</code>, the server&apos;s domain name</li>
            <li><strong>Port</strong> - <code>8080</code>; usually omitted because HTTPS defaults to 443</li>
            <li><strong>Path</strong> - <code>/docs/page</code>, which resource on the server</li>
            <li><strong>Query string</strong> - <code>id=42&amp;lang=en</code>, parameters for the page</li>
            <li><strong>Fragment</strong> - <code>intro</code>, a spot on the page; never sent to the server</li>
          </ul>
          <h2>Why Parse a URL?</h2>
          <p>
            Long tracking links from emails and ads are hard to read. Parsing them shows every
            UTM tag and redirect target decoded, and lets you remove or change parameters before
            sharing a cleaner link.
          </p>
        </>
      }
    >
      <UrlParser />
    </ToolPage>
  );
}
