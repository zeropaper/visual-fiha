import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

import { Deck, Slide } from "@revealjs/react";
import { VFLogo } from "@ui/VFLogo";

export function Presentation() {
  return (
    <Deck>
      <Slide>
        <VFLogo width={200} height={200} />
        <h1>Visual Fiha</h1>
        <p>A live-coding VJing environment.</p>
      </Slide>

      <Slide background="#111827">
        <h2>Second slide</h2>
      </Slide>
    </Deck>
  );
}
