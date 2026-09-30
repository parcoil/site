import AudioConverter from "@/components/pages/tools/AudioConverter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("video-to-mp3");

export default function Page() {
  return (
    <ToolPage
      slug="video-to-mp3"
      about={
        <>
          <h2>How to Extract Audio From a Video</h2>
          <ol>
            <li>Drop an MP4, WebM or MOV video onto the page</li>
            <li>Wait a moment while the audio track is decoded</li>
            <li>Optionally trim the start and end, then choose MP3 or WAV</li>
            <li>Click convert, preview the result and download it</li>
          </ol>
          <h2>Private and Fast</h2>
          <p>
            Most video-to-MP3 sites make you upload the whole video first, which is slow for big
            files. Here, your browser reads the video&apos;s audio track directly on your device,
            so nothing is uploaded and there&apos;s no file size limit beyond your computer&apos;s
            memory.
          </p>
          <h2>Supported Videos</h2>
          <p>
            Any video your browser can play will work, which covers MP4 (AAC audio), WebM (Opus or
            Vorbis) and most MOV files. Some MKV and AVI files use audio codecs browsers don&apos;t
            support; if a file won&apos;t load, try Chrome or Firefox.
          </p>
        </>
      }
    >
      <AudioConverter video />
    </ToolPage>
  );
}
