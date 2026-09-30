import ImageConverter from "@/components/pages/tools/ImageConverter";
import ConversionLinks from "@/components/tools/ConversionLinks";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("image-converter");

export default function Page() {
  return (
    <ToolPage
      slug="image-converter"
      about={
        <>
          <h2>Convert Images Without Uploading Them</h2>
          <p>
            Most online converters upload your photos to a server, convert them there and send
            them back. This converter works differently: your browser decodes each image and
            re-encodes it in the new format right on your device. That makes it faster, works
            offline once the page has loaded, and keeps private photos private.
          </p>
          <h2>How to Convert Images</h2>
          <ol>
            <li>Drop your images onto the page, click to browse, or paste with Ctrl+V</li>
            <li>Choose the format you want to convert to</li>
            <li>Adjust quality for JPG, WebP and AVIF if you want smaller files</li>
            <li>Download each image, or download them all at once as a ZIP</li>
          </ol>
          <h2>Which Format Should I Choose?</h2>
          <ul>
            <li><strong>JPG</strong> - Photos you want to share anywhere</li>
            <li><strong>PNG</strong> - Screenshots, logos and anything with transparency</li>
            <li><strong>WebP</strong> - Smaller images for websites, with transparency</li>
            <li><strong>AVIF</strong> - The smallest files, for modern browsers</li>
            <li><strong>ICO</strong> - Favicons and Windows icons</li>
            <li><strong>GIF / BMP</strong> - Compatibility with older software</li>
          </ul>
          <h2>Popular Conversions</h2>
          <ConversionLinks className="not-prose" />
        </>
      }
    >
      <ImageConverter />
    </ToolPage>
  );
}
