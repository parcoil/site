import URLEncoder from "@/components/pages/tools/URLEncoder";

export const metadata = {
  title: "URL Encoder/Decoder Tool | Encode and Decode URLs Online",
  description:
    "Free online tool to encode and decode URLs. Convert special characters to percent-encoded format and back. No ads, no tracking.",
  keywords: [
    "url encoder",
    "url decoder",
    "encode url",
    "decode url",
    "percent encoding",
    "url encoding",
    "online url tool",
  ],
  openGraph: {
    title: "URL Encoder/Decoder Tool",
    description: "Free online tool to encode and decode URLs.",
    type: "website",
    locale: "en_US",
  },
};

export default function URLEncoderDecoderPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          URL Encoder/Decoder
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Encode URLs to make them safe for transmission or decode percent-encoded
          URLs back to their original form. All processing happens in your browser.
        </p>
      </div>

      <main>
        <URLEncoder />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About URL Encoding</h2>
        <p>
          URL encoding, also known as percent-encoding, is a mechanism for encoding
          information in a Uniform Resource Identifier (URI). It converts characters
          that are not allowed in a URL into a format that can be transmitted over
          the Internet.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">When to Use URL Encoding</h2>
        <ul>
          <li>Sending data in query parameters</li>
          <li>Embedding URLs in HTML or other markup</li>
          <li>Transmitting special characters in web addresses</li>
          <li>API calls with complex data</li>
        </ul>
      </section>
    </main>
  );
}