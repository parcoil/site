import UnitConverter from "@/components/pages/tools/UnitConverter";

export const metadata = {
  title: "Unit Converter Tool | Convert Length, Weight, Temperature Units",
  description:
    "Free online unit converter for length, weight, and temperature. Convert between meters, feet, pounds, Celsius, and more.",
  keywords: [
    "unit converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "measurement converter",
    "online converter",
  ],
  openGraph: {
    title: "Unit Converter Tool",
    description: "Free online unit converter for various measurements.",
    type: "website",
    locale: "en_US",
  },
};

export default function UnitConverterPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Unit Converter
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Convert between different units of measurement including length, weight,
          and temperature. Fast, accurate conversions with no sign-up required.
        </p>
      </div>

      <main>
        <UnitConverter />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About Unit Conversion</h2>
        <p>
          Unit conversion is the process of converting a measurement from one unit
          to another. This is essential in many fields including science, engineering,
          cooking, and everyday life.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Common Conversions</h2>
        <ul>
          <li>Length: meters to feet, kilometers to miles</li>
          <li>Weight: kilograms to pounds, grams to ounces</li>
          <li>Temperature: Celsius to Fahrenheit</li>
          <li>Volume: liters to gallons, milliliters to fluid ounces</li>
        </ul>
      </section>
    </main>
  );
}