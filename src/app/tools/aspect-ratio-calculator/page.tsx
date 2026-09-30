import AspectRatio from "@/components/pages/tools/AspectRatio";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("aspect-ratio-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="aspect-ratio-calculator"
      about={
        <>
          <h2>What Is an Aspect Ratio?</h2>
          <p>
            An aspect ratio is the proportion between width and height, written as{" "}
            <em>width:height</em>. A 1920×1080 screen is 16:9 because both numbers divide by 120.
            Keeping the ratio when resizing stops images and videos from looking stretched.
          </p>
          <h2>Common Aspect Ratios</h2>
          <ul>
            <li><strong>16:9</strong> - 1280×720, 1920×1080, 3840×2160 (HD, Full HD, 4K)</li>
            <li><strong>9:16</strong> - 1080×1920 vertical video for Stories, Reels, Shorts and TikTok</li>
            <li><strong>4:3</strong> - 1024×768, older TVs and monitors, many tablets</li>
            <li><strong>21:9</strong> - 2560×1080 and 3440×1440 ultrawide monitors</li>
            <li><strong>1:1</strong> - 1080×1080 square social posts</li>
            <li><strong>4:5</strong> - 1080×1350 portrait Instagram posts</li>
          </ul>
          <p>
            Fun fact: &ldquo;21:9&rdquo; monitors are really 64:27 (2560×1080) or 43:18
            (3440×1440). 21:9 is a marketing approximation.
          </p>
        </>
      }
    >
      <AspectRatio />
    </ToolPage>
  );
}
