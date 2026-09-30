import Pixel from "@/components/pages/tools/Pixel";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("pixel");

export default function Page() {
  return (
    <ToolPage
      slug="pixel"
      about={
        <>
          <h2>How to Find Dead Pixels</h2>
          <p>
            A dead pixel stays black on every color, a stuck pixel stays one bright color (often
            red, green or blue), and a hot pixel stays white. Cycling through solid colors in full
            screen makes these defects easy to spot.
          </p>
          <ol>
            <li>Clean your screen first so dust isn&apos;t mistaken for a bad pixel</li>
            <li>Start the test and look closely at each color from a normal viewing distance</li>
            <li>On the black screen, look for pixels that stay lit; on white, look for dark dots</li>
            <li>Check the edges and corners of the black screen for backlight bleed</li>
          </ol>
          <h2>Can Stuck Pixels Be Fixed?</h2>
          <p>
            Stuck pixels can sometimes be revived by gently massaging the area with a soft cloth or
            by rapidly flashing colors over them for a while. Dead pixels usually can&apos;t be
            fixed, so check your monitor&apos;s warranty, as many manufacturers replace screens
            with a certain number of dead pixels.
          </p>
        </>
      }
    >
      <Pixel />
    </ToolPage>
  );
}
