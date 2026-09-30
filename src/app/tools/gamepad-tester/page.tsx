import GamepadTester from "@/components/pages/tools/GamepadTester";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("gamepad-tester");

export default function Page() {
  return (
    <ToolPage
      slug="gamepad-tester"
      about={
        <>
          <h2>Why Use a Gamepad Tester?</h2>
          <p>
            Whether you&apos;re troubleshooting a faulty controller or just want to verify that all
            buttons and sticks are working, a gamepad tester gives you instant feedback without
            installing any software.
          </p>
          <p>
            This tool reads directly from the browser&apos;s Gamepad API, so it works with any
            standard USB or Bluetooth controller, including Xbox, PlayStation, Switch Pro, and
            generic gamepads.
          </p>
          <h3>How to Use This Tool</h3>
          <ol>
            <li>Connect your gamepad via USB cable or Bluetooth</li>
            <li>Press any button on the controller to activate it</li>
            <li>Watch the button indicators light up as you press them</li>
            <li>Move the analog sticks to see real-time axis values</li>
          </ol>
          <h3>What You Can Test</h3>
          <ul>
            <li>All face buttons (A/B/X/Y or their equivalents)</li>
            <li>Shoulder buttons and analog triggers</li>
            <li>Left and right analog sticks with X/Y axis values</li>
            <li>D-pad directions</li>
            <li>Special buttons like Start, Back, and Home</li>
          </ul>
        </>
      }
    >
      <GamepadTester />
    </ToolPage>
  );
}
