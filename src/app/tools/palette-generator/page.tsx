import PaletteGenerator from "@/components/pages/tools/PaletteGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("palette-generator");

export default function Page() {
  return (
    <ToolPage
      slug="palette-generator"
      about={
        <>
          <h2>Color Harmonies Explained</h2>
          <ul>
            <li><strong>Complementary</strong> - opposite colors on the color wheel, bold and high-contrast</li>
            <li><strong>Analogous</strong> - neighbours on the wheel, calm and cohesive</li>
            <li><strong>Triadic</strong> - three evenly spaced colors, vibrant but balanced</li>
            <li><strong>Split complementary</strong> - a base plus the two colors beside its complement</li>
            <li><strong>Tetradic</strong> - two complementary pairs, rich but hard to balance</li>
          </ul>
          <h2>Shades and Tints for Design Systems</h2>
          <p>
            Modern design systems like Tailwind CSS use a scale from 50 (lightest) to 950
            (darkest) for each color. This generator puts your base color at 500 and builds the
            rest by adjusting lightness while keeping its hue and saturation, then exports the
            scale as CSS custom properties, a Tailwind config or JSON.
          </p>
          <p>
            Tip: use 50–100 for backgrounds, 500–600 for buttons and accents, and 800–950 for
            text on light backgrounds. Check your pairs with the{" "}
            <a href="/tools/contrast-checker">Contrast Checker</a>.
          </p>
        </>
      }
    >
      <PaletteGenerator />
    </ToolPage>
  );
}
