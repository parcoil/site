import MorseCode from "@/components/pages/tools/MorseCode";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("morse-code");

export default function Page() {
  return (
    <ToolPage
      slug="morse-code"
      about={
        <>
          <h2>How Morse Code Works</h2>
          <p>
            Morse code represents letters and numbers as sequences of short signals (dots) and long
            signals (dashes). It was developed in the 1830s for the electric telegraph and is still
            used by amateur radio operators and in aviation today.
          </p>
          <h2>Timing Rules</h2>
          <ul>
            <li>A dash is three times as long as a dot</li>
            <li>The gap between dots and dashes in a letter is one dot long</li>
            <li>The gap between letters is three dots long</li>
            <li>The gap between words is seven dots long</li>
          </ul>
          <p>
            In written Morse code, letters are separated by spaces and words by a slash. For
            example, &ldquo;HI MOM&rdquo; is <code>.... .. / -- --- --</code>. The famous distress
            signal SOS is <code>... --- ...</code>.
          </p>
        </>
      }
    >
      <MorseCode />
    </ToolPage>
  );
}
