import QRCodeGenerator from "@/components/pages/tools/QRCode";
import AdBanner from "@/components/AdBanner";
import BannerAd from "@/components/BannerAd";

export const metadata = {
  title: "QR Code Generator | Free Online Tool | Parcoil",
  description:
    "Create QR codes instantly for URLs or text with this free online tool. No ads, no tracking, instant results.",
  keywords: [
    "qr code generator",
    "create qr code",
    "free qr code",
    "online qr code tool",
    "url to qr code",
    "text to qr code",
  ],
  openGraph: {
    title: "Create QR Codes Instantly | Parcoil QR Code Generator",
    description:
      "Generate customizable QR codes for websites or text with Parcoil's free tool.",
    type: "website",
    locale: "en_US",
  },
  canonical: "https://parcoil.com/tools/qr-code",
};

export default function QRCodeGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          QR Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Create QR codes instantly for URLs or text.
          Customize size and download as PNG.
        </p>
      </header>

      <main>
        <QRCodeGenerator />
      </main>

      <section className="py-8 px-4 mt-6">
        <AdBanner />
      </section>

      <section className="mt-8 text-left max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          What are QR Codes Used For?
        </h2>
        <div className="space-y-4">
          <p>
            QR codes (Quick Response codes) are versatile tools that can store various types of information and be scanned by most smartphone cameras. They provide a convenient way to share information without manual typing.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">
            Common QR Code Applications
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Website URLs and landing pages</li>
            <li>Text messages and notes</li>
            <li>Wi-Fi network credentials</li>
            <li>Product information and marketing materials</li>
            <li>Event tickets and check-ins</li>
            <li>Payment information</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">
            How to Use This Tool
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Select the type of QR code you want to create</li>
            <li>Enter the information you want to encode</li>
            <li>Customize the size if needed</li>
            <li>Download your QR code as a PNG image</li>
            <li>Test your QR code by scanning it with a smartphone camera</li>
          </ol>
        </div>
      </section>

      <section className="py-8 px-4 mt-8">
        <AdBanner />
      </section>

      <section className="py-8 px-4 flex justify-center">
        <BannerAd adKey="fd31f3a208951023a4608886cfeb1c42" width={300} height={250} />
      </section>
    </div>
  );
}