import { notFound } from "next/navigation";
import ImageConverter from "@/components/pages/tools/ImageConverter";
import ConversionLinks from "@/components/tools/ConversionLinks";
import ToolPage from "@/components/tools/ToolPage";
import {
  FORMAT_DESCRIPTIONS,
  IMAGE_CONVERSIONS,
  IMAGE_FORMATS,
  SOURCE_FORMAT_LABELS,
  conversionSlug,
  findConversion,
} from "@/lib/image-formats";
import { toolMetadata } from "@/lib/tools";

type Props = { params: Promise<{ conversion: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return IMAGE_CONVERSIONS.map((c) => ({ conversion: conversionSlug(c) }));
}

export async function generateMetadata({ params }: Props) {
  const { conversion } = await params;
  return toolMetadata(`convert/${conversion}`);
}

export default async function Page({ params }: Props) {
  const { conversion: slug } = await params;
  const conversion = findConversion(slug);
  if (!conversion) notFound();

  const from = SOURCE_FORMAT_LABELS[conversion.from];
  const to = IMAGE_FORMATS[conversion.to];

  return (
    <ToolPage
      slug={`convert/${slug}`}
      about={
        <>
          <h2>How to Convert {from} to {to.label}</h2>
          <ol>
            <li>Drop your {from} files onto the page, click to browse, or paste with Ctrl+V</li>
            <li>{to.label} is already selected as the output format</li>
            {to.lossy && <li>Adjust the quality slider if you want smaller files</li>}
            {!to.transparency && (
              <li>Pick a background color to fill any transparent areas</li>
            )}
            <li>Download each {to.label} file, or all of them as a ZIP</li>
          </ol>
          <h2>
            {from} vs. {to.label}
          </h2>
          <p>{FORMAT_DESCRIPTIONS[conversion.from]}</p>
          <p>{FORMAT_DESCRIPTIONS[conversion.to]}</p>
          <h2>Is This {from} to {to.label} Converter Private?</h2>
          <p>
            Yes. Your {from} images are converted to {to.label} inside your own browser and are
            never uploaded to a server, so there are no file size limits, no queues and nothing to
            delete afterwards. You can even disconnect from the internet after the page loads.
          </p>
          <h2>Other Conversions</h2>
          <ConversionLinks currentSlug={`convert/${slug}`} className="not-prose" />
        </>
      }
    >
      <ImageConverter defaultFormat={conversion.to} sourceLabel={from} />
    </ToolPage>
  );
}
