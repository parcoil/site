import URLEncoder from "@/components/pages/tools/URLEncoder";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("url-encoder");

export default function Page() {
  return (
    <ToolPage
      slug="url-encoder"
      about={
        <>
          <h2>About URL Encoding</h2>
          <p>
            URL encoding, also known as percent-encoding, is a mechanism for encoding information
            in a Uniform Resource Identifier (URI). It converts characters that are not allowed in
            a URL into a format that can be transmitted over the Internet.
          </p>
          <h2>Full URL vs. Component Encoding</h2>
          <p>
            Encoding a single value (like a search term) escapes every reserved character,
            including <code>/</code>, <code>?</code> and <code>&amp;</code>. Encoding a full URL
            leaves those characters alone so the URL keeps working and only escapes things like
            spaces and non-ASCII characters.
          </p>
          <h2>When to Use URL Encoding</h2>
          <ul>
            <li>Sending data in query parameters</li>
            <li>Embedding URLs in HTML or other markup</li>
            <li>Transmitting special characters in web addresses</li>
            <li>API calls with complex data</li>
          </ul>
        </>
      }
    >
      <URLEncoder />
    </ToolPage>
  );
}
