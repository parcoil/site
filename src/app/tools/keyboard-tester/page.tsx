import KeyboardTester from "@/components/pages/tools/KeyboardTester";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("keyboard-tester");

export default function Page() {
  return (
    <ToolPage
      slug="keyboard-tester"
      about={
        <>
          <h2>How to Test Your Keyboard</h2>
          <ol>
            <li>Press each key on your keyboard one at a time</li>
            <li>Keys light up while held down and stay highlighted once they&apos;ve worked</li>
            <li>Any key that never lights up may be broken or remapped</li>
          </ol>
          <h2>Ghosting and Rollover</h2>
          <p>
            Hold down several keys at once, like W, A, S, D and Space, to see how many your
            keyboard registers together. Gaming keyboards with &ldquo;N-key rollover&rdquo; can
            register every key at once, while cheaper keyboards may drop keys (ghosting) after
            three or four.
          </p>
          <h2>Keys That May Not Register</h2>
          <p>
            The operating system intercepts some keys before your browser sees them, such as the
            Windows key, Fn, media keys and sometimes Print Screen. If those don&apos;t light up,
            it doesn&apos;t necessarily mean they&apos;re broken. The panel below the keyboard shows
            each key&apos;s JavaScript <code>key</code> and <code>code</code> values, which is handy
            for developers.
          </p>
        </>
      }
    >
      <KeyboardTester />
    </ToolPage>
  );
}
