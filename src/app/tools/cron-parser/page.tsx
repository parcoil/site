import CronParser from "@/components/pages/tools/CronParser";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("cron-parser");

export default function Page() {
  return (
    <ToolPage
      slug="cron-parser"
      about={
        <>
          <h2>Cron Syntax</h2>
          <p>
            A cron expression has five fields separated by spaces:{" "}
            <code>minute hour day-of-month month day-of-week</code>. Each field accepts:
          </p>
          <ul>
            <li><code>*</code> - every value</li>
            <li><code>5</code> - a single value</li>
            <li><code>1-5</code> - a range</li>
            <li><code>1,15,30</code> - a list</li>
            <li><code>*/10</code> - every 10th value</li>
            <li><code>MON-FRI</code>, <code>JAN,JUL</code> - day and month names</li>
          </ul>
          <p>
            Shortcuts like <code>@hourly</code>, <code>@daily</code>, <code>@weekly</code>,{" "}
            <code>@monthly</code> and <code>@yearly</code> also work.
          </p>
          <h2>A Classic Gotcha</h2>
          <p>
            When both day-of-month and day-of-week are set, cron runs when <em>either</em> one
            matches, not both. So <code>0 12 13 * 5</code> runs on the 13th of every month{" "}
            <em>and</em> every Friday, not just on Friday the 13th.
          </p>
          <p>
            Remember that cron runs in the server&apos;s time zone, which is often UTC. Toggle
            &ldquo;Show in UTC&rdquo; to see exactly when a server would run your job.
          </p>
        </>
      }
    >
      <CronParser />
    </ToolPage>
  );
}
