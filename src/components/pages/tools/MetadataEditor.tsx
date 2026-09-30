"use client";
import { useEffect, useRef, useState } from "react";
import { Download, LocateFixed, MapPin, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileDropzone from "@/components/tools/FileDropzone";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SwitchField } from "@/components/tools/fields";
import { readMetadata } from "@/lib/exif";
import {
  EMPTY_VALUES,
  type MetadataValues,
  applyValues,
  mergeValues,
  parseCoordinate,
  readExifBlock,
  readFileValues,
  writeMetadata,
} from "@/lib/exif-writer";
import { downloadBlob, formatBytes, replaceExtension } from "@/lib/files";
import { detectContainer } from "@/lib/image-containers";
import { encodeImage, loadImage, renderToCanvas } from "@/lib/image";
import { cn } from "@/lib/utils";
import { createZip } from "@/lib/zip";

type Photo = {
  id: number;
  file: File;
  bytes: Uint8Array;
  preview: string;
  values: MetadataValues;
  hasXmp: boolean;
  /** Formats that can't hold EXIF here are converted to JPG. */
  converted: boolean;
};

type TextFieldDef = { key: keyof MetadataValues; label: string; placeholder?: string; hint?: string; multiline?: boolean };

const SECTIONS: { title: string; fields: TextFieldDef[] }[] = [
  {
    title: "Description",
    fields: [
      { key: "title", label: "Title", placeholder: "Sunset at the beach" },
      { key: "subject", label: "Subject" },
      { key: "description", label: "Description / caption", multiline: true },
      { key: "keywords", label: "Tags", placeholder: "beach, sunset, summer", hint: "Separate tags with commas." },
      { key: "comments", label: "Comments", multiline: true },
    ],
  },
  {
    title: "Author & rights",
    fields: [
      { key: "artist", label: "Author / photographer", placeholder: "Your name" },
      { key: "copyright", label: "Copyright", placeholder: "© 2026 Your Name" },
      { key: "owner", label: "Camera owner" },
    ],
  },
  {
    title: "Camera",
    fields: [
      { key: "make", label: "Camera make", placeholder: "Canon" },
      { key: "model", label: "Camera model", placeholder: "EOS R6" },
      { key: "lens", label: "Lens", placeholder: "RF 24-70mm F2.8" },
      { key: "software", label: "Software" },
    ],
  },
];

let nextId = 1;

async function openPhoto(file: File): Promise<Photo> {
  let bytes = new Uint8Array(await file.arrayBuffer());
  let converted = false;
  if (detectContainer(bytes) === "other") {
    // GIF, BMP, AVIF… can't carry EXIF here, so re-save as a high-quality JPG.
    const canvas = renderToCanvas(await loadImage(file), { background: "#ffffff" });
    bytes = new Uint8Array(await (await encodeImage(canvas, "jpg", 0.95)).arrayBuffer());
    converted = true;
  }
  return {
    id: nextId++,
    file,
    bytes,
    preview: URL.createObjectURL(file),
    values: readFileValues(bytes),
    hasXmp: readMetadata(bytes).blocks.includes("XMP"),
    converted,
  };
}

function Rating({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const stars = Number(value) || 0;
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={stars === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(stars === n ? "" : String(n))}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star className={cn("h-6 w-6", n <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
        </button>
      ))}
    </div>
  );
}

