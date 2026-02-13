---
applyTo: "packages/backend.ai-webui-docs/**/*.md"
---

# Documentation Guidelines for Backend.AI WebUI User Manual

These instructions apply to user manual documentation in `packages/backend.ai-webui-docs/`.

## Reference Files

Always consult these before writing or editing documentation:

- `packages/backend.ai-webui-docs/TERMINOLOGY.md` - Standardized terminology
- `packages/backend.ai-webui-docs/DOCUMENTATION-STYLE-GUIDE.md` - Formatting conventions
- `packages/backend.ai-webui-docs/TRANSLATION-GUIDE.md` - Translation rules per language
- `packages/backend.ai-webui-docs/SCREENSHOT-GUIDELINES.md` - Image conventions

## Quick Rules

### Structure

- One H1 (`#`) per file as the page title
- H2 (`##`) for major sections, H3 (`###`) for subsections
- Never skip heading levels
- Always introduce a feature before showing procedures

### Formatting

- Step-by-step procedures use numbered lists
- Form fields use bullet lists with bold field names: `- **Field Name**: Description`
- Notes/warnings are indented blocks (3 spaces) with no prefix markers
- Images: `![](images/filename.png)` placed after introductory text
- Cross-references: `[Text <anchor>](#Text <anchor>)`
- Inline code for UI elements, paths, config values: backticks

### reStructuredText (RST) Directives
When converting from reST to Markdown, follow these general steps:

1. **Code Blocks**:
   - reST uses `.. code-block::` for code blocks.
   - Markdown uses triple backticks (```) to denote code blocks.
   - Example:
     ```rst
     .. code-block:: python

        print("Hello, world!")
     ```
     becomes
     ```markdown
     ```python
     print("Hello, world!")
     ```

2. **Tables**:
   - reST tables need to be manually converted to Markdown tables using `|` and `-`.
   - Example:
     ```rst
     +---------+---------+
     | Header  | Header  |
     +=========+=========+
     | Cell    | Cell    |
     +---------+---------+
     ```
     becomes
     ```markdown
     | Header  | Header  |
     |---------|---------|
     | Cell    | Cell    |
     ```

4. **Cross-References**:

   To convert the `[Text <anchor>](#Text <anchor>)` format from reStructuredText into Markdown, follow these steps:
 
   1. **Utilize Automatically Generated Anchors in Headers**:
     - In Markdown, headers automatically generate anchors. For example, a header like `## Section Title` will automatically create an anchor `#section-title`.
 
   2. **Create a Markdown Link**:
     - Use these anchors to create links.
     - For instance, if you have `[Text <anchor>](#Text <anchor>)` in reST, it can be converted to Markdown as follows:
 
       ```markdown
       [Text](#text-anchor)
       ```
 
   The important point to note is that in Markdown, spaces are typically converted to hyphens (`-`) and everything is treated in lowercase. Thus, if you have a header called `Text Anchor`, the anchor would be `#text-anchor`.

   3. **Anchors Must Always Be in English**:
     - When translating cross-references for non-English documentation, **only translate the display text**, never the anchor.
     - Anchors are identifiers that must remain in English across all language versions to ensure consistent linking.
     - Example for Korean translation:
       ```markdown
       <!-- ✅ Good: Display text translated, anchor stays in English -->
       [모델 서빙](#model-serving)
       [사용자 자원 정책](#manage-resource-policy)

       <!-- ❌ Bad: Anchor translated to Korean -->
       [모델 서빙](#모델-서빙)
       [사용자 자원 정책](#사용자-자원-정책)
       ```

   4. **Custom Anchors for Non-Heading Targets**:
     - Markdown only auto-generates anchors from headings (`##`, `###`, etc.). Bold text (`**...**`) or other inline elements do **not** generate anchors.
     - For translated documents, heading anchors are auto-generated from the translated text (e.g., `#### 토큰 생성` → `#토큰-생성`), which won't match English anchor IDs like `#generating-tokens`.
     - To create a cross-reference target at a non-heading location, or to ensure English anchors work in translated pages, insert an HTML anchor tag:
       ```markdown
       <a id="generating-tokens"></a>

       #### 토큰 생성
       ```
     - The `<a id="..."></a>` tag must be placed **before** the target content, with a blank line between the tag and the content.
     - Use this pattern when:
       - The cross-reference target is bold text, not a heading
       - The heading is in a non-English language but the anchor must stay in English
       - Multiple cross-references need to point to the same location
 
### Terminology

- Use "compute session" (not "container" for runtime)
- Use "storage folder" / "vfolder" (not "data folder")
- Use "resource group" (not "scaling group")
- Use "keypair" (one word, no hyphen)
- Use "domain" (not "organization")
- Use "project" (not "group")
- Write "fractional GPU (fGPU)" on first mention, then "fGPU"

### Multilingual

- Always write English (`en/`) first
- Keep all 4 language versions structurally identical
- Verify UI labels against `resources/i18n/{lang}.json`
- Images are shared across languages (same filenames)
- New pages require navigation entries in `book.config.yaml` for all languages

#### Korean Language Rules

- **Period Usage**: Always add a period (.) after sentences ending with formal Korean endings (합니다, 됩니다, 있습니다, 습니다, etc.)
- **Formal Style**: Use 합니다체 (formal polite style) consistently throughout
- **Examples**:
  - ✅ "클릭합니다." (Click.)
  - ✅ "생성할 수 있습니다." (Can create.)
  - ❌ "클릭합니다" (Missing period)
  - ❌ "생성할 수 있습니다" (Missing period)

### Content Quality

- Write from the user's perspective (second person: "You can...")
- Use active voice
- Explain what a feature does and why before showing how
- Document all form fields in dialogs
- Mark admin-only features clearly
- Cross-reference related documentation sections

### What NOT to Do

- Do not hard-code UI labels without checking i18n files
- Do not use "Note:" or "Warning:" prefixes for callouts
- Do not place images before introductory text
- Do not use inconsistent terminology across sections
- Do not leave untranslated English in non-English files
- Do not skip languages when adding or updating content
