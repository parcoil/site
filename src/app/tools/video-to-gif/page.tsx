import VideoToGif from "@/components/pages/tools/VideoToGif";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("video-to-gif");

export default function Page() {
  return (
    <ToolPage
      slug="video-to-gif"
      about={
        <>
          <h2>How to Make a GIF From a Video</h2>
          <ol>
            <li>Drop an MP4, WebM or MOV clip onto the page</li>
            <li>Pick where the GIF starts and how long it lasts</li>
            <li>Choose the width and frame rate</li>
            <li>Click Create GIF, preview it and download</li>
          </ol>
          <h2>Keeping GIFs Small</h2>
          <p>
            GIF is an old format with no modern compression, so file size grows quickly with
            length, size and frame rate. For sharing in chats and on forums, try:
          </p>
          <ul>
            <li>3–5 seconds or less</li>
            <li>320px or 480px wide</li>
            <li>10 frames per second, which still looks smooth for most clips</li>
            <li>Dithering off unless the clip has smooth gradients like skies</li>
          </ul>
          <h2>Your Video Stays on Your Device</h2>
          <p>
            Frames are captured and encoded into a GIF right in your browser using a built-in GIF
            encoder, so your video is never uploaded anywhere.
          </p>
        </>
      }
    >
      <VideoToGif />
    </ToolPage>
  );
}
