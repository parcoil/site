import Base from "@/components/pages/tools/Base";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Base64 Encoder/Decoder Tool | Convert Text to Base64 and Back",
  description:
    "Free online tool to encode text to Base64 and decode Base64 to text. No ads, no tracking, instant results.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "encode to base64",
    "decode base64",
    "online base64 tool",
    "text to base64",
    "base64 to text",
  ],
  openGraph: {
    title: "Base64 Encoder/Decoder Tool",
    description:
      "Free online tool to encode text to Base64 and decode Base64 to text.",
    type: "website",
    locale: "en_US",
  },
};

export default function Base64EncoderDecoderPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Base64 Encoder/Decoder
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Easily convert your text to Base64 encoding or decode Base64 back to
          plain text. Simple, fast, and secure - all processing happens in your
          browser.
        </p>
      </div>

      <main>
        <Base />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About Base64 Encoding</h2>
        <p>
          Base64 is an encoding scheme that represents binary data in an ASCII
          string format. It's commonly used when there's a need to encode binary
          data that needs to be stored and transferred over media that are
          designed to deal with text.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">
          Common Uses for Base64
        </h2>
        <ul>
          <li>Embedding image data in CSS or HTML</li>
          <li>Encoding email attachments (MIME)</li>
          <li>Storing complex data in XML or JSON</li>
          <li>Transferring data over protocols that may corrupt binary data</li>
         </ul>
       </section>

       <section className="py-8 px-4">
         <div className="max-w-4xl mx-auto">
           <AdBanner />
         </div>
       </section>
     </main>
  );
}
