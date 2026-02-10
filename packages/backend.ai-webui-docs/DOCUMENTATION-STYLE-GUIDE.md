# Documentation Style Guide

Formatting, structure, and writing conventions for the Backend.AI WebUI user manual.

## Writing Tone and Voice

- **Perspective**: Second person ("You can...", "Click the...")
- **Voice**: Active voice preferred ("Click the button" not "The button should be clicked")
- **Tone**: Professional, instructional, user-friendly
- **Sentences**: Clear and concise. Avoid jargon; explain technical terms on first use
- **Audience**: End users who may not have deep technical backgrounds

## Document Structure

Every documentation page follows this general flow:

```markdown
# Page Title

Brief introduction explaining the feature and its purpose (1-3 paragraphs).

![](images/feature_overview.png)

## Major Section

Description with context.

### Subsection

Detailed content...
```

### Heading Rules

| Level | Usage | Example |
|-------|-------|---------|
| H1 `#` | Page title. **Exactly one** per file | `# Session Page` |
| H2 `##` | Major sections within the page | `## Create Storage Folder` |
| H3 `###` | Subsections under H2 | `### SSH Keypair Management` |

- Use Title Case for headings
- Always leave a blank line before and after headings
- Never skip heading levels (e.g., H1 directly to H3)

## Formatting Elements

### Step-by-Step Procedures

Use numbered lists for ordered procedures:

```markdown
1. Click the **Create Folder** button on the Data page
2. Fill in the required fields in the creation dialog
3. Click **Create** to confirm

![](images/vfolder_create_modal.png)
```

For single actions, use narrative prose:

```markdown
To access your storage folders, select **Data** from the sidebar menu.
```

### Form Field / Dialog Documentation

Use bullet lists with field name followed by colon and description:

```markdown
The creation dialog contains the following fields:

- **Usage Mode**: Set the purpose of the folder.
   * General: A folder for storing various data in a general-purpose manner.
   * Models: A folder specialized for model serving and management.
   * Auto Mount: Automatically mounted when a session is created.
- **Folder name**: The name of the folder (up to 64 characters).
- **Location**: Select the storage host where the folder will be created.
```

Rules:
- Use `-` (dash) for primary field names
- Use `*` (asterisk) for nested options or sub-items
- Bold the field name: `**Field Name**:`
- Indent sub-items with 3 spaces

### Notes, Warnings, and Tips

Use indented blocks (3 spaces) with blank lines before and after:

```markdown
Previous paragraph content here.

   Quota is only available on storage systems that support quota settings
   (e.g. XFS, CephFS, NetApp, Purestorage). For quota configuration,
   refer to the Quota Setting Panel section.

Next paragraph content here.
```

Rules:
- Indent with **3 spaces**
- No prefix markers (no "Note:", "Warning:", etc.)
- Blank line before and after the indented block
- Keep the note concise and directly relevant

### Images

Format: `![](images/filename.png)`

```markdown
Introductory sentence explaining the context.

![](images/feature_screenshot.png)

Explanation or next steps after the image.
```

Rules:
- Place images **after** the introductory text, not before
- Leave blank lines before and after the image reference
- No alt text (current convention)
- Use relative paths: `images/filename.png`
- If a screenshot doesn't exist yet, add a TODO comment:
  ```markdown
  ![](images/new_feature.png)
  <!-- TODO: Capture screenshot of the new feature -->
  ```

### Cross-References (Internal Links)

Format: `[Link Text <anchor-name>](#Link Text <anchor-name>)`

```markdown
For details, refer to the
[Create Storage Folder <create-storage-folder>](#Create Storage Folder <create-storage-folder>)
section.
```

Rules:
- Anchor names use lowercase with hyphens
- Link text should be descriptive and match the target section title
- Both parts of the link (display and href) must match

### Inline Code

Use backticks for:
- UI button labels: `` `SIGN UP` ``
- File/directory paths: `` `/home/work/` ``
- Configuration values: `` `config.toml` ``
- Keyboard shortcuts: `` `Ctrl-R` ``
- Technical identifiers: `` `__NOT_TRANSLATED__` ``

### Code Blocks

Use fenced code blocks with language identifier:

````markdown
```shell
$ pip install backend.ai-client
```
````

### Tables

Use standard Markdown tables for structured comparisons:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
```

Use tables sparingly. Prefer bullet lists for field descriptions.

## Content Guidelines

### Feature Introduction Pattern

Always introduce a feature before diving into procedures:

```markdown
## Model Serving

Backend.AI supports model serving to deploy trained models as API endpoints.
Model serving allows you to create inference endpoints that can be accessed
via HTTP requests. This feature is available from version 23.09 onwards.

![](images/model_serving_page.png)
```

### Admin vs User Content

When documenting admin-specific features:

```markdown
## User Dashboard

Description of what regular users see...

![](images/dashboard.png)

For superadmins, additional panels are available:

![](images/admin_dashboard.png)

- **Active Sessions**: Shows the total number of active sessions across all projects...
```

Rules:
- Document user-facing features first
- Clearly mark admin-only features: "For superadmins..." or "Logging in with an admin account will reveal..."
- Use separate screenshots for admin views when they differ significantly

### Completeness Checklist

For each documented feature, ensure:
- [ ] Introduction explains what the feature is and why it's useful
- [ ] Screenshot of the main UI state is included
- [ ] All form fields in dialogs are described
- [ ] Step-by-step procedures for common workflows
- [ ] Notes for limitations, prerequisites, or special conditions
- [ ] Cross-references to related sections
- [ ] Admin-specific aspects documented separately

## File Organization

### File Naming

- Directory and file names: `snake_case`
- Pattern: `feature_name/feature_name.md`
- Examples: `vfolder/vfolder.md`, `session_page/session_page.md`, `admin_menu/admin_menu.md`

### Adding New Pages

1. Create the directory and file under each language: `src/{lang}/new_feature/new_feature.md`
2. Add navigation entries in `src/book.config.yaml` for all 4 languages
3. Ensure the page structure follows this guide
4. Add cross-references from related existing pages

## Common Mistakes to Avoid

| Mistake | Correct |
|---------|---------|
| Multiple H1 headings in one file | Exactly one H1 per file |
| Skipping heading levels (H1 to H3) | Use sequential levels (H1, H2, H3) |
| Starting with an image before any text | Always introduce the context first |
| Mixing `-` and `*` at the same nesting level | Use `-` for primary, `*` for nested |
| Hard-coded UI labels without checking i18n | Verify against `resources/i18n/{lang}.json` |
| Using "Note:" or "Warning:" prefixes | Use indented blocks without prefixes |
| Inconsistent terminology | Follow `TERMINOLOGY.md` |
