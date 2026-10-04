import SpeakerTest from "@/components/pages/tools/SpeakerTest";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("speaker-test");

export default function Page() {
  return (
    <ToolPage
      slug="speaker-test"
      about={
        <>
          <h2>Left and Right Audio Test</h2>
          <p>
            Click Left and Right to play a chime through each channel separately. You should hear
            it only from that side. If it comes from the wrong side, your headphones are on
            backwards or your speakers are swapped; if it comes from both, check that
            &ldquo;mono audio&rdquo; isn&apos;t enabled in your accessibility settings.
          </p>
          <h2>Frequency Sweep</h2>
          <p>
            The sweep glides from 20 Hz, the deepest bass humans hear, up to 20,000 Hz. Note when
            the sound first appears and when it fades: small speakers often can&apos;t reproduce
            much below 100 Hz, and most adults can&apos;t hear above 15–17 kHz. Rattles or buzzing
            at certain frequencies can reveal loose parts or a damaged driver.
          </p>
          <h2>Tone Generator</h2>
          <p>
            Play a steady tone at any frequency to tune instruments (A4 is 440 Hz), test subwoofers
            or find resonances in a room. Keep the volume low: very low and very high frequencies
            can damage speakers and hearing at high volume.
          </p>
        </>
      }
    >
      <SpeakerTest />
    </ToolPage>
  );
}
