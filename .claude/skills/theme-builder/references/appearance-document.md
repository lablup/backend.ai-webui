# The v2 appearance document

`resources/theme.json` is the shipped document; `resources/theme.schema.json` is the
authority (draft-07, `additionalProperties: false` at every level). Everything below is
read from the loader and the theme pipeline on the current branch — when they disagree
with this page, the code wins.

## Skeleton

```json
{
  "$schema": "./theme.schema.json",
  "schemaVersion": 2,
  "theme": {
    "fontFamily": "'Ubuntu', Roboto, sans-serif",
    "siderMode": "dark",
    "families": {
      "default": {
        "seeds": {
          "accent": ["#LIGHT6", "#DARK6"],
          "link": ["#LIGHT6", "#DARK6"],
          "info": ["#LIGHT6", "#DARK6"],
          "error": ["#FF4D4F", "#DC4446"],
          "success": ["#00BD9B", "#03A487"],
          "warning": ["#FAAD14", "#FAAD14"]
        },
        "headerBg": ["#LIGHT", "#DARK"]
      }
    }
  },
  "branding": {
    "logo": {
      "src": "/manifest/brand-white.svg",
      "srcCollapsed": "/manifest/brand-mark-white.svg",
      "srcDark": "/manifest/brand-black.svg",
      "srcCollapsedDark": "/manifest/brand-mark-black.svg",
      "alt": "Brand logo",
      "href": "/start",
      "size": { "width": 159, "height": 24 },
      "sizeCollapsed": { "width": 34, "height": 34 },
      "loginLogoSrc": "/manifest/brand-black.svg",
      "loginLogoSrcDark": "/manifest/brand-white.svg",
      "loginLogoSize": { "width": 200, "height": 32 },
      "aboutLogoSize": { "width": 159, "height": 24 }
    },
    "companyName": "Company Inc.",
    "brandName": "Product",
    "familyLabels": {}
  }
}
```

## Field map

| Path                                   | Type                       | Notes                                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`                        | `2` (const)                | Required. Anything else is dropped by the loader with a console error.                                                                                                                                                                                                                                              |
| `theme.fontFamily`                     | string                     | CSS `font-family` list. For every non-generic name the loader injects `resources/fonts/<name>/<name>.css` (`name` = lowercased, spaces → `-`). Only `ubuntu` and `roboto` ship; a new font needs the directory per `resources/fonts/ADDING_FONTS.md`, otherwise the name silently falls through to the next family. |
| `theme.siderMode`                      | `"dark"` \| `"light"`      | Forces the sider polarity. Omit to follow the page scheme.                                                                                                                                                                                                                                                          |
| `theme.families`                       | object                     | Keyed by family id; `default` is required and is what renders when no family is selected.                                                                                                                                                                                                                           |
| `theme.families.<id>.seeds.accent`     | seed                       | Brand colour: primary buttons, `--color-accent`, `--color-text-accent`, focus rings. Role mapping is in code: `brand`=accent, `admin`=info, `secondary`=success.                                                                                                                                                    |
| `…seeds.link`                          | seed                       | `--color-link`. Falls back to `--color-text-accent` when omitted.                                                                                                                                                                                                                                                   |
| `…seeds.info`                          | seed                       | `--color-info` and the admin-role accent. Falls back to accent when omitted.                                                                                                                                                                                                                                        |
| `…seeds.error` / `success` / `warning` | seed                       | Status colours and their `color-mix()` tints. Keep the shipped values unless the brand defines its own.                                                                                                                                                                                                             |
| `…headerBg`                            | colorValue                 | Header band background, applied verbatim as CSS. `rgba()` / `color-mix()` are fine here (the shipped `glass` family uses `rgba`).                                                                                                                                                                                   |
| `branding.logo.*`                      | strings / `{width,height}` | Paths are served as-is; put files under `manifest/` or `resources/` and reference them with an absolute path. `src` (light sider), `srcDark`, `srcCollapsed*`, `loginLogoSrc*`, `aboutLogoSrc*`, each with a `*Size`.                                                                                               |
| `branding.companyName` / `brandName`   | string                     | About modal, login footer, document titles.                                                                                                                                                                                                                                                                         |
| `branding.familyLabels`                | `{ id: label }`            | Family selector labels; a family without a label shows its id.                                                                                                                                                                                                                                                      |

### Seed semantics

- A seed is a **6-digit hex** (`#RRGGBB`) or a `[light, dark]` tuple of them. The schema
  rejects anything else, and even where it did not, the muted/tint derivations in
  `react/src/astryx-theme/backendAiTheme.ts` only accept 6-digit hex and silently keep
  the Astryx neutral palette otherwise.
- A single string applies to **both** schemes. The dark value of a tuple is applied
  **verbatim** — nothing lightens it for you. Astryx generates the light palette from the
  light seed; the dark tokens are then pinned to the declared dark value.
- `--color-on-accent` is **white in both schemes**, so every accent must read under white
  text (≥ 3:1) and, as accent-coloured text, against the surface (white in light,
  `#141414` in dark).

## What reads the document

`react/src/helper/customThemeConfig.ts` fetches two sources in parallel and picks one
(no merge):

1. the domain slice of app config — `publicConfigByDomain[<general.apiDomainName>].appearance`,
   read over REST — when `config.toml` names a domain and a slice was saved (the Branding
   page's **Apply** writes it);
2. otherwise the static `/resources/theme.json`.

A per-user localStorage draft (`custom_theme_config`) overrides both while the Branding
page's **Preview** window has `sessionStorage.isThemePreviewMode`. In dev,
`VITE_THEME_HEADER_COLOR` overwrites `headerBg` on every family of whichever document won.

## Preview surfaces

| Surface       | How                                                                                                                                                                         | Needs                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev server    | Write the document to `resources/theme.json`; Vite serves it from disk and full-reloads the page on change.                                                                 | `pnpm run dev` (the `dev-server` skill). If `config.toml` sets `general.apiDomainName` and a domain slice exists, the slice wins — clear it or unset the domain. |
| Branding page | `/branding` (superadmin) → **JSON Config** → paste or **Import from JSON** → OK (Monaco validates against the schema live) → **Preview** opens a new window with the draft. | A logged-in superadmin. Nothing is saved until **Apply**.                                                                                                        |
| Apply         | **Apply** on `/branding` saves the draft to the domain's `appearance` slice and reloads.                                                                                    | Changes the live document for every user of the domain — ask before pressing it.                                                                                 |
| Header only   | `VITE_THEME_HEADER_COLOR='#RRGGBB' pnpm run dev`                                                                                                                            | Quick check of the header band alone.                                                                                                                            |

## History

FR-3605 introduced v2 and retired the antd-shaped v1 (`light.token` / `dark.token`).
FR-1964 serves the domain document from app config; FR-3834 adds **Apply** and moves the
family selection to `userConfig.themeFamily`; FR-3847 (planned) imports a v1 file on the
Branding page and exports v2.
