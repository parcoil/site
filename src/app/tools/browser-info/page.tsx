import BrowserInfo from "@/components/pages/tools/BrowserInfo";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("browser-info");

export default function Page() {
  return (
    <ToolPage
      slug="browser-info"
      about={
        <>
          <h2>Screen Resolution vs. Window Size</h2>
          <p>
            Your <strong>screen resolution</strong> is reported in CSS pixels, which is how big
            your screen looks to websites after display scaling. <strong>Physical pixels</strong>{" "}
            multiplies that by your pixel ratio, so a 4K monitor at 150% scaling reports 2560 × 1440
            with a 1.5x ratio. The <strong>browser window</strong> size is the area pages can
            actually use and changes as you resize the window.
          </p>
          <h2>Why Would I Need This?</h2>
          <ul>
            <li>Telling IT or customer support exactly which browser and version you&apos;re on</li>
            <li>Checking whether your graphics card is being used by the browser</li>
            <li>Testing responsive website designs at specific viewport sizes</li>
            <li>Choosing the right wallpaper or screenshot size for your display</li>
          </ul>
          <p>
            Click <strong>Copy all info</strong> to paste everything into a support ticket. All of
            this is information your browser already shares with every website; nothing here is
            stored or sent anywhere.
          </p>
        </>
      }
    >
      <BrowserInfo />
    </ToolPage>
  );
}
