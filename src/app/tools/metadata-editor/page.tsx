import MetadataEditor from "@/components/pages/tools/MetadataEditor";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("metadata-editor");

export default function Page() {
  return (
    <ToolPage
      slug="metadata-editor"
      about={
        <>
          <h2>What Can I Add to a Photo?</h2>
          <ul>
            <li><strong>Title, subject, description and tags</strong> - make photos searchable in Windows, macOS and photo apps</li>
            <li><strong>Star rating</strong> - shows up in Windows Explorer and many photo managers</li>
            <li><strong>Author and copyright</strong> - credit yourself before sharing your work</li>
            <li><strong>Camera and lens</strong> - fix or fill in gear details for scanned or edited photos</li>
            <li><strong>Date taken</strong> - correct wrong camera clocks or date old scans so they sort properly</li>
            <li><strong>GPS location</strong> - geotag photos so they appear on the map in your photo library</li>
          </ul>
          <h2>How to Edit Photo Metadata</h2>
          <ol>
            <li>Drop one or more photos onto the page</li>
            <li>With one photo, its current metadata is filled in so you can change or clear it</li>
            <li>With several photos, fill in only what you want to change, such as adding your copyright to all of them</li>
            <li>Click Save to download the updated photos</li>
          </ol>
          <h2>Lossless and Private</h2>
          <p>
            For JPG, PNG and WebP, only the metadata block inside the file is rewritten; the image
            itself is copied byte for byte, so there&apos;s no quality loss. Other formats like GIF
            and BMP are saved as high-quality JPGs, since they can&apos;t hold EXIF data. Your photos
            are processed in your browser and never uploaded.
          </p>
          <p>
            Want to strip metadata instead? Use the{" "}
            <a href="/tools/exif-remover">EXIF Viewer &amp; Remover</a>.
          </p>
        </>
      }
    >
      <MetadataEditor />
    </ToolPage>
  );
}
