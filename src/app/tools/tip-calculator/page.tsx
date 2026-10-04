import TipCalculator from "@/components/pages/tools/TipCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("tip-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="tip-calculator"
      about={
        <>
          <h2>How Much Should I Tip?</h2>
          <p>
            Tipping customs vary a lot by country. In the United States, these are common
            guidelines:
          </p>
          <ul>
            <li><strong>Sit-down restaurants</strong> - 15–20%, more for great service</li>
            <li><strong>Bars</strong> - $1–2 per drink or 15–20% of the tab</li>
            <li><strong>Food delivery</strong> - 10–20%, with a few dollars minimum</li>
            <li><strong>Taxis and rideshare</strong> - 10–20%</li>
            <li><strong>Hair stylists and barbers</strong> - 15–20%</li>
          </ul>
          <p>
            In much of Europe and Asia service is included or tipping is optional, and in Japan
            it can even be considered rude. When in doubt, check local customs.
          </p>
          <h2>Quick Mental Math</h2>
          <p>
            For a 20% tip, move the decimal point one place left and double it: on a $64.50 bill,
            10% is $6.45, so 20% is $12.90.
          </p>
        </>
      }
    >
      <TipCalculator />
    </ToolPage>
  );
}
