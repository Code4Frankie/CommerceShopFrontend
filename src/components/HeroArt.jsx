import { SketchPaths } from "./Sketches.jsx";

// The hero scene: a gold sun ring over layered fields (the logo's own shapes),
// with sketched goods standing on the field. The fields run past the edges of the
// drawing so they reach the edge of the screen.
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 640 520" role="img" aria-label="Sketch of a sunrise over farmland with corn, a basket, a calabash and a drum">
      <defs>
        <clipPath id="ring-clip">
          <circle cx="330" cy="236" r="158" />
        </clipPath>
        {/* fade the fields in from the left so they never end in a hard edge */}
        <linearGradient id="field-fade" gradientUnits="userSpaceOnUse" x1="-700" y1="0" x2="1340" y2="0">
          <stop offset="0" stopColor="#fff" className="fade-edge" />
          <stop offset="0.343" stopColor="#fff" className="fade-edge" />
          <stop offset="0.43" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="field-mask" maskUnits="userSpaceOnUse" x="-700" y="0" width="2040" height="520">
          <rect x="-700" y="0" width="2040" height="520" fill="url(#field-fade)" />
        </mask>
      </defs>

      {/* sun ring: rises once on load */}
      <g className="sun">
        <circle cx="330" cy="236" r="158" fill="#0a4a22" />
        <circle cx="330" cy="236" r="170" fill="none" stroke="#f0b800" strokeWidth="22" />
        <g clipPath="url(#ring-clip)">
          <path d="M150 300 C230 240 330 250 420 232 C480 222 520 230 520 230 V420 H150 Z" fill="#79b83f" />
          <path d="M150 330 C240 276 340 290 430 262 C480 248 520 256 520 256 V420 H150 Z" fill="#f0b800" />
          <path d="M150 352 C250 306 350 322 440 292 C480 280 520 286 520 286 V420 H150 Z" fill="#0b7a30" />
          {/* sprout, as in the logo */}
          <g stroke="#fff7dc" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M330 232 V160" fill="none" />
            <path d="M330 176 C296 176 284 150 286 124 C316 126 332 146 330 176 Z" fill="#0b7a30" />
            <path d="M330 160 C330 132 350 112 384 112 C384 140 362 158 330 160 Z" fill="#79b83f" />
          </g>
        </g>
      </g>

      {/* fields across the whole width */}
      <g mask="url(#field-mask)">
        <path d="M-700 392 C-300 372 -100 380 110 352 C250 372 270 372 390 344 C510 320 590 346 760 322 C1000 296 1200 330 1340 320 V520 H-700 Z" fill="#0b7a30" />
        <path d="M-700 424 C-300 404 -100 412 110 392 C250 410 270 410 400 384 C520 362 590 384 760 368 C1000 346 1200 372 1340 362 V520 H-700 Z" fill="#79b83f" />
        <path d="M-700 452 C-300 436 -100 442 110 424 C250 438 270 438 410 418 C520 402 590 418 760 408 C1000 392 1200 414 1340 408 V520 H-700 Z" fill="#f0b800" />
        <path d="M-700 478 C-300 466 -100 470 110 456 C250 468 280 466 420 450 C530 440 590 450 760 444 C1000 436 1200 450 1340 446 V520 H-700 Z" fill="#086828" />
        <g fill="none" stroke="#06391a" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round">
          <path d="M-600 496 C-200 488 100 492 420 470 C520 462 700 472 1100 468" />
          <path d="M-600 512 C-200 506 100 508 430 488 C560 480 700 488 1100 484" />
        </g>
      </g>

      {/* sketched goods, drawn in cream line on the field */}
      <g className="hero-sketches">
        <svg x="40" y="318" width="140" height="140" viewBox="0 0 100 100">
          <SketchPaths name="corn" />
        </svg>
        <svg x="196" y="296" width="190" height="190" viewBox="0 0 100 100">
          <SketchPaths name="basket" />
        </svg>
        <svg x="392" y="324" width="130" height="130" viewBox="0 0 100 100">
          <SketchPaths name="calabash" />
        </svg>
        <svg x="506" y="300" width="120" height="150" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <SketchPaths name="drum" />
        </svg>
      </g>
    </svg>
  );
}
