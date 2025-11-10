import UUIDGenerator from "@/components/pages/tools/UUIDGenerator";

export const metadata = {
  title: "UUID Generator Tool | Generate Random UUIDs Online",
  description:
    "Free online UUID generator. Generate version 4 UUIDs instantly. Perfect for developers, databases, and unique identifiers.",
  keywords: [
    "uuid generator",
    "guid generator",
    "unique identifier",
    "random uuid",
    "uuid v4",
    "online uuid tool",
  ],
  openGraph: {
    title: "UUID Generator Tool",
    description: "Free online UUID generator for unique identifiers.",
    type: "website",
    locale: "en_US",
  },
};

export default function UUIDGeneratorPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          UUID Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate random UUIDs (Universally Unique Identifiers) instantly.
          UUIDs are 128-bit numbers used to uniquely identify information in
          computer systems.
        </p>
      </div>

      <main>
        <UUIDGenerator />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About UUIDs</h2>
        <p>
          A UUID (Universally Unique Identifier) is a 128-bit number used to
          uniquely identify information in computer systems. UUIDs are designed
          to be unique across space and time, making them ideal for use as
          primary keys in databases or identifiers in distributed systems.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">UUID Versions</h2>
        <ul>
          <li><strong>UUID v1:</strong> Based on timestamp and MAC address</li>
          <li><strong>UUID v3:</strong> Based on MD5 hash of namespace and name</li>
          <li><strong>UUID v4:</strong> Random (what we generate here)</li>
          <li><strong>UUID v5:</strong> Based on SHA-1 hash of namespace and name</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Common Uses</h2>
        <ul>
          <li>Database primary keys</li>
          <li>Session identifiers</li>
          <li>API keys and tokens</li>
          <li>File names in distributed systems</li>
          <li>Object identifiers in applications</li>
        </ul>
      </section>
    </main>
  );
}