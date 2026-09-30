import UnitConverter from "@/components/pages/tools/UnitConverter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("unit-converter");

export default function Page() {
  return (
    <ToolPage
      slug="unit-converter"
      about={
        <>
          <h2>About Unit Conversion</h2>
          <p>
            Unit conversion is the process of converting a measurement from one unit to another.
            This is essential in many fields including science, engineering, cooking, and everyday
            life. Type in either box and the other updates instantly, with a table of the same
            value in every other unit.
          </p>
          <h2>Common Conversions</h2>
          <ul>
            <li>Length: 1 inch = 2.54 cm, 1 mile = 1.609 km</li>
            <li>Weight: 1 kg = 2.205 lb, 1 lb = 453.6 g</li>
            <li>Temperature: °F = °C × 9/5 + 32</li>
            <li>Volume: 1 US gallon = 3.785 liters, 1 cup = 236.6 mL</li>
            <li>Data: 1 GB = 1,000 MB, while 1 GiB = 1,024 MiB</li>
            <li>Energy: 1 food Calorie = 1 kcal = 4.184 kJ</li>
          </ul>
        </>
      }
    >
      <UnitConverter />
    </ToolPage>
  );
}
