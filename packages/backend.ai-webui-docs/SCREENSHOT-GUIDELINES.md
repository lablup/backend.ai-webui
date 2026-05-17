# Screenshot Guidelines

Standards for capturing, naming, and maintaining screenshots in the Backend.AI WebUI user manual.

## File Naming

### Convention

- Use `snake_case` with `.png` extension
- Descriptive, noun-based names reflecting what the screenshot shows
- Keep names concise: 2-5 words

### Naming Patterns

| Category | Pattern | Examples |
|----------|---------|---------|
| Page overview | `{page_name}.png` | `dashboard.png`, `session_page.png` |
| Admin variant | `admin_{page_name}.png` | `admin_dashboard.png`, `admin_user_page.png` |
| Dialog / Modal | `{feature}_{dialog/modal}.png` | `vfolder_create_modal.png`, `login_dialog.png` |
| Action step | `{action}_{target}.png` | `click_folder_name.png`, `mounted_folders_in_terminal.png` |
| UI component | `{component_name}.png` | `session_table_settings.png`, `header.png` |
| Sequential | `{feature}{number}.png` | `service_launcher1.png`, `service_launcher2.png` |
| State / Status | `{feature}_{state}.png` | `session_created.png`, `pending_to_running.png` |

### Naming Rules

- All lowercase
- Underscores between words (not hyphens)
- Avoid abbreviations unless they are standard (e.g., `ssh`, `sftp`)
- Acronyms in lowercase: `ssh_sftp_connection.png`, `llm_chat.png`

## File Location and Localization

- All screenshots go in `src/{lang}/images/`
- All four language directories (`en/`, `ko/`, `ja/`, `th/`) use **identical filenames** for the same screen — the filename is the contract; only the rendered UI language differs.
- **Each language directory MUST contain screenshots captured in that language's UI locale.** Switch the UI language before capturing so that labels (sidebar menus, buttons, dialog titles, table headers, breadcrumbs, etc.) appear in the correct language for each version.
   * Korean docs (`src/ko/images/`) → capture with UI language set to **한국어**
   * Japanese docs (`src/ja/images/`) → capture with UI language set to **日本語**
   * Thai docs (`src/th/images/`) → capture with UI language set to **ภาษาไทย**
   * English docs (`src/en/images/`) → capture with UI language set to **English**
- **Single-language exceptions** (one capture shared across all 4 directories) are allowed only when the image is purely visual with no UI text — e.g., architecture diagrams, terminal/CLI output, third-party tool screenshots (VS Code, MLflow, etc.), version-print outputs.
- For all other screenshots (any image showing Backend.AI WebUI chrome — sidebar, header, modals, forms, tables), the file in each language directory **must be a separate capture in that language**, even if the underlying screen layout is identical.

### Switching Languages In-Place

