import JSONFormatter from "@/components/pages/tools/JSONFormatter";

export const metadata = {
  title: "JSON Formatter Tool | Format, Validate and Minify JSON Online",
  description:
    "Free online JSON formatter to beautify, validate, and minify JSON data. Perfect for developers working with APIs and data.",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json minifier",
    "format json",
    "validate json",
    "online json tool",
  ],
  openGraph: {
    title: "JSON Formatter Tool",
    description: "Free online JSON formatter to beautify and validate JSON data.",
    type: "website",
    locale: "en_US",
  },
};

export default function JSONFormatterPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          JSON Formatter
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Format, validate, and minify JSON data with ease. Perfect for developers
          working with APIs, configuration files, and data interchange.
        </p>
      </div>

      <main>
        <JSONFormatter />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About JSON</h2>
        <p>
          JSON (JavaScript Object Notation) is a lightweight data-interchange format
          that's easy for humans to read and write, and easy for machines to parse
          and generate. It's widely used for APIs, configuration files, and data
          storage.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Common Uses</h2>
        <ul>
          <li>API request/response formatting</li>
          <li>Configuration file validation</li>
          <li>Data export/import</li>
          <li>Debugging API responses</li>
        </ul>
      </section>
    </main>
  );
}