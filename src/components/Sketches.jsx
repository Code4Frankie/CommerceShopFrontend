// Hand-drawn style line sketches of everyday Nigerian goods.
// Each sketch is a list of paths in a 100x100 box. The first path is the outline:
// it is also drawn once more, offset and filled in gold, for a printed "misregistered" look.

const SKETCHES = {
  // gourd with a woven pattern band
  calabash: [
    "M50 38 C26 38 14 56 14 70 C14 86 30 94 50 94 C70 94 86 86 86 70 C86 56 74 38 50 38 Z",
    "M42 38 C42 28 44 22 50 17 C56 22 58 28 58 38",
    "M45 15 C47 10 53 10 55 15",
    "M22 64 L29 58 L36 64 L43 58 L50 64 L57 58 L64 64 L71 58 L78 64",
    "M28 78 H72",
    "M34 85 H66",
  ],
  // corn on the cob with husk leaves
  corn: [
    "M50 12 C64 24 66 56 56 82 C54 87 46 87 44 82 C34 56 36 24 50 12 Z",
    "M44 28 V78 M50 18 V84 M56 28 V78",
    "M38 36 Q50 42 62 36 M37 48 Q50 54 63 48 M37 60 Q50 66 63 60 M39 72 Q50 78 61 72",
    "M44 84 C26 82 17 68 15 52 C27 60 38 68 46 79",
    "M56 84 C74 82 83 68 85 52 C73 60 62 68 54 79",
  ],
  // woven basket
  basket: [
    "M18 46 H82 L74 88 H26 Z",
    "M13 46 H87",
    "M28 46 C28 14 72 14 72 46",
    "M21 58 H79 M23 70 H77",
    "M36 46 L38 88 M50 46 V88 M64 46 L62 88",
  ],
  // talking drum (dundun)
  drum: [
    "M30 22 C40 36 40 42 38 50 C40 58 40 64 30 78 H70 C60 64 60 58 62 50 C60 42 60 36 70 22 Z",
    "M30 22 C30 14 70 14 70 22 C70 30 30 30 30 22 Z",
    "M30 78 C32 86 68 86 70 78",
    "M34 28 L66 72 M66 28 L34 72 M42 30 L58 70 M58 30 L42 70",
    "M80 14 C92 24 90 40 80 46",
    "M80 49 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0",
  ],
  // Ankara print tote
  bag: [
    "M20 38 H80 L86 90 H14 Z",
    "M36 38 C36 10 64 10 64 38",
    "M17 62 L25 54 L33 62 L41 54 L49 62 L57 54 L65 62 L73 54 L81 62",
    "M16 78 L24 70 L32 78 L40 70 L48 78 L56 70 L64 78 L72 70 L80 78",
  ],
  // shea butter / honey jar
  jar: [
    "M30 36 C20 44 20 58 22 72 C23 84 30 90 40 90 H60 C70 90 77 84 78 72 C80 58 80 44 70 36 Z",
    "M26 20 H74 V36 H26 Z",
    "M24 54 H76 V76 H24 Z",
    "M36 63 H64 M40 70 H60",
  ],
  // clay cooking pot with steam
  pot: [
    "M28 44 H72 C88 52 91 72 74 85 C66 91 34 91 26 85 C9 72 12 52 28 44 Z",
    "M22 36 H78 V44 H22 Z",
    "M14 62 C38 70 62 70 86 62",
    "M40 28 Q34 20 40 12 M52 28 Q46 20 52 12 M64 28 Q58 20 64 12",
  ],
  // yam tuber
  yam: [
    "M16 70 C14 54 30 38 46 30 C64 22 80 18 88 26 C92 34 82 50 66 62 C50 74 30 86 20 80 C17 78 16 74 16 70 Z",
    "M30 64 Q38 62 40 54 M40 72 Q50 68 54 58 M54 58 Q62 54 62 46 M64 42 Q72 40 76 32",
    "M20 78 Q12 82 10 90 M25 82 Q23 88 18 92",
  ],
  // palm tree
  palm: [
    "M50 96 C54 76 48 58 52 38",
    "M52 38 C40 30 28 32 20 42",
    "M52 38 C42 24 30 20 22 22",
    "M52 38 C60 24 74 20 84 24",
    "M52 38 C64 32 76 34 82 46",
    "M52 38 C50 26 52 16 58 10",
    "M47 44 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M56 45 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0",
  ],
  // stack of folded printed fabric
  cloth: [
    "M12 24 H82 C90 24 90 44 82 44 H12 C4 44 4 24 12 24 Z",
    "M18 46 H88 C96 46 96 66 88 66 H18 C10 66 10 46 18 46 Z",
    "M12 68 H82 C90 68 90 88 82 88 H12 C4 88 4 68 12 68 Z",
    "M26 34 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 M46 34 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 M66 34 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0",
    "M28 56 L34 50 L40 56 L46 50 L52 56 L58 50 L64 56 L70 50 L76 56",
    "M24 78 L30 72 L36 78 L30 84 Z M44 78 L50 72 L56 78 L50 84 Z M64 78 L70 72 L76 78 L70 84 Z",
  ],
  // leather sandal, side view
  sandal: [
    "M8 72 C8 66 14 66 20 66 H80 C90 66 94 72 90 78 C88 82 80 82 76 82 H16 C10 82 8 78 8 72 Z",
    "M28 66 C28 44 50 38 62 52 L72 66",
    "M42 66 C42 54 52 52 58 58",
    "M62 52 C68 40 80 40 84 50 C86 58 82 62 78 66",
  ],
  // oil / drink bottle
  bottle: [
    "M40 30 H60 V40 C70 46 74 54 74 62 V86 H26 V62 C26 54 30 46 40 40 Z",
    "M42 16 H58 V30 H42 Z",
    "M26 62 H74 V80 H26",
    "M36 70 H64",
  ],
  // bar of soap
  soap: [
    "M18 36 H82 C92 36 92 72 82 72 H18 C8 72 8 36 18 36 Z",
    "M28 48 H72 M32 58 H68",
    "M30 80 C40 86 60 86 70 80",
  ],
  // scented candle
  candle: [
    "M30 42 H70 V88 H30 Z",
    "M50 42 V32",
    "M50 12 C60 22 58 32 50 32 C42 32 40 22 50 12 Z",
    "M30 54 C38 62 42 52 50 60 C58 52 62 62 70 54",
    "M38 74 H62",
  ],
  // leafy sprout (from the logo)
  sprout: [
    "M50 90 V50",
    "M50 56 C30 56 20 44 20 28 C38 28 50 38 50 56 Z",
    "M50 46 C50 30 62 20 80 20 C80 36 68 46 50 46 Z",
    "M34 90 H66",
  ],
};

