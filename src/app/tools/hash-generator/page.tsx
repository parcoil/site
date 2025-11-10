import dynamic from "next/dynamic";

const HashGenerator = dynamic(() => import("@/components/pages/tools/HashGenerator"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">Loading hash generator...</div>
    </div>
  ),
});

export const metadata = {
  title: "Hash Generator Tool | Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 Hashes",
  description:
    "Free online hash generator for MD5, SHA-1, SHA-256, SHA-384, and SHA-512. Generate cryptographic hashes from text securely.",
  keywords: [
    "hash generator",
    "md5 hash",
    "sha1 hash",
    "sha256 hash",
    "sha384 hash",
    "sha512 hash",
    "cryptographic hash",
    "online hash tool",
  ],
  openGraph: {
    title: "Hash Generator Tool",
    description: "Free online hash generator for various cryptographic algorithms.",
    type: "website",
    locale: "en_US",
  },
};

export default function HashGeneratorPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Hash Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate cryptographic hashes using various algorithms including SHA-256,
          SHA-384, SHA-512, and SHA-1. All hashing is done securely in your browser.
        </p>
      </div>

      <main>
        <HashGenerator />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About Cryptographic Hashing</h2>
        <p>
          Cryptographic hash functions are mathematical algorithms that map data of
          arbitrary size to a fixed-size string of characters. They're designed to be
          one-way functions, meaning it's computationally infeasible to reverse the
          process.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Common Uses</h2>
        <ul>
          <li>Password storage and verification</li>
          <li>Data integrity checking</li>
          <li>Digital signatures</li>
          <li>Blockchain and cryptocurrency</li>
          <li>File integrity verification</li>
        </ul>
      </section>
    </main>
  );
}