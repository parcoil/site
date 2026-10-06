import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

function isFile(url) {
  try {
    return statSync(fileURLToPath(url)).isFile();
  } catch {
    return false;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[mc]?[jt]s$/.test(specifier)) {
      const base = new URL(specifier, context.parentURL);
      for (const candidate of [`${base.href}.ts`, `${base.href}/index.ts`]) {
        // Omit `format` so Node still applies its native TypeScript handling.
        if (isFile(new URL(candidate))) return { url: candidate, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});
