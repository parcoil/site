import ExifRemover from "@/components/pages/tools/ExifRemover";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("exif-remover");

export default function Page() {
  return (
    <ToolPage
      slug="exif-remover"
      about={
        <>
          <h2>What Is EXIF Data?</h2>
          <p>
            EXIF is information your camera or phone saves inside every photo: the camera model,
            lens and settings, the exact date and time, and often the GPS coordinates of where the
            photo was taken. Editing apps can add more, such as XMP and IPTC blocks with your name
            or software details.
          </p>
          <h2>Why Remove Photo Metadata?</h2>
          <ul>
            <li>GPS coordinates can reveal your home address or daily routine</li>
            <li>Serial numbers and owner names can link photos back to you</li>
            <li>Timestamps show exactly when a photo was taken</li>
            <li>Metadata adds a little extra size to every file</li>
          </ul>
          <p>
            Some social networks strip metadata when you upload, but many messaging apps, email,
            cloud drives and forums keep it. Removing it yourself is the only way to be sure.
          </p>
          <h2>Lossless Cleaning</h2>
          <p>
            For JPG, PNG and WebP, this tool removes the metadata blocks directly from the file
            without re-compressing the image, so quality is untouched. Color profiles are kept so
            colors look the same, and a photo&apos;s orientation is preserved so it isn&apos;t shown
            sideways. Everything runs in your browser; your photos are never uploaded.
          </p>
          <p>
            Want to add a title, copyright or location instead? Use the{" "}
            <a href="/tools/metadata-editor">Photo Metadata Editor</a>.
          </p>
        </>
      }
    >
      <ExifRemover />
    </ToolPage>
  );
}
