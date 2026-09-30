export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string, type = "text/plain") {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);
}

export function formatBytes(bytes: number, decimals = 1) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${i === 0 ? value : value.toFixed(decimals)} ${units[i]}`;
}

export function baseName(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

export function replaceExtension(filename: string, extension: string) {
  return `${baseName(filename)}.${extension}`;
}

/** Tests a file against an <input accept> string such as "image/*,.svg". */
export function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .some((token) => {
      if (!token) return false;
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
}

export function readAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
