import QRCodeGenerator from "@/components/pages/tools/QRCode";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("qr-code");

export default function Page() {
  return (
    <ToolPage
      slug="qr-code"
      about={
        <>
          <h2>What are QR Codes Used For?</h2>
          <p>
            QR codes (Quick Response codes) are versatile tools that can store various types of
            information and be scanned by most smartphone cameras. They provide a convenient way to
            share information without manual typing.
          </p>
          <h3>Common QR Code Applications</h3>
          <ul>
            <li>Website URLs and landing pages</li>
            <li>Wi-Fi network credentials, so guests can join without typing a password</li>
            <li>Pre-filled emails and text messages</li>
            <li>Product information and marketing materials</li>
            <li>Event tickets and check-ins</li>
          </ul>
          <h3>How to Use This Tool</h3>
          <ol>
            <li>Select the type of QR code you want to create</li>
            <li>Enter the information you want to encode</li>
            <li>Customize the size, colors and error correction if needed</li>
            <li>Download your QR code as a PNG image or scalable SVG for print</li>
            <li>Test your QR code by scanning it with a smartphone camera</li>
          </ol>
          <p>
            Your QR code is generated directly in your browser, so Wi-Fi passwords and other
            details are never sent to a server. Keep strong contrast between the foreground and
            background colors, and use a dark foreground on a light background for the best
            scanning results.
          </p>
        </>
      }
    >
      <QRCodeGenerator />
    </ToolPage>
  );
}
