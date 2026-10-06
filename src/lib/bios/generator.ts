/**
 * Common interface shared by every BIOS password generator.
 *
 * Each supported BIOS/vendor family is an independent module that exposes one
 * or more {@link BiosGenerator} objects. A generator knows how to clean up the
 * raw challenge a user types, decide whether that challenge is one it can
 * handle, and turn it into candidate recovery passwords. The detector in
 * `index.ts` relies only on this interface, so adding a family is purely
 * additive.
 */

export interface BiosGenerator {
  /** Stable, unique identifier, e.g. `"asus-date"`. */
  readonly id: string;
  /** Vendor / BIOS family shown next to each result, e.g. `"ASUS"`. */
  readonly vendor: string;
  /** Human-readable label, e.g. `"ASUS (BIOS date)"`. */
  readonly label: string;
  /** One-line explanation of the challenge format this handles. */
  readonly description: string;
  /** Example challenges that this generator recognises. */
  readonly examples: readonly string[];

  /** Normalise raw user input (trim, drop separators, fix case). */
  normalize(raw: string): string;
  /** Whether a normalised challenge looks like one this generator handles. */
  matches(normalized: string): boolean;
  /** Produce candidate passwords for a normalised challenge (may be empty). */
  generate(normalized: string): string[];
}

/** Default cleanup: trim, then strip dashes and whitespace. */
export function stripSeparators(raw: string): string {
  return raw.trim().replace(/[\s-]/g, "");
}

type GeneratorSpec = {
  id: string;
  vendor: string;
  label: string;
  description: string;
  examples: readonly string[];
  normalize?: (raw: string) => string;
  matches: (normalized: string) => boolean;
  generate: (normalized: string) => string[];
};

/** Build a {@link BiosGenerator}, filling in the default `normalize`. */
export function defineGenerator(spec: GeneratorSpec): BiosGenerator {
  const normalize = spec.normalize ?? stripSeparators;
  return {
    id: spec.id,
    vendor: spec.vendor,
    label: spec.label,
    description: spec.description,
    examples: spec.examples,
    normalize,
    matches: spec.matches,
    generate: spec.generate,
  };
}
