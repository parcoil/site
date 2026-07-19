import TextCaseConverter from "@/components/pages/tools/TextCaseConverter";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Text Case Converter | Free Online Tool | Parcoil",
  description:
    "Convert text between different cases: uppercase, lowercase, title case, camel case, snake case, and more with this free online tool.",
  keywords: [
    "text case converter",
    "uppercase converter",
    "lowercase converter",
    "title case converter",
    "camel case converter",
    "snake case converter",
    "kebab case converter",
    "text transformation tool",
  ],
  openGraph: {
    title: "Text Case Converter | Free Online Tool",
    description:
      "Convert text between different cases: uppercase, lowercase, title case, camel case, snake case, and more.",
    type: "website",
    locale: "en_US",
  },
  canonical: "https://parcoil.com/tools/text-case-converter",
};

export default function TextCaseConverterPage() {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Text Case Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert text between different cases: uppercase, lowercase, title case, camel case, snake case, and more.
        </p>
      </header>

      <main>
        <TextCaseConverter />
      </main>

      <section className="py-8 px-4 mt-6">
        <AdBanner />
      </section>

      <section className="mt-8 text-left max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          About Text Cases
        </h2>
        <div className="space-y-4">
          <p>
            Different text cases are used in various contexts in programming, writing, and design. Understanding these formats helps you maintain consistency in your projects.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">
            Common Text Cases
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>UPPERCASE</strong> - All characters are capitalized</li>
            <li><strong>lowercase</strong> - All characters are in small letters</li>
            <li><strong>Title Case</strong> - The First Letter Of Each Word Is Capitalized</li>
            <li><strong>camelCase</strong> - First letter is lowercase, first letter of each subsequent word is uppercase, no spaces</li>
            <li><strong>PascalCase</strong> - First letter of each word is uppercase, no spaces</li>
            <li><strong>snake_case</strong> - All lowercase with underscores between words</li>
            <li><strong>kebab-case</strong> - All lowercase with hyphens between words</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">
            When to Use Different Cases
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>UPPERCASE</strong> - Headlines, acronyms, constants in programming</li>
            <li><strong>lowercase</strong> - Regular text, CSS properties</li>
            <li><strong>Title Case</strong> - Titles, headings, book names</li>
            <li><strong>camelCase</strong> - JavaScript variables and functions</li>
            <li><strong>PascalCase</strong> - Class names in many programming languages</li>
            <li><strong>snake_case</strong> - Python variables, SQL table names</li>
            <li><strong>kebab-case</strong> - CSS class names, HTML IDs and attributes</li>
          </ul>
        </div>
      </section>

      <section className="py-8 px-4 mt-8">
        <AdBanner />
      </section>
    </div>
  );
}