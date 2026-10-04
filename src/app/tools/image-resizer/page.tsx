import ImageResizer from "@/components/pages/tools/ImageResizer";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("image-resizer");

export default function Page() {
  return (
    <ToolPage
      slug="image-resizer"
      about={
        <>
          <h2>How to Resize an Image</h2>
          <ol>
            <li>Drop one or more images onto the page</li>
            <li>Choose to resize by percentage or by exact pixel dimensions</li>
            <li>Optionally rotate or flip the images and pick an output format</li>
            <li>Download the resized images individually or as a ZIP</li>
          </ol>
          <h2>Keeping the Aspect Ratio</h2>
          <p>
            With &ldquo;Keep aspect ratio&rdquo; on, images are scaled to fit inside the width and
            height you enter, so nothing gets stretched. Leave one box empty to set just the width
            or just the height. Turn it off to force an exact size.
          </p>
          <h2>Common Image Sizes</h2>
          <ul>
            <li><strong>1920×1080</strong> - Full HD wallpapers and presentation slides</li>
            <li><strong>1080×1080</strong> - Square Instagram posts</li>
            <li><strong>1080×1920</strong> - Stories, Reels and TikTok</li>
            <li><strong>1200×630</strong> - Link previews on Facebook, LinkedIn and X</li>
            <li><strong>1280×720</strong> - YouTube thumbnails</li>
          </ul>
        </>
      }
    >
      <ImageResizer />
    </ToolPage>
  );
}
