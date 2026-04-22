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
3. Loop through the 4 languages: `switchLanguage(lang)` → take screenshot → save to `src/{lang}/images/<file>.png`.
4. Move to the next screen.

This pattern is ~4× faster than re-navigating to `/usersettings` for each language and avoids repeating the page setup four times.

## Capture Standards

### Resolution and Size

- Capture at standard display resolution (not Retina/HiDPI unless necessary)
- Crop to show only the relevant UI area, not the entire browser window
- Include enough surrounding context for users to identify where they are in the app
- Target file size: under 500KB per image where possible

### Content

- Use realistic but non-sensitive sample data
- Avoid showing personal information, real email addresses, or API keys
- Clear the browser address bar of internal/development URLs if visible
- Use light theme as the default (unless documenting dark mode features)
- For UI language, see **[File Location and Localization](#file-location-and-localization)** — capture in the locale that matches the destination directory (do not capture in English and copy across all languages)

### Focused Cropping

- **Prefer element-level screenshots over full-page captures** when documenting a specific feature or interaction
- **For modals and dialogs: capture only the modal element itself**, not the full page. Use the modal's DOM element as the screenshot target (e.g., `.ant-modal-wrap .ant-modal`, `[role="dialog"]`)
- Use `ref` parameter in `browser_take_screenshot` to capture only the relevant element (e.g., a modal, a toolbar section, a specific panel)
- Full-page captures are appropriate for page overview screenshots, but for feature-specific documentation, crop to the relevant area so users can clearly identify what is being described
- Include just enough surrounding context for users to orient themselves

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
| Modal/dialog only | `ref` of `.ant-modal-wrap .ant-modal` or `[role="dialog"]` |
| Sidebar segment | `ref` of the sidebar element |
| Page region (e.g., a step in a wizard) | `ref` of the specific panel, not the whole layout |
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
