import ColorPicker from "@/components/pages/tools/ColorPicker";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Color Picker & Converter | Free Online Tool | Parcoil",
  description:
    "Select colors and convert between HEX, RGB, and HSL formats with this free online color picker tool. Save your favorite colors for future use.",
  keywords: [
    "color picker",
    "color converter",
    "hex to rgb",
    "rgb to hex",
    "hsl converter",
    "web design tool",
    "color palette",
  ],
  openGraph: {
    title: "Color Picker & Converter | Free Online Tool",
    description:
      "Select colors and convert between HEX, RGB, and HSL formats with this free online tool.",
    type: "website",
    locale: "en_US",
  },
  canonical: "https://parcoil.com/tools/color-picker",
};

export default function ColorPickerPage() {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Color Picker & Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select colors visually and convert between HEX, RGB, and HSL formats.
          Save your favorite colors for your projects.
        </p>
      </header>

      <main>
        <ColorPicker />
      </main>

      <section className="py-8 px-4 mt-6">
        <AdBanner />
      </section>

      <section className="mt-8 text-left max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          About Color Formats
        </h2>
        <div className="space-y-4">
          <p>
            Different color formats are used in various contexts in web development and design. Understanding these formats helps you implement colors correctly across different platforms and tools.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">
            Common Color Formats
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>HEX</strong> - Hexadecimal format (e.g., #FF5733) commonly used in CSS and design tools</li>
            <li><strong>RGB</strong> - Red, Green, Blue format (e.g., rgb(255, 87, 51)) used in CSS and programming</li>
            <li><strong>HSL</strong> - Hue, Saturation, Lightness (e.g., hsl(14, 100%, 60%)) which is intuitive for adjusting colors</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">
            How to Use This Tool
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Use the color picker to visually select a color</li>
            <li>Adjust the color using the sliders if needed</li>
            <li>Copy the color in your preferred format (HEX, RGB, or HSL)</li>
            <li>Save colors to your palette for future reference</li>
            <li>Export your color palette for use in your projects</li>
          </ol>
        </div>
      </section>

      <section className="py-8 px-4 mt-8">
        <AdBanner />
      </section>
    </div>
  );
}