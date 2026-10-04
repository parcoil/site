export type Unit = {
  id: string;
  label: string;
  /** Multiply by this to get the category's base unit. */
  factor?: number;
  /** For non-linear units such as temperature. */
  toBase?: (value: number) => number;
  fromBase?: (value: number) => number;
};

export type UnitCategory = {
  id: string;
  label: string;
  units: Unit[];
  defaults: [string, string];
};

const u = (id: string, label: string, factor: number): Unit => ({ id, label, factor });

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Length",
    defaults: ["m", "ft"],
    units: [
      u("mm", "Millimeters (mm)", 0.001),
      u("cm", "Centimeters (cm)", 0.01),
      u("m", "Meters (m)", 1),
      u("km", "Kilometers (km)", 1000),
      u("in", "Inches (in)", 0.0254),
      u("ft", "Feet (ft)", 0.3048),
      u("yd", "Yards (yd)", 0.9144),
      u("mi", "Miles (mi)", 1609.344),
      u("nmi", "Nautical miles (nmi)", 1852),
    ],
  },
  {
    id: "weight",
    label: "Weight",
    defaults: ["kg", "lb"],
    units: [
      u("mg", "Milligrams (mg)", 1e-6),
      u("g", "Grams (g)", 0.001),
      u("kg", "Kilograms (kg)", 1),
      u("t", "Metric tons (t)", 1000),
      u("oz", "Ounces (oz)", 0.028349523125),
      u("lb", "Pounds (lb)", 0.45359237),
      u("st", "Stone (st)", 6.35029318),
      u("ton", "US tons", 907.18474),
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    defaults: ["c", "f"],
    units: [
      { id: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", label: "Fahrenheit (°F)", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: "k", label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    defaults: ["l", "gal"],
    units: [
      u("ml", "Milliliters (mL)", 0.001),
      u("l", "Liters (L)", 1),
      u("m3", "Cubic meters (m³)", 1000),
      u("tsp", "Teaspoons (US)", 0.00492892159375),
      u("tbsp", "Tablespoons (US)", 0.01478676478125),
      u("floz", "Fluid ounces (US)", 0.0295735295625),
      u("cup", "Cups (US)", 0.2365882365),
      u("pt", "Pints (US)", 0.473176473),
      u("qt", "Quarts (US)", 0.946352946),
      u("gal", "Gallons (US)", 3.785411784),
      u("ukgal", "Gallons (UK)", 4.54609),
      u("ft3", "Cubic feet (ft³)", 28.316846592),
    ],
  },
  {
    id: "area",
    label: "Area",
    defaults: ["m2", "ft2"],
    units: [
      u("cm2", "Square centimeters (cm²)", 1e-4),
      u("m2", "Square meters (m²)", 1),
      u("ha", "Hectares (ha)", 1e4),
      u("km2", "Square kilometers (km²)", 1e6),
      u("in2", "Square inches (in²)", 0.00064516),
      u("ft2", "Square feet (ft²)", 0.09290304),
      u("yd2", "Square yards (yd²)", 0.83612736),
      u("ac", "Acres (ac)", 4046.8564224),
      u("mi2", "Square miles (mi²)", 2589988.110336),
    ],
  },
  {
    id: "speed",
    label: "Speed",
    defaults: ["kmh", "mph"],
    units: [
      u("ms", "Meters per second (m/s)", 1),
      u("kmh", "Kilometers per hour (km/h)", 1 / 3.6),
      u("mph", "Miles per hour (mph)", 0.44704),
      u("kn", "Knots (kn)", 1852 / 3600),
      u("fts", "Feet per second (ft/s)", 0.3048),
    ],
  },
  {
    id: "time",
    label: "Time",
    defaults: ["h", "min"],
    units: [
      u("ms", "Milliseconds (ms)", 0.001),
      u("s", "Seconds (s)", 1),
      u("min", "Minutes (min)", 60),
      u("h", "Hours (h)", 3600),
      u("d", "Days", 86400),
      u("wk", "Weeks", 604800),
      u("mo", "Months (average)", 2629746),
      u("yr", "Years (average)", 31556952),
    ],
  },
  {
    id: "data",
    label: "Data",
    defaults: ["gb", "mb"],
    units: [
      u("bit", "Bits", 1 / 8),
      u("b", "Bytes (B)", 1),
      u("kb", "Kilobytes (KB)", 1e3),
      u("mb", "Megabytes (MB)", 1e6),
      u("gb", "Gigabytes (GB)", 1e9),
      u("tb", "Terabytes (TB)", 1e12),
      u("kib", "Kibibytes (KiB)", 1024),
      u("mib", "Mebibytes (MiB)", 1024 ** 2),
      u("gib", "Gibibytes (GiB)", 1024 ** 3),
      u("tib", "Tebibytes (TiB)", 1024 ** 4),
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    defaults: ["psi", "bar"],
    units: [
      u("pa", "Pascals (Pa)", 1),
      u("kpa", "Kilopascals (kPa)", 1000),
      u("bar", "Bar", 1e5),
      u("atm", "Atmospheres (atm)", 101325),
      u("psi", "Pounds per sq inch (psi)", 6894.757293168),
      u("mmhg", "Millimeters of mercury (mmHg)", 133.322387415),
    ],
  },
  {
    id: "energy",
    label: "Energy",
    defaults: ["kcal", "kj"],
    units: [
      u("j", "Joules (J)", 1),
      u("kj", "Kilojoules (kJ)", 1000),
      u("cal", "Calories (cal)", 4.184),
      u("kcal", "Kilocalories (kcal)", 4184),
      u("wh", "Watt-hours (Wh)", 3600),
      u("kwh", "Kilowatt-hours (kWh)", 3.6e6),
      u("btu", "British thermal units (BTU)", 1055.05585262),
    ],
  },
];

export function convertUnit(value: number, from: Unit, to: Unit) {
  const base = from.toBase ? from.toBase(value) : value * from.factor!;
  return to.fromBase ? to.fromBase(base) : base / to.factor!;
}

/** Rounds away floating-point noise: 0.30000000000000004 → "0.3". */
export function formatNumber(value: number, precision = 10) {
  if (!Number.isFinite(value)) return "";
  if (value !== 0 && (Math.abs(value) < 1e-6 || Math.abs(value) >= 1e15)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(parseFloat(value.toPrecision(precision)));
}
