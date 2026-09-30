import ColorPicker from "@/components/pages/tools/ColorPicker";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("color-picker");

export default function Page() {
  return (
    <ToolPage
      slug="color-picker"
      about={
        <>
          <h2>About Color Formats</h2>
          <p>
            Different color formats are used in various contexts in web development and design.
            Understanding these formats helps you implement colors correctly across different
            platforms and tools.
          </p>
          <h3>Common Color Formats</h3>
          <ul>
            <li><strong>HEX</strong> - Hexadecimal format (e.g., #FF5733) commonly used in CSS and design tools</li>
            <li><strong>RGB</strong> - Red, Green, Blue format (e.g., rgb(255, 87, 51)) used in CSS and programming</li>
            <li><strong>HSL</strong> - Hue, Saturation, Lightness (e.g., hsl(14, 100%, 60%)) which is intuitive for adjusting colors</li>
            <li><strong>CMYK</strong> - Cyan, Magenta, Yellow, Key (black) used for print design</li>
          </ul>
          <h3>How to Use This Tool</h3>
          <ol>
            <li>Click the swatch to pick a color visually, or type any color value</li>
            <li>Fine-tune it with the RGB or HSL sliders</li>
            <li>Copy the color in your preferred format</li>
            <li>Save colors to your palette for future reference</li>
            <li>Export your color palette as CSS variables</li>
          </ol>
        </>
      }
    >
      <ColorPicker />
    </ToolPage>
  );
}
