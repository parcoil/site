import CountdownTimer from "@/components/pages/tools/CountdownTimer";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("countdown-timer");

export default function Page() {
  return (
    <ToolPage
      slug="countdown-timer"
      about={
        <>
          <h2>How to Set a Timer</h2>
          <ol>
            <li>Enter hours, minutes and seconds, or click a preset to start instantly</li>
            <li>Press Start. The remaining time also shows in your browser tab</li>
            <li>When time runs out, an alarm beeps until you stop it</li>
          </ol>
          <p>
            Keep your volume up and the tab open. The timer keeps accurate time in the background,
            even if you switch to another tab.
          </p>
          <h2>Popular Uses</h2>
          <ul>
            <li><strong>25 minutes</strong> - a Pomodoro focus session</li>
            <li><strong>5 or 10 minutes</strong> - short breaks, tea and cooking</li>
            <li><strong>1 or 3 minutes</strong> - exercise intervals, brushing teeth, presentations</li>
            <li><strong>60 minutes</strong> - exams, study blocks and meetings</li>
          </ul>
        </>
      }
    >
      <CountdownTimer />
    </ToolPage>
  );
}
