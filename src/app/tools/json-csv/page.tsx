import JsonCsv from "@/components/pages/tools/JsonCsv";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("json-csv");

export default function Page() {
  return (
    <ToolPage
      slug="json-csv"
      about={
        <>
          <h2>Converting JSON to CSV</h2>
          <p>
            Paste an array of JSON objects and each object becomes a row, with a column for every
            key found. Nested objects are flattened into dotted column names, so{" "}
            <code>{`{"address": {"city": "London"}}`}</code> becomes a column called{" "}
            <code>address.city</code>. Arrays are kept as JSON text in a single cell.
          </p>
          <h2>Converting CSV to JSON</h2>
          <p>
            The delimiter (comma, semicolon, tab or pipe) is detected automatically, and quoted
            fields with commas or line breaks are handled correctly. With header detection on,
            each row becomes an object keyed by the column names; numbers, true/false and empty
            cells can be converted to proper JSON types.
          </p>
          <h2>Opening CSV in Excel</h2>
          <p>
            Excel in some regions expects semicolons instead of commas. If your columns end up
            squashed together, convert again with the semicolon delimiter.
          </p>
        </>
      }
    >
      <JsonCsv />
    </ToolPage>
  );
}
