import AgeCalculator from "@/components/pages/tools/AgeCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("age-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="age-calculator"
      about={
        <>
          <h2>How Age Is Calculated</h2>
          <p>
            Your age is counted in whole years since your birth date, then whole months, then the
            remaining days, the same way people usually say &ldquo;5 years and 3 months old&rdquo;.
            Leap years and months of different lengths are handled automatically.
          </p>
          <h2>More Than Just Years</h2>
          <ul>
            <li>Your total age in months, weeks, days and hours</li>
            <li>How many days until your next birthday, and what day of the week it falls on</li>
            <li>The day of the week you were born</li>
            <li>Your Western star sign and Chinese zodiac animal</li>
          </ul>
          <p>
            Change the &ldquo;Age on&rdquo; date to find out how old someone was, or will be, on
            any date: handy for forms, eligibility checks and milestone birthdays. Chinese zodiac
            years begin at Lunar New Year, so people born in January or early February may belong
            to the previous year&apos;s animal.
          </p>
        </>
      }
    >
      <AgeCalculator />
    </ToolPage>
  );
}
