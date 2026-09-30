import { toast } from "sonner";

export async function copyText(text: string, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
    return true;
  } catch {
    toast.error("Couldn't copy. Your browser blocked clipboard access.");
    return false;
  }
}
