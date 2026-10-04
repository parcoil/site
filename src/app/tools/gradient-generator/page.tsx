import GradientGenerator from "@/components/pages/tools/GradientGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("gradient-generator");

export default function Page() {
  return (
    <ToolPage
      slug="gradient-generator"
      about={
        <>
          <h2>Types of CSS Gradients</h2>
          <ul>
            <li>
              <strong>Linear</strong> - colors blend along a straight line at any angle.{" "}
              <code>90deg</code> goes left to right; <code>180deg</code> goes top to bottom.
            </li>
            <li><strong>Radial</strong> - colors radiate outward from the center as a circle or ellipse</li>
            <li><strong>Conic</strong> - colors sweep around a center point, great for pie charts and color wheels</li>
          </ul>
          <h2>Using the CSS</h2>
          <p>
            Copy the generated <code>background</code> declaration into any CSS rule. Gradients are
            images in CSS, so you can also use them with <code>background-image</code>, layer
            several with commas, or combine them with <code>background-clip: text</code> for
            gradient text.
          </p>
          <p>
            All modern browsers support these gradients without vendor prefixes.
          </p>
        </>
      }
    >
      <GradientGenerator />
    </ToolPage>
  );
}
