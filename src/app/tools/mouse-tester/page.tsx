import MouseTester from "@/components/pages/tools/MouseTester";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("mouse-tester");

export default function Page() {
  return (
    <ToolPage
      slug="mouse-tester"
      about={
        <>
          <h2>What This Mouse Test Checks</h2>
          <ul>
            <li><strong>All five buttons</strong> - left, right, middle and the two side buttons</li>
            <li><strong>Scroll wheel</strong> - scrolling up and down, counted separately</li>
            <li><strong>Double clicks</strong> - that your double clicks register</li>
            <li><strong>Polling rate</strong> - roughly how many times per second your mouse reports its position</li>
          </ul>
          <h2>Is My Mouse Double Clicking by Itself?</h2>
          <p>
            A worn-out switch can &ldquo;chatter&rdquo;, registering two clicks when you only
            pressed once. This makes items open unexpectedly and drag-and-drop fail. Click
            normally a few dozen times: if the accidental double click counter goes up, the switch
            is likely failing. Cleaning it or adjusting the mouse&apos;s debounce time in its
            software sometimes helps; otherwise the switch or mouse needs replacing.
          </p>
          <h2>About Polling Rate</h2>
          <p>
            Office mice usually report at 125 Hz, while gaming mice run at 500, 1000 Hz or more.
            Move your mouse quickly in circles inside the box for the most accurate estimate.
            Results depend on your browser and screen, so treat them as approximate.
          </p>
        </>
      }
    >
      <MouseTester />
    </ToolPage>
  );
}
