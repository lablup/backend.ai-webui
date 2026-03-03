# RST → Markdown Migration Notes

This document summarizes the RST → Markdown conversion applied to the `ko/` docs.
Use it as a reference when applying the same work to other languages (`en/`, `ja/`, `th/`).

**Delete this file after the migration is complete.**

---

## Conversion Rules

### 1. 3-Space Indented Standalone Paragraphs → `:::info` Admonition

Before:
```markdown
   This is a note.
```

After:
```markdown
:::info
This is a note.
:::
```

### 2. Multiple Consecutive Paragraphs → Split by Logical Unit

Consecutive paragraphs on the same topic go into a single `:::info`; different topics get separate `:::info` blocks.

Before:
```markdown
   Explanation about topic A.

   Explanation about topic B.
```

After:
```markdown
:::info
Explanation about topic A.
:::

:::info
Explanation about topic B.
:::
```

### 3. Indented Code → Proper Code Blocks

Before:
```markdown
   $ export API_TOKEN="<token>"
   $ curl -H "Content-Type: application/json" ...
```

After:
````markdown
```bash
$ export API_TOKEN="<token>"
$ curl -H "Content-Type: application/json" ...
```
````

### 4. RST `|` Line-Break Remnants → Remove and Use Plain Text

Before:
```markdown
   | After clicking close, if you upload a file, ...
   | You must re-click the folder icon ...
```

After:
```markdown
:::info
After clicking close, if you upload a file, ...
You must re-click the folder icon ...
:::
```

### 5. Remove Sphinx Metadata (index.md)

Before:
```markdown
sphinx-quickstart on Wed Feb  5 01:58:48 2020.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

# Backend.AI WebUI User Guide
```

After:
```markdown
# Backend.AI WebUI User Guide
```

### 6. RST Tables → Markdown Tables

RST tables (using `=====` separators) are converted to Markdown tables (`|---|---|`).
(e.g., the token table in `model_serving.md`)

---

## What NOT to Convert

The following should **not** be converted even if they use 3-space indentation:

1. **List sub-items** — Continuations of numbered/bulleted lists
   ```markdown
   1. First item
      Add pre-open ports when creating a session.
   ```

2. **Code blocks inside lists** — Code within list items
   ```markdown
   1. Install with Homebrew:
      ```shell
      $ brew install hello
      ```
   ```

3. **Images inside lists** — Screenshots under list items
   ```markdown
   -  Admin-only features:
      ![](../images/admin_feature.png)
   ```

4. **Nested bullets inside lists** — Sub-bullets
   ```markdown
   - Services:
      * The main container name is `main1`.
      * Sub-containers are named `sub1`, `sub2`, ... in order.
   ```

---

## Per-File Conversion Summary

| File | Conversions | Notes |
|------|-------------|-------|
| `index.md` | 0 + cleanup | Removed 3 lines of Sphinx metadata |
| `installation/installation.md` | 2 | |
| `start/start.md` | 1 | |
| `agent_summary/agent_summary.md` | 1 | |
| `trouble_shooting/trouble_shooting.md` | 1 | |
| `login/login.md` | 6 | 3 pairs of info blocks |
| `summary/summary.md` | 2 | |
| `header/header.md` | 1 | |
| `import_run/import_run.md` | 5 | |
| `user_settings/user_settings.md` | 4 | |
| `cluster_session/cluster_session.md` | 1 | List continuations kept as-is |
| `vfolder/vfolder.md` | 9 | Includes RST `|` line-break remnant fixes |
| `share_vfolder/share_vfolder.md` | 4 | |
| `mount_vfolder/mount_vfolder.md` | 4 | 3 consecutive infos split into separate blocks |
| `sftp_to_container/sftp_to_container.md` | 4 | Includes cases with images inside info blocks |
| `appendix/appendix.md` | 1 | |
| `sessions_all/sessions_all.md` | 8 | Includes cases with bullet lists inside info blocks |
| `model_serving/model_serving.md` | 6 + 1 | Includes 1 curl code block conversion |
| `admin_menu/admin_menu.md` | 19 | 2 cases with images inside info blocks |

**Total conversions: ~75 blocks** (20 files)

---

## Notes for Applying to Other Languages

1. **`ko/` docs are the source of truth** — work on `ko/` first, then apply to other languages
2. Each language has different sentence content, so use grep patterns (`^   \S`) to find candidates and apply the "What NOT to Convert" rules above
3. Some languages may have standalone indented paragraphs not present in others (added/changed during translation)
4. ~~Sphinx metadata in `index.md` is likely present in all languages~~ — **Done**: Sphinx metadata removed from `en/`, `ja/`, `th/` index.md files
5. RST `|` remnants in `vfolder.md` may be ko-only, but verify for other languages
6. RST tables (`===` separators) may also remain in other languages

## How to Instruct Claude

```
Refer to @packages/backend.ai-webui-docs/MIGRATION-NOTES.md and apply the same
conversion to en/ (or ja/, th/) docs. Follow the same rules used for ko/:
convert 3-space indented standalone paragraphs to :::info, and leave items that
should not be converted (list continuations, etc.) as-is.
```
