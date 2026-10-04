import RandomNumber from "@/components/pages/tools/RandomNumber";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("random-number");

export default function Page() {
  return (
    <ToolPage
      slug="random-number"
      about={
        <>
          <h2>Truly Fair Random Numbers</h2>
          <p>
            Numbers are drawn with your browser&apos;s cryptographically secure random number
            generator (<code>crypto.getRandomValues</code>), and rejection sampling ensures every
            number in the range is exactly as likely as any other, with no modulo bias.
          </p>
          <h2>Ideas</h2>
          <ul>
            <li>Pick lottery or raffle numbers with &ldquo;No repeats&rdquo; turned on</li>
            <li>Choose a random winner by ticket number</li>
            <li>Generate test data or sample indexes</li>
            <li>Settle a decision: 1 for yes, 2 for no</li>
          </ul>
          <p>
            Need to pick from a list of names instead? Try the{" "}
            <a href="/tools/random-picker">Random Name Picker</a>.
          </p>
        </>
      }
    >
      <RandomNumber />
    </ToolPage>
  );
}
