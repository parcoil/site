import MicTest from "@/components/pages/tools/MicTest";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("mic-test");

export default function Page() {
  return (
    <ToolPage
      slug="mic-test"
      about={
        <>
          <h2>How to Test Your Microphone</h2>
          <ol>
            <li>Click &ldquo;Start microphone&rdquo; and allow access when your browser asks</li>
            <li>Speak normally. The level meter and waveform should move with your voice</li>
            <li>Record a short clip and play it back to hear how you sound to others</li>
          </ol>
          <h2>Reading the Level Meter</h2>
          <p>
            Levels are shown in dBFS, where 0 dB is the loudest possible signal. Normal speech
            should peak around −20 to −10 dB. If it stays near the left, raise your input volume in
            your system sound settings; if it hits the red, lower it to avoid distortion.
          </p>
          <h2>Microphone Not Working?</h2>
          <ul>
            <li>Check the mute switch on your headset or the mic&apos;s own mute button</li>
            <li>Make sure the right input device is selected here and in your system settings</li>
            <li>Allow microphone access for your browser in your operating system&apos;s privacy settings</li>
            <li>Close other apps that might be using the microphone</li>
          </ul>
        </>
      }
    >
      <MicTest />
    </ToolPage>
  );
}
