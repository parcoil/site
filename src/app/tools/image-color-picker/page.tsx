import ImageColorPicker from "@/components/pages/tools/ImageColorPicker";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("image-color-picker");

export default function Page() {
  return (
    <ToolPage
      slug="image-color-picker"
      about={
        <>
          <h2>How to Get a Color From an Image</h2>
          <ol>
            <li>Drop an image, screenshot or logo onto the page, or paste it with Ctrl+V</li>
            <li>Move your cursor over the image to preview colors</li>
            <li>Click to pick a color and copy it as HEX, RGB or HSL</li>
          </ol>
          <p>
            In Chrome and Edge you can also use <strong>Pick from anywhere on screen</strong> to
            grab a color from any window, not just the uploaded image.
          </p>
          <h2>Automatic Palette Extraction</h2>
          <p>
            The dominant colors of your image are found with the median cut algorithm and sorted
            by how much of the image each one covers. It&apos;s a quick way to build a color scheme
            from a photo, match a brand&apos;s logo colors, or find the exact shade used in a
            design. Click any swatch to copy it, or copy the whole palette as CSS variables.
          </p>
        </>
      }
    >
      <ImageColorPicker />
    </ToolPage>
  );
}
