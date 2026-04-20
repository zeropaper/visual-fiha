import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

import { Code, Deck, Fragment, Slide, Stack } from "@revealjs/react";
import { VFLogo } from "@ui/VFLogo";

export function Presentation() {
  return (
    <Deck>
      {/* ── 1. Title ─────────────────────────────────────── */}
      <Slide>
        <VFLogo width={160} height={160} />
        <h1>Visual Fiha</h1>
        <p>A browser-based live-coding VJing environment.</p>
        <aside className="notes">
          Welcome slide. Introduce yourself and the project.
        </aside>
      </Slide>

      {/* ── 2. History ───────────────────────────────────── */}
      <Stack>
        <Slide autoAnimate>
          <h2>A Brief History</h2>
          <p>Visual Fiha has gone through three generations.</p>
          <ul>
            <Fragment as="li">Version 1: Browser-based, MIDI-focused</Fragment>
            <Fragment as="li">
              Version 2: VS Code extension, deeper editor integration
            </Fragment>
            <Fragment as="li">
              Version 3: Back to the browser, with radical architectural changes
            </Fragment>
          </ul>
        </Slide>

        <Slide autoAnimate>
          <h3>Version 1 · 2014</h3>
          <p>Born when the W3C announced MIDI API support in browsers.</p>
          <ul>
            <Fragment as="li">JavaScript, WebGL, CSS</Fragment>
            <Fragment as="li">MIDI controllers as first-class inputs</Fragment>
            <Fragment as="li">100% browser-based</Fragment>
          </ul>
        </Slide>

        <Slide autoAnimate>
          <h3>Version 2 · VS Code Extension</h3>
          <ul>
            <Fragment as="li">Deeper editor integration</Fragment>
            <Fragment as="li">
              Real-time audio latency became unacceptably high
            </Fragment>
            <Fragment as="li">MIDI support never implemented</Fragment>
          </ul>
        </Slide>

        <Slide autoAnimate>
          <h3>Version 3 · Now</h3>
          <p>Back to the browser — with radical architectural changes.</p>
          <ul>
            <Fragment as="li">Multi-window rendering via Web Workers</Fragment>
            <Fragment as="li">Low-latency audio & MIDI</Fragment>
            <Fragment as="li">TypeScript-first, live-compiled scripts</Fragment>
          </ul>
        </Slide>
      </Stack>

      {/* ── 3. What is it? ───────────────────────────────── */}
      <Slide>
        <h2>What is Visual Fiha?</h2>
        <ul>
          <Fragment as="li">
            Create interactive visuals with{" "}
            <strong>JavaScript / TypeScript</strong>
          </Fragment>
          <Fragment as="li">
            React to <strong>MIDI, audio, time & BPM</strong> in real-time
          </Fragment>
          <Fragment as="li">
            Render to <strong>multiple display windows</strong> simultaneously
          </Fragment>
          <Fragment as="li">
            Live-code scripts — changes take effect <em>immediately</em>
          </Fragment>
        </ul>
      </Slide>

      {/* ── 4. Architecture ──────────────────────────────── */}
      <Stack>
        <Slide>
          <h2>Architecture</h2>
          <p>Multi-thread, message-driven, worker-based.</p>
        </Slide>

        <Slide>
          <h3>Three Threads</h3>
          <ul>
            <Fragment as="li">
              <strong>Main Thread</strong> — React controls UI
            </Fragment>
            <Fragment as="li">
              <strong>Controls Worker</strong> — app state, inputs,
              transpilation
            </Fragment>
            <Fragment as="li">
              <strong>Display Worker(s)</strong> — rendering pipeline per window
            </Fragment>
          </ul>
          <aside className="notes">
            Each display window gets its own worker for true parallelism.
          </aside>
        </Slide>

        <Slide>
          <h3>Communication</h3>
          <ul>
            <Fragment as="li">
              <strong>BroadcastChannel "core"</strong> — state updates, runtime
              data
            </Fragment>
            <Fragment as="li">
              <strong>Worker.postMessage</strong> — OffscreenCanvas transfer,
              resize
            </Fragment>
            <Fragment as="li">
              All messages typed via <code>src/utils/com.ts</code>
            </Fragment>
          </ul>
        </Slide>
      </Stack>

      {/* ── 5. Scriptables ───────────────────────────────── */}
      <Stack>
        <Slide>
          <h2>Scriptables</h2>
          <p>The core programming model — every scriptable has two scripts:</p>
          <ul>
            <Fragment as="li">
              <strong>setup</strong> — runs once on create/change
            </Fragment>
            <Fragment as="li">
              <strong>animation</strong> — runs every frame
            </Fragment>
          </ul>
        </Slide>

        <Slide>
          <h3>
            The <code>cache</code> Object
          </h3>
          <p>Share state between setup and animation:</p>
          <Code language="typescript" lineNumbers>
            {`// setup
cache.mesh = new THREE.Mesh(geometry, material);
scene.add(cache.mesh);

// animation
cache.mesh.rotation.y += 0.01;`}
          </Code>
        </Slide>

        <Slide>
          <h3>Reading Inputs</h3>
          <p>
            The <code>read()</code> function is available in every script:
          </p>
          <Code language="typescript" lineNumbers>
            {`// MIDI knob
const volume = read('midi.controller.knob1', 0);

// Audio frequency energy
const bass = read('audio.0.0.frequency.average', 0);

// Elapsed time in ms
const t = read('time.elapsed', 0);

// BPM-synced beat
const beat = read('bpm.beat', 0);`}
          </Code>
        </Slide>
      </Stack>

      {/* ── 6. Layers ────────────────────────────────────── */}
      <Stack>
        <Slide>
          <h2>Layers</h2>
          <p>Layers render visual content into display windows.</p>
          <ul>
            <Fragment as="li">
              <strong>Canvas 2D</strong> — 2D graphics via the Canvas API
            </Fragment>
            <Fragment as="li">
              <strong>Three.js</strong> — 3D graphics with WebGL
            </Fragment>
          </ul>
        </Slide>

        <Slide>
          <h3>Canvas 2D Example</h3>
          <Code language="typescript" lineNumbers>
            {`// animation script
const t = read('time.elapsed', 0) / 1000;
const bass = read('audio.0.0.frequency.average', 0);

clearRect(0, 0, width, height);
fillStyle(hsla(t * 0.1, 0.8, 0.5));
beginPath();
arc(width / 2, height / 2, 50 + bass * 200, 0, Math.PI * 2);
fill();`}
          </Code>
        </Slide>

        <Slide>
          <h3>Three.js Example</h3>
          <Code language="typescript" lineNumbers>
            {`// setup script
const geo = new THREE.IcosahedronGeometry(1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
cache.mesh = new THREE.Mesh(geo, mat);
scene.add(cache.mesh);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// animation script
const t = read('time.elapsed', 0) / 1000;
cache.mesh.rotation.y = t;
cache.mesh.rotation.x = t * 0.5;`}
          </Code>
        </Slide>

        <Slide>
          <h3>Layer Controls</h3>
          <ul>
            <Fragment as="li">Toggle active / inactive</Fragment>
            <Fragment as="li">Adjust opacity (0 – 100%)</Fragment>
            <Fragment as="li">Drag to reorder render stack</Fragment>
            <Fragment as="li">Live-edit setup &amp; animation scripts</Fragment>
          </ul>
        </Slide>
      </Stack>

      {/* ── 7. Inputs ────────────────────────────────────── */}
      <Slide>
        <h2>Inputs</h2>
        <ul>
          <Fragment as="li">
            <strong>MIDI</strong> — knobs, pads, faders from any MIDI device
          </Fragment>
          <Fragment as="li">
            <strong>Audio</strong> — microphone or line-in; frequency & time
            domain
          </Fragment>
          <Fragment as="li">
            <strong>Time</strong> — elapsed, duration, percentage, running state
          </Fragment>
          <Fragment as="li">
            <strong>BPM</strong> — beat-synced values for rhythmic animations
          </Fragment>
          <Fragment as="li">
            <strong>Keyboard &amp; Mouse</strong> — event-driven inputs
          </Fragment>
        </ul>
      </Slide>

      {/* ── 8. Controls UI ───────────────────────────────── */}
      <Slide>
        <h2>Controls UI</h2>
        <ul>
          <Fragment as="li">
            <strong>Script Editor</strong> — Monaco Editor with TypeScript
            autocomplete
          </Fragment>
          <Fragment as="li">
            <strong>Layer Manager</strong> — create, reorder, configure layers
          </Fragment>
          <Fragment as="li">
            <strong>Input Monitor</strong> — real-time input visualisation
          </Fragment>
          <Fragment as="li">
            <strong>Display Manager</strong> — open &amp; control output windows
          </Fragment>
          <Fragment as="li">
            <strong>Console</strong> — script output &amp; errors
          </Fragment>
        </ul>
      </Slide>

      {/* ── 9. Displays ──────────────────────────────────── */}
      <Slide>
        <h2>Displays</h2>
        <p>Separate browser windows render the visual output.</p>
        <ul>
          <Fragment as="li">
            Each window runs its own <strong>Display Worker</strong>
          </Fragment>
          <Fragment as="li">
            OffscreenCanvas for zero-copy GPU rendering
          </Fragment>
          <Fragment as="li">Go fullscreen, span multiple monitors</Fragment>
          <Fragment as="li">
            All displays receive the same runtime data simultaneously
          </Fragment>
        </ul>
      </Slide>

      {/* ── 10. Tech Stack ───────────────────────────────── */}
      <Slide>
        <h2>Tech Stack</h2>
        <ul>
          <Fragment as="li">
            <strong>TypeScript</strong> — strict typing throughout
          </Fragment>
          <Fragment as="li">
            <strong>React 18</strong> — controls UI with fast-context pattern
          </Fragment>
          <Fragment as="li">
            <strong>Three.js</strong> — 3D rendering
          </Fragment>
          <Fragment as="li">
            <strong>Monaco Editor</strong> — VS Code's editor in the browser
          </Fragment>
          <Fragment as="li">
            <strong>Vite + esbuild</strong> — instant builds &amp; live
            transpilation
          </Fragment>
          <Fragment as="li">
            <strong>Web Workers + BroadcastChannel</strong> — concurrency model
          </Fragment>
          <Fragment as="li">
            <strong>Biome</strong> — linting &amp; formatting
          </Fragment>
        </ul>
      </Slide>

      {/* ── 11. Get Started ──────────────────────────────── */}
      <Slide>
        <VFLogo width={80} height={80} />
        <h2>Get Started</h2>
        <Code language="bash">{"pnpm dev   # http://localhost:5173"}</Code>
        <ul style={{ marginTop: "1rem" }}>
          <Fragment as="li">Open a display window</Fragment>
          <Fragment as="li">Add a Canvas or Three.js layer</Fragment>
          <Fragment as="li">
            Start writing code &amp; plug in your MIDI controller
          </Fragment>
        </ul>
      </Slide>
    </Deck>
  );
}
