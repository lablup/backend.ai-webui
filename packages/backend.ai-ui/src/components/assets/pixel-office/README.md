# BAI Pixel Office sprites

Used by `BAISessionCrowdScene`. Taken unmodified from the "BAI Pixel Office —
BAISessionCrowdScene asset pack" (schema 1.0.0, 2026-10-11):

| File                | Pack source                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `sprites.png`       | `atlas/sprites.png` — 512×512 RGBA atlas, binary alpha, 24-colour palette |
| `pattern-floor.png` | `png/1x/pattern-floor.png`                                                |
| `pattern-grid.png`  | `png/1x/pattern-grid.png`                                                 |

The `.px-<frame>` rules in `BAISessionCrowdScene.css` are generated from the
pack's `manifest.json` (atlas `x`/`y`, `width`/`height`); the anchors and
sockets the component uses (character foot `(32, 84)`, overhead `(32, 12)`,
status `(51, 23)`, desk/sofa bottom-centre, ticket text slot) are the
manifest's too.

Provenance, as the pack states it: the characters, furniture and props were
made with an image-generation tool and then normalised (pixel size, palette,
alpha, atlas packing); the UI symbols, FX and patterns were drawn on an
integer pixel grid. No resources were extracted from commercial games.

Render at integer scales only, with `image-rendering: pixelated`.
