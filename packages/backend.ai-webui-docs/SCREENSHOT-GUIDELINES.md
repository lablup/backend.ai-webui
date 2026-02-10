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
- Acronyms in uppercase only when well-known: `SSH_SFTP_connection.png`, `LLM_chat.png`

## File Location

- All screenshots go in `src/{lang}/images/`
- Images are shared across languages (same filenames, same directory structure per language)
- **Language-specific captures**: Each language directory should contain screenshots captured in that language's UI locale. Switch the app language before capturing so that UI labels (buttons, menus, headers) appear in the correct language for each version
- When UI is purely visual with no text (e.g., diagrams), one capture can be shared across all directories

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

### Focused Cropping

- **Prefer element-level screenshots over full-page captures** when documenting a specific feature or interaction
- Use `ref` parameter in `browser_take_screenshot` to capture only the relevant element (e.g., a modal, a toolbar section, a specific panel)
- Full-page captures are appropriate for page overview screenshots, but for feature-specific documentation, crop to the relevant area so users can clearly identify what is being described
- Include just enough surrounding context for users to orient themselves

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
