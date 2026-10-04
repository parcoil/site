import WebcamTest from "@/components/pages/tools/WebcamTest";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("webcam-test");

export default function Page() {
  return (
    <ToolPage
      slug="webcam-test"
      about={
        <>
          <h2>How to Test Your Webcam</h2>
          <ol>
            <li>Click &ldquo;Start camera&rdquo; and allow camera access when your browser asks</li>
            <li>You should see yourself. If you have several cameras, pick one from the list</li>
            <li>Try different resolutions to see what your camera really supports</li>
            <li>Check the measured frame rate. 30 fps is standard; below 15 fps looks choppy</li>
          </ol>
          <h2>Webcam Not Working?</h2>
          <ul>
            <li>Make sure no other app (Zoom, Teams, Discord, OBS) is using the camera</li>
            <li>Check the camera permission in your browser&apos;s address bar and in your system privacy settings</li>
            <li>Look for a physical privacy shutter or a keyboard shortcut that disables the camera</li>
            <li>Try another USB port, or update the camera driver</li>
          </ul>
          <h2>Privacy</h2>
          <p>
            Your video is shown directly from your camera to this page and is never recorded or
            uploaded. Snapshots are saved straight to your device.
          </p>
        </>
      }
    >
      <WebcamTest />
    </ToolPage>
  );
}
