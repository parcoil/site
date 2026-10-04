import ImageCropper from "@/components/pages/tools/ImageCropper";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("image-cropper");

export default function Page() {
  return (
    <ToolPage
      slug="image-cropper"
      about={
        <>
          <h2>How to Crop an Image</h2>
          <ol>
            <li>Drop an image onto the page or paste it with Ctrl+V</li>
            <li>Pick an aspect ratio, or leave it on Free</li>
            <li>Drag the box to move it and drag the corners to resize it</li>
            <li>Fine-tune the position and size with the number fields if you need exact pixels</li>
            <li>Download the cropped image</li>
          </ol>
          <h2>Which Aspect Ratio Should I Use?</h2>
          <ul>
            <li><strong>1:1</strong> - Profile pictures and square posts</li>
            <li><strong>4:5</strong> - Portrait Instagram posts</li>
            <li><strong>16:9</strong> - YouTube thumbnails, desktop wallpapers and slides</li>
            <li><strong>9:16</strong> - Stories, Reels and TikTok</li>
            <li><strong>3:2 / 4:3</strong> - Standard photo prints</li>
          </ul>
          <p>
            Turn on <strong>Circle crop</strong> to make a round avatar with a transparent
            background. Cropping happens in your browser, so your photo is never uploaded.
          </p>
        </>
      }
    >
      <ImageCropper />
    </ToolPage>
  );
}
