import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { loadImage } from "@/lib/image";

type LoadedImage = { file: File; image: HTMLImageElement; url: string };

/** Holds one decoded image file plus an object URL for previewing it. */
export function useImageFile() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const current = useRef<LoadedImage | null>(null);

  const replace = (next: LoadedImage | null) => {
    if (current.current) URL.revokeObjectURL(current.current.url);
    current.current = next;
    setLoaded(next);
  };

  useEffect(() => () => replace(null), []);

  const load = async (file: File) => {
    try {
      const image = await loadImage(file);
      replace({ file, image, url: URL.createObjectURL(file) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open that image.");
    }
  };

  return {
    file: loaded?.file ?? null,
    image: loaded?.image ?? null,
    url: loaded?.url ?? null,
    load,
    clear: () => replace(null),
  };
}