export function SketchPaths({ name }) {
  const paths = SKETCHES[name] || SKETCHES.calabash;
  return (
    <>
      <path d={paths[0]} className="sk-fill" transform="translate(4 4)" />
      {paths.map((d, i) => (
        <path key={i} d={d} className="sk-line" />
      ))}
    </>
  );
}

export default function Sketch({ name, className = "" }) {
  return (
    <svg viewBox="0 0 100 100" className={`sketch ${className}`} aria-hidden="true" focusable="false">
      <SketchPaths name={name} />
    </svg>
  );
}

// Choose a sketch from a category and/or product name. Specific words win over broad categories.
const RULES = [
  [/candle/, "candle"],
  [/sandal|shoe|slipper/, "sandal"],
  [/soap/, "soap"],
  [/oil|bottle|drink|juice|wine/, "bottle"],
  [/butter|honey|jar|cream|cocoa|powder/, "jar"],
  [/drum|music/, "drum"],
  [/basket|weav/, "basket"],
  [/pot|kitchen|clay/, "pot"],
  [/yam|tuber/, "yam"],
  [/corn|maize|grain|food|grocer|produce|farm|spice|snack/, "corn"],
  [/bag|tote/, "bag"],
  [/fabric|cloth|adire|ankara|textile|fashion|wear|aso/, "cloth"],
  [/beauty|cosmetic|skin|hair|care/, "jar"],
  [/home|decor|house|furnit/, "basket"],
  [/craft|art|gift/, "drum"],
];
export function sketchFor(label = "") {
  const t = label.toLowerCase();
  const hit = RULES.find(([re]) => re.test(t));
  return hit ? hit[1] : "calabash";
}

export const SKETCH_NAMES = Object.keys(SKETCHES);
export const SKETCH_DATA = SKETCHES;
