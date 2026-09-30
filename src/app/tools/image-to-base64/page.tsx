import ImageToBase64 from "@/components/pages/tools/ImageToBase64";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("image-to-base64");

export default function Page() {
  return (
    <ToolPage
      slug="image-to-base64"
      about={
        <>
          <h2>What Is a Base64 Data URI?</h2>
          <p>
            A data URI embeds a file directly inside HTML, CSS or JSON as text, for example{" "}
            <code>data:image/png;base64,iVBORw0…</code>. The browser can display the image without
            making a separate network request.
          </p>
          <h2>When to Use Base64 Images</h2>
          <ul>
            <li>Tiny icons and logos where saving a request matters more than size</li>
            <li>HTML emails, where external images are often blocked</li>
            <li>Single-file HTML documents and demos</li>
            <li>Images stored in JSON APIs or databases</li>
          </ul>
          <p>
            Base64 adds roughly 33% to the file size and the image can&apos;t be cached on its own,
            so link to normal image files for anything larger than a few kilobytes.
          </p>
          <h2>Decoding Base64 to an Image</h2>
          <p>
            Switch to <strong>Base64 → Image</strong> and paste either a full data URI or just the
            Base64 text. The image type is detected automatically so you can preview and download
            it.
          </p>
        </>
      }
    >
      <ImageToBase64 />
    </ToolPage>
  );
}
