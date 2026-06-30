"use client";

import { useEffect, useRef } from "react";

interface Props {
  adKey: string;
  width: number;
  height: number;
}

const queue: (Props & { el: HTMLElement })[] = [];
let running = false;

function next() {
  if (queue.length === 0) {
    running = false;
    return;
  }
  running = true;
  const { adKey, width, height, el } = queue.shift()!;

  (window as any).atOptions = {
    key: adKey,
    format: "iframe",
    height,
    width,
    params: {},
  };

  const s = document.createElement("script");
  s.src = `https://graduateamazingly.com/${adKey}/invoke.js`;
  s.onload = s.onerror = () => next();
  el.appendChild(s);
}

export default function BannerAd(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !ref.current) return;
    done.current = true;
    queue.push({ ...props, el: ref.current });
    if (!running) next();
  }, [props]);

  return (
    <div className="flex justify-center w-full overflow-hidden">
      <div ref={ref} />
    </div>
  );
}
