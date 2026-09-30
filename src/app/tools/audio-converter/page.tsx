import AudioConverter from "@/components/pages/tools/AudioConverter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("audio-converter");

export default function Page() {
  return (
    <ToolPage
      slug="audio-converter"
      about={
        <>
          <h2>Convert Audio Without Uploading It</h2>
          <p>
            This converter decodes your audio with your browser&apos;s built-in decoders and
            re-encodes it on your device, so large recordings convert quickly and private audio
            stays private. Any format your browser can play can be converted, typically MP3, WAV,
            OGG, FLAC, M4A/AAC and Opus, plus the audio track of most video files.
          </p>
          <h2>MP3 or WAV?</h2>
          <ul>
            <li>
              <strong>MP3</strong> is compressed and plays everywhere. 128k is fine for speech,
              192k is a good default for music, and 320k is the highest quality.
            </li>
            <li>
              <strong>WAV</strong> is uncompressed 16-bit audio, which is best for editing in a DAW
              or when an app requires it, but about ten times larger than MP3.
            </li>
          </ul>
          <h2>Extra Options</h2>
          <ul>
            <li><strong>Trim</strong> the start and end with the range slider and preview the result</li>
            <li><strong>Mono</strong> halves the size of voice recordings and podcasts</li>
            <li><strong>Normalize</strong> raises the volume so the loudest peak is just below clipping</li>
          </ul>
        </>
      }
    >
      <AudioConverter />
    </ToolPage>
  );
}
