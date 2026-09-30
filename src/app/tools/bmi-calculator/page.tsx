import BmiCalculator from "@/components/pages/tools/BmiCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("bmi-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="bmi-calculator"
      about={
        <>
          <h2>How BMI Is Calculated</h2>
          <p>
            Body mass index is your weight in kilograms divided by your height in meters squared:{" "}
            <strong>BMI = kg ÷ m²</strong>. In imperial units it&apos;s weight in pounds × 703 ÷
            height in inches squared.
          </p>
          <h2>BMI Categories for Adults</h2>
          <ul>
            <li><strong>Below 18.5</strong> - Underweight</li>
            <li><strong>18.5 to 24.9</strong> - Healthy weight</li>
            <li><strong>25 to 29.9</strong> - Overweight</li>
            <li><strong>30 and above</strong> - Obese</li>
          </ul>
          <h2>Limitations of BMI</h2>
          <p>
            BMI is a quick screening tool, not a diagnosis. It doesn&apos;t distinguish muscle from
            fat, so athletes can score as &ldquo;overweight&rdquo;, and it doesn&apos;t apply to
            children, teens or pregnant women. Talk to a doctor for advice about your health.
          </p>
        </>
      }
    >
      <BmiCalculator />
    </ToolPage>
  );
}
