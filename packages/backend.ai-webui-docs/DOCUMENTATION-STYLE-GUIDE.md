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

### Inline Formatting

Standard inline styles:

| Syntax | Result | Usage |
|--------|--------|-------|
| `**bold**` | **bold** | UI element names, field names, emphasis |
| `*italic*` | *italic* | First use of a term, titles |
| `~~strikethrough~~` | ~~strikethrough~~ | Deprecated items |
| `` `inline code` `` | `inline code` | Paths, config values, technical identifiers |

Use backticks for:
- UI button labels: `` `SIGN UP` ``
- File/directory paths: `` `/home/work/` ``
- Configuration values: `` `config.toml` ``
- Keyboard shortcuts: `` `Ctrl-R` ``
- Technical identifiers: `` `__NOT_TRANSLATED__` ``

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

### Admonitions

Admonitions are callout blocks for highlighting important information. They render with distinctive colors, icons, and titles.

**Syntax:**

````markdown
:::type
Content here. Supports **bold**, *italic*, `code`, lists, tables, and other markdown.
:::
````

**With custom title:**

````markdown
:::type[Custom Title]
Content here.
:::
````

**Supported types:**

| Type | Usage | Color |
|------|-------|-------|
| `:::note` | General information users should take into account | Blue |
| `:::tip` | Helpful suggestions and best practices | Green |
| `:::info` | Supplementary context or background information | Blue |
| `:::warning` | Potential issues or pitfalls to watch out for | Yellow |
| `:::caution` | Situations requiring extra care | Yellow |
| `:::danger` | Critical warnings about destructive or irreversible actions | Red |

**Examples:**

````markdown
:::note
This is a general note. Use it to highlight information that users
should take into account, even when skimming.
:::

:::warning[Important Configuration]
Make sure to configure `apiEndpoint` in `config.toml` before connecting.
:::

:::danger
Deleting a storage folder is **irreversible**. All data in the folder
will be permanently lost.
:::
````

**Rich content inside admonitions:**

Admonitions can contain lists, tables, code blocks, and other markdown:

````markdown
:::info[Resource Allocation Guide]
When creating a new session, consider the following:

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU      | 1 core  | 4 cores     |
| Memory   | 1 GB    | 8 GB        |

```toml title="config.toml"
[resources]
maxCPU = 8
maxMemory = "64g"
```
:::
````

Rules:
- Opening `:::type` and closing `:::` must be on their own lines
- Nested admonitions are supported (inner blocks track depth automatically)
- Prefer admonitions over 3-space indented notes for new documentation

### Notes via Indented Blocks (Legacy)

