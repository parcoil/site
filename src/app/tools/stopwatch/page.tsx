import Stopwatch from "@/components/pages/tools/Stopwatch";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("stopwatch");

export default function Page() {
  return (
    <ToolPage
      slug="stopwatch"
      about={
        <>
          <h2>How to Use the Online Stopwatch</h2>
          <ul>
            <li>Press <strong>Start</strong> or the space bar to begin timing</li>
            <li>Press <strong>Lap</strong> or L to record a split without stopping</li>
            <li>Pause and resume as often as you like</li>
            <li>Press <strong>Reset</strong> or R to start over</li>
          </ul>
          <p>
            The fastest lap is highlighted in green and the slowest in red, which is handy for
            running intervals, swimming laps, speedcubing and practice drills.
          </p>
          <h2>Accuracy</h2>
          <p>
            Timing uses your browser&apos;s high-resolution clock, so it stays accurate even if the
            tab is in the background. The display updates at your screen&apos;s refresh rate and
            shows hundredths of a second.
          </p>
        </>
      }
    >
      <Stopwatch />
    </ToolPage>
  );
}
