import TimezoneConverter from "@/components/pages/tools/TimezoneConverter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("timezone-converter");

export default function Page() {
  return (
    <ToolPage
      slug="timezone-converter"
      about={
        <>
          <h2>How to Convert Time Zones</h2>
          <ol>
            <li>Pick the date and time you want to convert</li>
            <li>Choose the time zone that time is in (your own zone is selected by default)</li>
            <li>See the matching local time in every city on the list</li>
            <li>Add or remove cities to plan meetings across teams</li>
          </ol>
          <h2>Daylight Saving Time</h2>
          <p>
            Countries switch to daylight saving time on different dates, and some don&apos;t use it
            at all, so the gap between two cities can change during the year. This converter uses
            your browser&apos;s built-in time zone database, so it always applies the correct rules
            for the date you choose.
          </p>
          <h2>Common Abbreviations</h2>
          <ul>
            <li><strong>PST / PDT</strong> - Pacific Time (Los Angeles), UTC−8 / UTC−7</li>
            <li><strong>EST / EDT</strong> - Eastern Time (New York), UTC−5 / UTC−4</li>
            <li><strong>GMT / BST</strong> - London, UTC+0 / UTC+1</li>
            <li><strong>CET / CEST</strong> - Central Europe, UTC+1 / UTC+2</li>
            <li><strong>IST</strong> - India, UTC+5:30</li>
            <li><strong>JST</strong> - Japan, UTC+9</li>
          </ul>
        </>
      }
    >
      <TimezoneConverter />
    </ToolPage>
  );
}
