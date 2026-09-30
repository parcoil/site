import LoanCalculator from "@/components/pages/tools/LoanCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("loan-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="loan-calculator"
      about={
        <>
          <h2>How Loan Payments Are Calculated</h2>
          <p>
            Most mortgages, car loans and personal loans are amortizing loans with a fixed monthly
            payment. The payment is calculated as:
          </p>
          <p>
            <strong>M = P × r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)</strong>
          </p>
          <p>
            where <em>P</em> is the amount borrowed, <em>r</em> is the monthly interest rate (the
            annual rate ÷ 12) and <em>n</em> is the number of monthly payments. Early payments are
            mostly interest; as the balance falls, more of each payment goes to principal.
          </p>
          <h2>The Power of Extra Payments</h2>
          <p>
            Anything you pay beyond the required amount goes straight to the principal, which
            reduces every future interest charge. On a 30-year mortgage, even a small extra monthly
            payment can shave years off the loan and save tens of thousands in interest. Try it
            above.
          </p>
          <p>
            This calculator doesn&apos;t include taxes, insurance, PMI or fees, so your actual
            payment may be higher. It&apos;s an estimate, not financial advice.
          </p>
        </>
      }
    >
      <LoanCalculator />
    </ToolPage>
  );
}
