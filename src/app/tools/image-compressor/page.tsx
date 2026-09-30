import ImageCompressor from "@/components/pages/tools/ImageCompressor";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("image-compressor");

export default function Page() {
  return (
    <ToolPage
      slug="image-compressor"
      about={
        <>
          <h2>How the Image Compressor Works</h2>
          <p>
            Photos straight from a phone or camera are often several megabytes. This tool shrinks
            them in two ways, entirely inside your browser:
          </p>
          <ul>
            <li>
              <strong>JPG, WebP and AVIF</strong> are re-encoded at the quality you choose. Around
              70–80% is usually indistinguishable from the original at a fraction of the size.
            </li>
            <li>
              <strong>PNG</strong> images are reduced to a palette of up to 256 colors with smart
              dithering, the same technique used by popular PNG optimizers. This often cuts PNG
              size by 60–80% while keeping transparency.
            </li>
          </ul>
          <p>
            If compression can&apos;t make a file smaller, you get the original back untouched, so
            you never end up with a bigger file.
          </p>
          <h2>Tips for the Smallest Files</h2>
          <ul>
            <li>Limit the size to 1920px or 1280px for images shown on websites or in email</li>
            <li>Convert photos to WebP or AVIF for websites; both are much smaller than JPG</li>
            <li>Keep PNG for screenshots, logos and graphics with transparency</li>
            <li>Lower PNG colors for simple graphics; 64 colors is often plenty</li>
          </ul>
          <h2>Is It Safe?</h2>
          <p>
            Yes. Unlike most online compressors, nothing is uploaded. Your images are processed on
            your own device, so there are no file limits and nothing is stored anywhere.
          </p>
        </>
      }
    >
      <ImageCompressor />
    </ToolPage>
  );
}
