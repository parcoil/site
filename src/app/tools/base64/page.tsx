import Base64 from "@/components/pages/tools/Base64";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("base64");

export default function Page() {
  return (
    <ToolPage
      slug="base64"
      about={
        <>
          <h2>About Base64 Encoding</h2>
          <p>
            Base64 is an encoding scheme that represents binary data in an ASCII string format.
            It&apos;s commonly used when there&apos;s a need to encode binary data that needs to be
            stored and transferred over media that are designed to deal with text.
          </p>
          <p>
            This tool encodes text as UTF-8 first, so emoji and non-English characters work
            correctly. URL-safe Base64 swaps <code>+</code> and <code>/</code> for <code>-</code>{" "}
            and <code>_</code> so the result can be used in URLs and file names, as in JSON Web
            Tokens.
          </p>
          <h2>Common Uses for Base64</h2>
          <ul>
            <li>Embedding image data in CSS or HTML</li>
            <li>Encoding email attachments (MIME)</li>
            <li>Storing complex data in XML or JSON</li>
            <li>Transferring data over protocols that may corrupt binary data</li>
          </ul>
        </>
      }
    >
      <Base64 />
    </ToolPage>
  );
}
