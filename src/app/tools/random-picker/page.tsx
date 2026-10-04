import RandomPicker from "@/components/pages/tools/RandomPicker";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("random-picker");

export default function Page() {
  return (
    <ToolPage
      slug="random-picker"
      about={
        <>
          <h2>How to Pick a Random Name</h2>
          <ol>
            <li>Paste your list of names, entries or options, one per line</li>
            <li>Choose how many winners you want</li>
            <li>Click &ldquo;Pick at random&rdquo; and watch the draw</li>
          </ol>
          <p>
            Turn on &ldquo;Remove winners from the list&rdquo; to draw prizes one at a time without
            picking the same person twice.
          </p>
          <h2>Make Random Teams</h2>
          <p>
            Switch to <strong>Make teams</strong> to shuffle everyone into evenly sized groups,
            perfect for classrooms, game nights, sports and workshops.
          </p>
          <h2>Is It Fair?</h2>
          <p>
            Yes. The picker shuffles your list with the Fisher–Yates algorithm using your
            browser&apos;s cryptographically secure random number generator, so every entry has
            exactly the same chance.
          </p>
        </>
      }
    >
      <RandomPicker />
    </ToolPage>
  );
}
