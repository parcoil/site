import RefreshRateTest from "@/components/pages/tools/RefreshRateTest";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("refresh-rate-test");

export default function Page() {
  return (
    <ToolPage
      slug="refresh-rate-test"
      about={
        <>
          <h2>How This Test Works</h2>
          <p>
            Your browser redraws the page once per screen refresh. By timing those redraws, this
            test measures the refresh rate your display is actually running at, which isn&apos;t
            always what it&apos;s capable of.
          </p>
          <h2>Showing 60 Hz on a 144 Hz Monitor?</h2>
          <ul>
            <li>Set the refresh rate in your OS display settings (Windows: Settings → Display → Advanced display)</li>
            <li>Use a DisplayPort or HDMI 2.0+ cable. Older HDMI cables often cap at 60 Hz</li>
            <li>Enable hardware acceleration in your browser settings</li>
            <li>On laptops, plug in the charger; battery saver often limits refresh rate</li>
            <li>With multiple monitors, move this window to the screen you want to test</li>
          </ul>
          <h2>Dropped Frames and Jitter</h2>
          <p>
            Red bars in the frame-time graph are frames that took much longer than usual. A few
            when switching tabs are normal; constant drops or high jitter mean your system is
            struggling to keep up, which shows up as stutter in the moving box.
          </p>
        </>
      }
    >
      <RefreshRateTest />
    </ToolPage>
  );
}