export default function MetadataEditor() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [values, setValues] = useState<MetadataValues>(EMPTY_VALUES);
  const [keepOther, setKeepOther] = useState(true);
  const [removeXmp, setRemoveXmp] = useState(false);
  const [locating, setLocating] = useState(false);
  const batch = photos.length > 1;
  const first = photos[0];

  const photosRef = useRef(photos);
  photosRef.current = photos;

  // One photo: edit its values directly. Several: start blank and only apply what's filled in.
  useEffect(() => {
    setValues(first && !batch ? first.values : EMPTY_VALUES);
  }, [first, batch]);

  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const set = (key: keyof MetadataValues) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  const addFiles = async (files: File[]) => {
    const results = await Promise.allSettled(files.map(openPhoto));
    const opened = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (opened.length < files.length) toast.error(`${files.length - opened.length} file(s) couldn't be opened.`);
    if (photos.length === 1 && opened.length) {
      toast.info("Editing several photos: fill in only the fields you want to change.");
    }
    setPhotos((list) => [...list, ...opened]);
  };

  const remove = (id: number) =>
    setPhotos((list) => {
      const photo = list.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return list.filter((p) => p.id !== id);
    });

  const onLatitude = (text: string) => {
    // Pasting "37.7749, -122.4194" from a map fills both boxes.
    const pair = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text);
    if (pair) setValues((v) => ({ ...v, latitude: pair[1], longitude: pair[2] }));
    else set("latitude")(text);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Your browser can't share its location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValues((v) => ({
          ...v,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
          altitude: coords.altitude !== null ? coords.altitude.toFixed(1) : v.altitude,
        }));
        setLocating(false);
      },
      () => {
        toast.error("Couldn't get your location. Check the permission in your browser.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const lat = parseCoordinate(values.latitude);
  const lon = parseCoordinate(values.longitude);
  const locationError =
    (values.latitude.trim() || values.longitude.trim()) && (lat === null || lon === null)
      ? "Enter both latitude and longitude as decimal numbers."
      : lat !== null && Math.abs(lat) > 90
        ? "Latitude must be between -90 and 90."
        : lon !== null && Math.abs(lon) > 180
          ? "Longitude must be between -180 and 180."
          : "";

  const save = async () => {
    try {
      const outputs = photos.map((photo) => {
        const final = batch ? mergeValues(photo.values, values) : values;
        const block = applyValues(readExifBlock(photo.bytes), final, { keepOther });
        const bytes = writeMetadata(photo.bytes, block, { removeXmp })!;
        const name = photo.converted ? replaceExtension(photo.file.name, "jpg") : photo.file.name;
        const type = photo.converted ? "image/jpeg" : photo.file.type;
        return { name, blob: new Blob([bytes as BlobPart], { type }) };
      });
      if (outputs.length === 1) downloadBlob(outputs[0].blob, outputs[0].name);
      else downloadBlob(await createZip(outputs.map((o) => ({ name: o.name, data: o.blob }))), "photos-with-metadata.zip");
      toast.success(outputs.length === 1 ? "Metadata saved!" : `Saved metadata to ${outputs.length} photos.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the metadata.");
    }
  };

  if (photos.length === 0) {
    return (
      <ToolCard>
        <FileDropzone
          multiple
          accept="image/*"
          onFiles={addFiles}
          label="Drop photos to add or edit their metadata"
          hint="JPG, PNG and WebP are edited without re-compressing. Nothing is uploaded."
        />
      </ToolCard>
    );
  }

  const textField = ({ key, label, placeholder, hint, multiline }: TextFieldDef) => {
    const id = `meta-${key}`;
    return (
      <Field key={key} label={label} htmlFor={id} hint={hint}>
        {multiline ? (
          <Textarea id={id} value={values[key]} placeholder={batch ? "Keep existing" : placeholder} onChange={(e) => set(key)(e.target.value)} className="min-h-20" />
        ) : (
          <Input id={id} value={values[key]} placeholder={batch ? "Keep existing" : placeholder} onChange={(e) => set(key)(e.target.value)} />
        )}
      </Field>
    );
  };

  return (
    <ToolCard>
      <div className="space-y-3">
        <ul className="grid gap-2 sm:grid-cols-2">
          {photos.map((photo) => (
            <li key={photo.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
              <img src={photo.preview} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={photo.file.name}>{photo.file.name}</p>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {formatBytes(photo.file.size)}
                  {photo.values.latitude && <Badge variant="secondary" className="gap-1 px-1.5 py-0"><MapPin className="h-3 w-3" /> GPS</Badge>}
                  {photo.converted && <Badge variant="outline" className="px-1.5 py-0">Saves as JPG</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(photo.id)} aria-label={`Remove ${photo.file.name}`}>
                <X />
              </Button>
            </li>
          ))}
        </ul>
        <FileDropzone multiple compact accept="image/*" onFiles={addFiles} label="Add more photos" allowPaste={false} />
        {batch && (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm">
            Editing {photos.length} photos. Only the fields you fill in are changed; blank fields keep each photo&apos;s
            existing value.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="font-semibold">{section.title}</h2>
            {section.fields.map(textField)}
            {section.title === "Description" && (
              <Field label="Rating">
                <Rating value={values.rating} onChange={set("rating")} />
              </Field>
            )}
            {section.title === "Author & rights" && values.artist && !values.copyright && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => set("copyright")(`© ${new Date().getFullYear()} ${values.artist}`)}
              >
                Use “© {new Date().getFullYear()} {values.artist}”
              </Button>
            )}
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="font-semibold">Date &amp; location</h2>
          <Field label="Date taken" htmlFor="meta-date">
            <div className="flex gap-2">
              <Input id="meta-date" type="datetime-local" step={1} value={values.dateTaken} onChange={(e) => set("dateTaken")(e.target.value)} />
              {values.dateTaken && (
                <Button variant="ghost" size="icon" onClick={() => set("dateTaken")("")} aria-label="Clear date">
                  <X />
                </Button>
              )}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" htmlFor="meta-lat">
              <Input id="meta-lat" inputMode="decimal" value={values.latitude} placeholder={batch ? "Keep existing" : "48.8584"} onChange={(e) => onLatitude(e.target.value)} />
            </Field>
            <Field label="Longitude" htmlFor="meta-lon">
              <Input id="meta-lon" inputMode="decimal" value={values.longitude} placeholder={batch ? "Keep existing" : "2.2945"} onChange={(e) => set("longitude")(e.target.value)} />
            </Field>
          </div>
          <Field label="Altitude (meters)" htmlFor="meta-alt" hint="Tip: paste coordinates like “48.8584, 2.2945” from Google Maps into Latitude.">
            <Input id="meta-alt" inputMode="decimal" value={values.altitude} onChange={(e) => set("altitude")(e.target.value)} className="max-w-40" />
          </Field>
          {locationError && <p className="text-sm text-destructive">{locationError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
              <LocateFixed /> {locating ? "Locating…" : "Use my location"}
            </Button>
            {lat !== null && lon !== null && !locationError && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`} target="_blank" rel="noopener noreferrer">
                  <MapPin /> View on map
                </a>
              </Button>
            )}
            {(values.latitude || values.longitude) && (
              <Button variant="ghost" size="sm" onClick={() => setValues((v) => ({ ...v, latitude: "", longitude: "", altitude: "" }))}>
                <Trash2 /> Remove location
              </Button>
            )}
          </div>
        </section>
      </div>

      <div className="space-y-3 border-t pt-5">
        <SwitchField
          label="Keep other camera data"
          description="Exposure, ISO, focal length, orientation and other technical details. Turn off to keep only what's above."
          checked={keepOther}
          onChange={setKeepOther}
        />
        {photos.some((p) => p.hasXmp) && (
          <SwitchField
            label="Remove XMP metadata"
            description="Some apps (like Lightroom) read XMP instead of EXIF and may keep showing old values."
            checked={removeXmp}
            onChange={setRemoveXmp}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={save} disabled={!!locationError}>
          <Download /> {batch ? `Save ${photos.length} photos (ZIP)` : "Save photo"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            photos.forEach((p) => URL.revokeObjectURL(p.preview));
            setPhotos([]);
          }}
        >
          <Trash2 /> Start over
        </Button>
      </div>
    </ToolCard>
  );
}
