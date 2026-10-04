import ReactionTime from "@/components/pages/tools/ReactionTime";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("reaction-time-test");

export default function Page() {
  return (
    <ToolPage
      slug="reaction-time-test"
      about={
        <>
          <h2>How the Test Works</h2>
          <p>
            Click the box and wait. After a random delay it turns green, and the time between the
            color change and your click is your reaction time. Click too early and the attempt
            doesn&apos;t count. Your average over five attempts is the fairest measure.
          </p>
          <h2>What&apos;s a Good Reaction Time?</h2>
          <ul>
            <li><strong>Over 300 ms</strong> - slower than average; try again when you&apos;re rested</li>
            <li><strong>200–300 ms</strong> - typical for most people</li>
            <li><strong>150–200 ms</strong> - fast; common among gamers and athletes</li>
            <li><strong>Under 150 ms</strong> - exceptional</li>
          </ul>
          <h2>Why Your Setup Matters</h2>
          <p>
            Your result includes your screen&apos;s refresh delay and your mouse&apos;s latency, so a
            144 Hz monitor and a gaming mouse will measure a little faster than a 60 Hz laptop
            screen and trackpad. Compare scores on the same device.
          </p>
        </>
      }
    >
      <ReactionTime />
    </ToolPage>
  );
}
