# Customization

Three things you will almost always want to override in your own project:
the **brand color**, the **logo**, and the **version list**. All three are
demonstrated by this example.

## Brand color

Override the primary brand color (and its hover / active / soft variants)
under `branding` in `docs-toolkit.config.yaml`:

```yaml
branding:
  primaryColor: "#0F766E"
  primaryColorHover: "#14B8A6"
  primaryColorActive: "#115E59"
  primaryColorSoft: "#CCFBF1"
```

The example uses a teal palette so you can tell at a glance whether your
override has taken effect — if you see Backend.AI orange, the file is not
being read.

> [!NOTE]
> The hover / active / soft variants are NOT auto-derived from
> `primaryColor`. Supply all four together to keep the palette consistent.

## Logo

Drop an SVG anywhere under your project and point at it from
`docs-toolkit.config.yaml`:

```yaml
logoPath: "./assets/logo.svg"

branding:
  logoLight: "./assets/logo.svg"
  # logoDark: "./assets/logo-dark.svg"   # falls back to logoLight when omitted
```

The same file can be used for the cover-page logo (`logoPath`) and the
in-site topbar logo (`branding.logoLight`).

## Sub-label next to the logo

The small text rendered next to the topbar logo. Either a single string
(used for every language) or a per-language map:

```yaml
branding:
  subLabel:
    en: "Example"
    ko: "예제"
    default: "Example"
```

## Versions

Two entries are declared in this example so the version selector renders.
Both point at the same workspace content because the example does not
maintain real archive branches:

```yaml
versions:
  - label: "next"
    source:
      kind: workspace
  - label: "0.1"
    source:
      kind: workspace
    latest: true
```

In a real project, replace the second entry's source with an
`archive-branch` reference once you cut a stable release:

```yaml
- label: "1.0"
  source:
    kind: archive-branch
    ref: docs-archive/1.0
  latest: true
  pdfTag: "v1.0.0"
```

> [!WARNING]
> Exactly one entry across `versions[]` must carry `latest: true`. Build
> fails loudly if zero or two entries are marked latest.
