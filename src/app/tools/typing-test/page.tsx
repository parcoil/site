import TypingTest from "@/components/pages/tools/TypingTest";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("typing-test");

export default function Page() {
  return (
    <ToolPage
      slug="typing-test"
      about={
        <>
          <h2>How Typing Speed Is Measured</h2>
          <p>
            Typing speed is measured in words per minute (WPM), where a &ldquo;word&rdquo; is
            standardized as five characters including spaces. Your WPM counts only correctly typed
            characters, while raw WPM counts everything you typed. Accuracy is the share of your
            keystrokes that were correct, including ones you later fixed.
          </p>
          <h2>What&apos;s a Good Typing Speed?</h2>
          <ul>
            <li><strong>Under 30 WPM</strong> - beginner, often hunt-and-peck</li>
            <li><strong>40 WPM</strong> - about average</li>
            <li><strong>60–70 WPM</strong> - fast, comfortable touch typing</li>
            <li><strong>80–100 WPM</strong> - very fast; common for programmers and writers</li>
            <li><strong>120+ WPM</strong> - competitive typist territory</li>
          </ul>
          <h2>Tips to Type Faster</h2>
          <ul>
            <li>Learn touch typing with your fingers on the home row (ASDF JKL;)</li>
            <li>Focus on accuracy first; speed follows</li>
            <li>Look at the screen, not your keyboard</li>
            <li>Practice a little every day rather than a lot once a week</li>
          </ul>
        </>
      }
    >
      <TypingTest />
    </ToolPage>
  );
}
