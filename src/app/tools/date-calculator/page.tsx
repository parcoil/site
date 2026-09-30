import DateCalculator from "@/components/pages/tools/DateCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("date-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="date-calculator"
      about={
        <>
          <h2>Count the Days Between Two Dates</h2>
          <p>
            Pick a start and end date to see the difference in days, weeks, months and years, plus
            the number of business days (Monday to Friday). Turn on &ldquo;Include the end
            date&rdquo; when both days count, such as for hotel stays, leave requests or event
            durations.
          </p>
          <h2>Add or Subtract Time</h2>
          <p>
            Find the date a number of days, weeks, months or years before or after another date,
            like 90 days from today, a contract end date or a due date. With &ldquo;business days
            only&rdquo;, weekends are skipped, which is useful for shipping and payment terms.
          </p>
          <p>
            Adding a month to January 31 gives the last day of February, the same convention
            spreadsheets and most banks use. Public holidays vary by country and aren&apos;t
            excluded from business days.
          </p>
        </>
      }
    >
      <DateCalculator />
    </ToolPage>
  );
}