The WebUI exposes a global function `window.switchLanguage(lang)` that updates the UI language **without reloading the page** (added in PR #5796 / FR-2230). Use this for screenshot capture instead of navigating to `/usersettings` each time — it preserves the current page state (open modals, populated forms, applied filters, etc.) and lets you capture the **same screen** in all four languages from a single setup.

Available locale codes: `'en'`, `'ko'`, `'ja'`, `'th'`.

**Recommended capture pattern (4 languages from one page state):**

```javascript
// In Playwright MCP (via browser_evaluate):
() => { window.switchLanguage('ko'); return 'ok'; }
// → take screenshot, save to ko/images/<file>.png

() => { window.switchLanguage('ja'); return 'ok'; }
// → take screenshot, save to ja/images/<file>.png

() => { window.switchLanguage('th'); return 'ok'; }
// → take screenshot, save to th/images/<file>.png

() => { window.switchLanguage('en'); return 'ok'; }
// → take screenshot, save to en/images/<file>.png  (and reset to English at end of session)
```

Per-image workflow:
1. Navigate to the screen, set up necessary state (open modal, fill form, populate data).
2. Hide developer overlays (e.g., React Grab toolbar) once.
3. Apply 2× zoom: `document.body.style.zoom = '2'` (see [2× zoom capture procedure](#2-zoom-capture-procedure)).
4. Resize viewport to fit the zoomed element.
5. Loop through the 4 languages: `switchLanguage(lang)` → re-apply zoom (it can reset on language switch) → take screenshot → save to `src/{lang}/images/<file>.png`.
6. Reset zoom (`document.body.style.zoom = ''`) before moving to the next screen.

This pattern is ~4× faster than re-navigating to `/usersettings` for each language and avoids repeating the page setup four times.

## Capture Standards

### Resolution and Size

- **Always capture at 2× CSS zoom for sharper text rendering** when capturing via Playwright MCP. Apply `document.body.style.zoom = '2'` and resize the viewport to fit the zoomed layout (e.g., `2000×1500` for full-page captures, or sized to the target element) before taking the screenshot. This effectively doubles the pixel density of the captured PNG without requiring a Retina display or `deviceScaleFactor` change to the browser context.
- Crop to show only the relevant UI area, not the entire browser window
- Include enough surrounding context for users to identify where they are in the app
- Target file size: under 500KB per image where possible (2× zoom captures may exceed this for large pages — that is acceptable when text legibility benefits)

#### 2× zoom capture procedure

```javascript
// 1. Apply 2× zoom to body before capture
document.body.style.zoom = '2';

// 2. Resize viewport so the zoomed element fits
//    (use browser_resize with width/height roughly 2× the natural CSS dimensions)

// 3. Switch language and remove dev overlays as usual, then capture via element ref:
//    await browser_take_screenshot({ ref: '<dialog ref>' })

// 4. After all four language captures for a screen, reset zoom before moving on:
document.body.style.zoom = '';
```

The resulting PNG will be ~2× the natural CSS dimensions in pixels (e.g., a 450×700 modal becomes a 900×1400 PNG), giving noticeably sharper text and icons in the docs.

> **Note on `Match the Existing Screenshot's Framing`** (below): the framing *scope* contract is unchanged — only the pixel density doubles. A modal that was 450×700 at 1× zoom becomes 900×1400 at 2× zoom; both show the same modal-only scope.

### Content

- Use realistic but non-sensitive sample data
- Avoid showing personal information, real email addresses, or API keys
- Clear the browser address bar of internal/development URLs if visible
- Use light theme as the default (unless documenting dark mode features)
- For UI language, see **[File Location and Localization](#file-location-and-localization)** — capture in the locale that matches the destination directory (do not capture in English and copy across all languages)

### Focused Cropping

- **Prefer element-level screenshots over full-page captures** when documenting a specific feature or interaction
- **For modals and dialogs: prefer the modal wrapper, not the modal itself.** Use `ref` of `.ant-modal-wrap .ant-modal` (or `[role="dialog"]`) only when the inner element is large enough that its own padding gives the captured content breathing room. Otherwise, capture the surrounding wrapper element (e.g., `.ant-modal-wrap`, a `<section>` panel) so the screenshot picks up the application's natural spacing around the dialog.
- Use `ref` parameter in `browser_take_screenshot` to capture only the relevant element (e.g., a modal, a toolbar section, a specific panel)
- Full-page captures are appropriate for page overview screenshots, but for feature-specific documentation, crop to the relevant area so users can clearly identify what is being described
- Include just enough surrounding context for users to orient themselves

### Padding & Framing

The docs renderer wraps every captured image in a "matte" frame — a soft off-white background with padding, an outer border, and rounded corners. The matte provides **visual breathing room** even when the captured PNG itself has no internal padding, so a tight element-level capture no longer reads as cramped. Two implications for authors:

- **Border-radius on the matte is the only outer radius**. Inside the matte, the inner `<img>` is bare (no border, no radius). This is intentional: if a captured screen has its own rounded corners (a modal, a card), they sit cleanly on the matte and no longer compete with a second outer radius. **Do not** try to "fix" inner radius mismatches at capture time — capture the raw element and let the matte frame it.
- **You do not need to bake padding into the screenshot.** The matte gives every image equal breathing room. The capture should still avoid clipping content (don't crop a button's last pixel column), but you do not need to expand the bounding box just to leave whitespace.

#### Parent-container-preferred rule

When in doubt about which element to capture, climb one level: `.ant-modal-wrap` over `.ant-modal`, a containing `<section>` over a tightly-bounded card, a wizard step's outer panel over the inner form. The renderer's matte adds outer padding regardless, so picking the parent costs nothing visually but gives the capture access to the application's own intra-component spacing.

#### Small-element rule

When the target element's bounding box is **≤ 600 CSS px** in either dimension (notifications, badges, button rows, toasts, small status pills), an unmodified element capture will produce a tiny PNG that the renderer would otherwise display proportionally small. Two acceptable handling paths:

1. **Capture as-is and trust the auto size cap.** The renderer reads the PNG header and caps the display width at `pixel_width × 0.5` (the 2× zoom convention). A 760×190 notification capture will render at ~380 CSS px wide on the web and PDF, framed by the matte — usually fine.
2. **Reposition the element on a neutral surface before capture** when you want the capture to *fill* the docs column. Use `browser_evaluate` to apply temporary CSS — e.g., move a floating notification to the viewport center with extra padding so the bounding box is larger and includes deliberate whitespace around the widget. Reset the style after capture.

Pick path (2) only when the auto-capped display feels too small for the surrounding documentation context. Most small-element captures look correct with path (1).

#### Image size caps (renderer-side, automatic)

The web and PDF renderers automatically size images based on the captured PNG's pixel dimensions (assuming the 2× zoom convention):

- Display width = `pixel_width × 0.5`, capped at the article column width.
- Explicit overrides via the `![alt =<width>](url)` size hint take precedence (`=380px`, `=50%`, `=auto`). Use these sparingly — only when the automatic cap produces a visibly wrong result.

Authors do not normally need to think about this. Capture at 2× zoom, the renderer handles the display size.

### Match the Existing Screenshot's Framing (for re-captures)

When **replacing an existing screenshot** (same filename), the new image MUST match the previous image's framing scope. The filename encodes a contract about what the image shows.

**Before recapturing**, run the following preflight on the file you intend to replace:

```bash
# 1. Inspect the previous version's dimensions and visual scope
git show main:path/to/images/foo.png > /tmp/old.png
file /tmp/old.png        # note WIDTH x HEIGHT
# 2. Open /tmp/old.png and identify:
#    - Is it a header strip? (very wide, very short — e.g., 2358x222)
#    - Is it a modal/dialog only? (medium, no chrome — e.g., 988x804)
#    - Is it a sidebar segment? (narrow column — e.g., 1500x1098)
#    - Is it a full page? (~viewport width × viewport height — e.g., 2880x1800)
```

Then capture the new screenshot at the **same scope**:

| Old image scope | Capture method |
|---|---|
| Header strip (e.g., `header.png`) | `ref` of `header`/top-bar element only — never `fullPage: true` |
| Modal/dialog | `ref` of `.ant-modal-wrap` (wrapper, preferred — see [Parent-container-preferred rule](#parent-container-preferred-rule)) or `.ant-modal-wrap .ant-modal` / `[role="dialog"]` |
| Sidebar segment | `ref` of the sidebar element |
| Page region (e.g., a step in a wizard) | `ref` of the specific panel, not the whole layout |
| Small widget (notification, badge, ≤ 600 CSS px) | See [Small-element rule](#small-element-rule) — capture as-is and trust the auto size cap, or reposition with `browser_evaluate` for full-column rendering |
| Full page overview | `fullPage: true` is acceptable |

**Anti-pattern observed in PR #6708**: `header.png` was 2358×222 (header strip only) on `main`, recaptured as 2880×1800 (full viewport including sidebar + main content + breadcrumbs). The filename promises "header" but the new image shows everything. **Always run the preflight above before re-capturing.**

If the framing genuinely needs to change (e.g., the feature now spans more of the page), update the filename to reflect the new scope (e.g., `header.png` → `top_bar_with_session_timer.png`) rather than silently broadening an existing image.

### Cleanup After Capture

- **Always delete any resources created during screenshot capture** (folders, files, sessions, etc.)
- If you created a test folder, file, or session to demonstrate a feature, remove it after capturing
- This prevents test artifacts from accumulating in the live environment

### What to Capture

| Scenario | What to Include |
|----------|-----------------|
| Full page | The complete page content visible in the viewport |
| Dialog/Modal | The modal with enough background to show context |
| Form | The form with all fields visible, some filled with example data |
| Action result | The state after the action (e.g., success notification, new item in list) |
| Menu/Dropdown | The expanded menu with options visible |

## Markdown Reference Format

```markdown
![](images/filename.png)
```

- No alt text (current convention)
- Relative path from the document file
- Blank lines before and after the image reference

## When to Update Screenshots

Screenshots should be updated when:
- UI layout changes significantly (new buttons, reorganized sections)
- A documented dialog adds or removes fields
- Navigation structure changes (new sidebar items, reorganized menus)
- A feature is redesigned with a new look

Screenshots do NOT need updating for:
- Minor styling changes (color tweaks, font changes)
- Internal refactoring with no visual change
- Backend-only changes

## Placeholder for Missing Screenshots

When a screenshot needs to be captured but isn't available yet:

```markdown
![](images/new_feature_dialog.png)
<!-- TODO: Capture screenshot of the new feature dialog -->
```

This allows the documentation to be merged while flagging the image for later capture.

## Maintenance

### Identifying Stale Screenshots

A screenshot may be stale if:
- The referenced UI elements no longer exist
- The UI layout has changed significantly since capture
- New features visible in the UI are not reflected in the screenshot

### Removing Unused Screenshots

Before deleting an image file:
1. Search all `.md` files across all languages for references to the filename
2. Confirm no documentation references the image
3. Remove the file from all language `images/` directories
