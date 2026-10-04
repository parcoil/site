import BoxShadowGenerator from "@/components/pages/tools/BoxShadowGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("box-shadow-generator");

export default function Page() {
  return (
    <ToolPage
      slug="box-shadow-generator"
      about={
        <>
          <h2>The box-shadow Property</h2>
          <p>
            A CSS box shadow is written as{" "}
            <code>box-shadow: [inset] x-offset y-offset blur spread color</code>. Positive offsets
            move the shadow right and down, blur softens its edge, and spread grows or shrinks it
            before blurring.
          </p>
          <h2>Tips for Realistic Shadows</h2>
          <ul>
            <li>Layer two or three shadows: a tight, darker one and a large, faint one</li>
            <li>Use low opacity (5–25%) rather than solid black</li>
            <li>A negative spread keeps large blurs from spilling out the sides</li>
            <li>Tint shadows with a dark version of the background color instead of pure black</li>
            <li>Keep the light source consistent across your whole design</li>
          </ul>
          <p>
            Try the presets for popular styles, including soft card shadows, neumorphism, glows
            and inset fields, then fine-tune each layer.
          </p>
        </>
      }
    >
      <BoxShadowGenerator />
    </ToolPage>
  );
}
