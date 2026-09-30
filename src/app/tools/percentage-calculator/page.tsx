import PercentageCalculator from "@/components/pages/tools/PercentageCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("percentage-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="percentage-calculator"
      about={
        <>
          <h2>Percentage Formulas</h2>
          <ul>
            <li><strong>X% of Y</strong> = X ÷ 100 × Y. For example, 20% of 150 = 30.</li>
            <li><strong>X is what % of Y</strong> = X ÷ Y × 100. For example, 30 is 25% of 120.</li>
            <li>
              <strong>Percentage change</strong> = (new − old) ÷ old × 100. Going from 80 to 100 is
              a 25% increase.
            </li>
            <li><strong>Sale price</strong> = price × (1 − discount ÷ 100).</li>
          </ul>
          <h2>A Common Mistake</h2>
          <p>
            Percentage changes aren&apos;t symmetric. If a price rises 25% from 80 to 100, it needs
            to fall only 20% to get back to 80, because the second change is measured from the
            larger number.
          </p>
        </>
      }
    >
      <PercentageCalculator />
    </ToolPage>
  );
}