3-space indented blocks are automatically converted to blockquotes during processing. This is a legacy convention; prefer [Admonitions](#admonitions) for new content.

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
- Not applied inside list contexts or code blocks

### Blockquotes

Use standard `>` syntax for quoted content or supplementary notes:

```markdown
> Your administrator must configure the `apiEndpoint` in `config.toml`
> before you can connect to the Backend.AI server.
```

Multi-line and nested blockquotes are supported:

```markdown
> Backend.AI is an open-source platform for managing AI/ML computing resources.
>
> > This is a nested blockquote with additional context.
>
> Back to the outer level.
```

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
- Image paths are resolved relative to the markdown file's directory during build
- If a screenshot doesn't exist yet, add a TODO comment:
  ```markdown
  ![](images/new_feature.png)
  <!-- TODO: Capture screenshot of the new feature -->
  ```

### Cross-References (Internal Links)

Format: `[Display Text](#anchor-id)`

```markdown
For details, refer to the
[Create Storage Folder](#create-storage-folder) section.
```

For translated documents, only translate the display text — the anchor must stay in English:

```markdown
[스토리지 폴더 생성](#create-storage-folder)
```

Rules:
- Anchor IDs use lowercase English with hyphens
- Link text should be descriptive and match the target section title
- During build, cross-references are processed to include chapter-slug prefixes

:::danger
**Do NOT use angle brackets `<>` in link URLs.** The `marked` parser (CommonMark-compliant)
cannot parse `<>` inside link destinations. Links like `[Text <anchor>](#Text <anchor>)` will
render as **plain text** instead of clickable links — especially inside admonitions (`:::note`, etc.).

```markdown
<!-- ❌ BROKEN: angle brackets in URL break markdown link parsing -->
[Create Storage Folder <create-storage-folder>](#Create Storage Folder <create-storage-folder>)

<!-- ✅ CORRECT: simple anchor ID, no angle brackets -->
[Create Storage Folder](#create-storage-folder)
```
:::

#### HTML Anchors for Non-Heading Targets

Markdown only auto-generates anchors from headings. For non-heading targets, or to ensure English anchors work in translated pages, insert an HTML anchor tag:

```markdown
<a id="generating-tokens"></a>

#### Generating Tokens
```

In translated documents, heading anchors are auto-generated from the translated text. Use HTML anchors to provide stable English IDs:

```markdown
<a id="generating-tokens"></a>

#### 토큰 생성
```

Rules:
- Place `<a id="..."></a>` on its own line **before** the target content
- Leave a blank line between the anchor tag and the content
- Anchor IDs must always be in English, even in translated documents
- Only translate the display text in cross-reference links, never the anchor

### Code Blocks

#### Basic Code Block

Use fenced code blocks with a language identifier:

````markdown
```shell
$ pip install backend.ai-client
```
````

#### Code Block with Title

Add `title="filename"` after the language to display a filename label above the code block:

````markdown
```python title="train.py"
import torch
model = torch.nn.Linear(784, 10)
```
````

````markdown
```toml title="config.toml"
[general]
apiEndpoint = "https://api.backend.ai"
```
````

#### Code Block with Line Highlighting

Add `{lineNumbers}` to highlight specific lines. Supports individual lines and ranges:

````markdown
```javascript title="config.js" {2,4-6}
const config = {
  apiEndpoint: 'https://api.backend.ai',  // highlighted
  version: '26.2.0',
  features: {                              // highlighted
    gpu: true,                             // highlighted
    multiNode: true,                       // highlighted
  },
};
```
````

Line highlighting can be used without a title:

````markdown
```python {1,3-4}
import torch
import numpy as np
from backend.ai import Client  # highlighted
client = Client()               # highlighted
```
````

**Line number syntax:**
- Single line: `{3}`
- Multiple lines: `{1,3,5}`
- Range: `{3-5}`
- Combined: `{1,3-5,7}`

### Collapsible Sections (Details/Summary)

Use HTML5 `<details>` and `<summary>` elements for collapsible content:

```markdown
<details>
<summary>Click to expand</summary>

Hidden content here. Supports **markdown formatting**, lists, code blocks,
tables, and even admonitions.

</details>
```

**Example with rich content:**

````markdown
<details>
<summary>Advanced Configuration Options</summary>

You can configure Backend.AI WebUI using `config.toml`:

```toml title="config.toml"
[general]
apiEndpoint = "https://api.backend.ai"
allowSignup = false
```

:::tip
These settings are loaded on application startup.
:::

</details>
````

Rules:
- Leave a blank line after `<summary>` and before `</details>`
- Markdown inside `<details>` is fully processed (including admonitions, code blocks, etc.)
- Use descriptive summary text

### Tables

Use standard Markdown tables for structured comparisons:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
```

Column alignment is supported:

```markdown
| Left     | Center   | Right    |
|----------|:--------:|---------:|
| text     | text     | text     |
```

Rules:
- Use tables sparingly; prefer bullet lists for field descriptions
- RST-style grid tables (`+---+---+`) are auto-converted to Markdown tables during build

### Horizontal Rules

Use `---` to create a horizontal rule (thematic break):

```markdown
Content above the rule.

---

Content below the rule.
```

### Task Lists

Use checkbox syntax for checklists:

```markdown
- [x] Install Backend.AI WebUI
- [x] Configure `config.toml`
- [ ] Set up SSL certificates
- [ ] Create user accounts
```

### Template Variables

Sphinx-style template variables are substituted during build:

| Variable | Replaced With | Example Output |
|----------|---------------|----------------|
| `\|year\|` | Current year | `2026` |
| `\|version\|` | Documentation version | `26.03` |
| `\|version_date\|` | Version date (YYYY.MM.DD) | `2026.02.12` |
| `\|date\|` | Current date (YYYY/MM/DD) | `2026/02/12` |

These are primarily used in `disclaimer.md` and similar metadata pages.

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

## Supported Markdown Syntax Summary

Quick reference of all supported syntax:

| Feature | Syntax | Notes |
|---------|--------|-------|
| Headings | `# H1` through `###### H6` | One H1 per file |
| Bold | `**text**` | |
| Italic | `*text*` | |
| Strikethrough | `~~text~~` | |
| Inline code | `` `code` `` | |
| Links | `[text](url)` | |
| Images | `![alt](path)` | Relative paths resolved during build |
| Ordered lists | `1. item` | |
| Unordered lists | `- item` | |
| Task lists | `- [x] done` / `- [ ] todo` | |
| Blockquotes | `> text` | Supports nesting |
| Code blocks | ` ```lang ` | With language identifier |
| Code block title | ` ```lang title="file" ` | Displays filename label |
| Line highlighting | ` ```lang {1,3-5} ` | Highlight specific lines |
| Tables | `\| col \| col \|` | Supports alignment |
| Horizontal rules | `---` | |
| Admonitions | `:::note` through `:::danger` | 6 types, custom titles |
| Collapsible sections | `<details>/<summary>` | HTML5 elements |
| HTML anchors | `<a id="name"></a>` | For non-heading targets |
| Cross-references | `[text](#anchor-id)` | Chapter-aware; no `<>` in URLs |
| Template variables | `\|year\|`, `\|version\|`, etc. | Sphinx-style |
| Indented notes | 3-space indent | Legacy; prefer admonitions |

## Common Mistakes to Avoid

| Mistake | Correct |
|---------|---------|
| Multiple H1 headings in one file | Exactly one H1 per file |
| Skipping heading levels (H1 to H3) | Use sequential levels (H1, H2, H3) |
| Starting with an image before any text | Always introduce the context first |
| Mixing `-` and `*` at the same nesting level | Use `-` for primary, `*` for nested |
| Hard-coded UI labels without checking i18n | Verify against `resources/i18n/{lang}.json` |
| Using "Note:" or "Warning:" prefixes | Use admonitions or indented blocks |
| Inconsistent terminology | Follow `TERMINOLOGY.md` |
| Using 3-space indented notes for new content | Prefer admonitions (`:::note`, `:::warning`, etc.) |
| Using `<>` in cross-reference URLs `[Text <anchor>](#...)` | Use `[Text](#anchor-id)` — angle brackets break `marked` link parsing |
| Missing blank line after `<summary>` | Always leave blank line for markdown processing |
| Translating anchor IDs in non-English docs | Anchors must always remain in English |
| Code blocks without language identifier | Always specify the language (e.g., `shell`, `toml`, `python`) |
