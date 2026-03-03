---
description: Scan codebase for mechanical anti-patterns from Lit-to-React migration. Produces a report and optionally creates Jira issues.
model: opus
---

# Post-Migration Mechanical Audit

Scan `react/src/components/` and `react/src/pages/` for mechanical anti-patterns left over from the Lit-to-React migration. Report findings grouped by functional area.

## Scan Rules

Run these grep-based detections. For each pattern, count affected files and collect file paths with line numbers.

### 1. Direct antd Button usage (should be BAIButton)

```bash
# Find files importing Button from antd (not BAIButton)
grep -rn "import.*{.*\bButton\b.*}.*from ['\"]antd['\"]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

Skip files that ALSO import BAIButton (they may use both intentionally during transition).

### 2. Typography.Text usage (should be BAIText)

```bash
# Only Typography.Text - Typography.Title and Typography.Paragraph are allowed
grep -rn "Typography\.Text\b" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

Also check for:
```bash
grep -rn "import.*{.*\bText\b.*}.*from ['\"]antd['\"]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

### 3. Direct antd Tag usage (should be BAITag)

```bash
grep -rn "import.*{.*\bTag\b.*}.*from ['\"]antd['\"]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

### 4. Direct antd Alert usage (should be BAIAlert)

```bash
grep -rn "import.*{.*\bAlert\b.*}.*from ['\"]antd['\"]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

### 5. Direct antd Select usage (should be BAISelect)

```bash
grep -rn "import.*{.*\bSelect\b.*}.*from ['\"]antd['\"]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

### 6. Direct antd Card usage (should be BAICard)

```bash
grep -rn "import.*{.*\bCard\b.*}.*from ['\"]antd['\"]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

### 7. Missing `'use memo'` directive

```bash
# Find .tsx files that export React components but lack 'use memo'
# Check: files with "export default" or "export const ... = " that don't have 'use memo'
```

For this pattern:
- Count total component files missing the directive
- Report only 10 sample files (this will be a single bulk issue)
- Exclude: test files, story files, index.ts barrel exports, type-only files

### 8. Hardcoded hex colors

```bash
grep -rn "color: ['\"]#[0-9a-fA-F]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
grep -rn "background.*#[0-9a-fA-F]" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

Exclude: theme definition files, color constant files.

### 9. console.log usage

```bash
grep -rn "console\.log\b" react/src/components/ react/src/pages/ --include="*.tsx" --include="*.ts"
```

Should use `useBAILogger` instead.

## Report Format

Present results grouped by functional area:

```markdown
## Lit-to-React Mechanical Audit

**Scan date:** [date]
**Scope:** react/src/components/, react/src/pages/

### Summary

| Pattern | Files | Severity | Effort |
|---------|-------|----------|--------|
| antd Button → BAIButton | 54 | Low | Small |
| Typography.Text → BAIText | 12 | Low | Small |
| antd Tag → BAITag | 23 | Low | Small |
| antd Alert → BAIAlert | 19 | Low | Small |
| antd Select → BAISelect | 15 | Low | Small |
| antd Card → BAICard | 12 | Low | Small |
| Missing 'use memo' | ~200 | Medium | Small (per file) |
| Hardcoded hex colors | 6 | Low | Small |
| console.log usage | 2 | Low | Small |

### By Functional Area

#### Session Management
| File | Patterns Found |
|------|---------------|
| SessionList.tsx | antd Button (3), antd Tag (2) |
| SessionLauncher.tsx | antd Button (5), missing 'use memo' |

#### Storage
...

#### Admin
...

#### Chat / AI
...

#### Serving / Model Service
...

#### Auth / Login
...

#### Other
...

### Suggested Issues

Based on the scan, I recommend creating issues grouped by:
- **One issue per antd→BAI pattern** (e.g., "Migrate all direct antd Button to BAIButton")
  - Each issue lists all affected files
  - Classification: `auto-mergeable`
- **One bulk issue for missing 'use memo'** with 10 sample files
  - Classification: `auto-mergeable`
- **One issue per other pattern** (hex colors, console.log)
  - Classification: `auto-mergeable`

Create all issues? Or create only specific patterns? (Respond with "create all", "create [pattern]", or "skip")
```

## Issue Creation

When the user approves, create issues via `scripts/jira.sh`.

For each pattern issue:

```bash
bash scripts/jira.sh create \
  --type Task \
  --title "Migrate direct antd [Component] to BAI[Component]" \
  --desc "Post-migration cleanup: mechanical pattern

## Pattern
Direct import of [Component] from 'antd' instead of using BAI[Component] wrapper.

## Affected Files ([count] files)
- react/src/components/Foo.tsx (lines: 5, 42, 87)
- react/src/components/Bar.tsx (lines: 12)
[...full list...]

## Implementation Guide
1. Replace \`import { [Component] } from 'antd'\` with \`import BAI[Component] from '@/components/BAI[Component]'\`
2. Update JSX: \`<[Component] ...>\` → \`<BAI[Component] ...>\`
3. Check for prop differences between antd [Component] and BAI[Component]
4. Run \`bash scripts/verify.sh\` to confirm

## References
- Epic: Post-migration cleanup (#5364)
- Detected by: /lit-audit scanner" \
  --labels "lit-cleanup,claude-batch,auto-mergeable"
```

Then assign and set sprint:
```bash
bash scripts/jira.sh update FR-XXXX --assignee me --sprint current
```

For the `'use memo'` bulk issue:

```bash
bash scripts/jira.sh create \
  --type Task \
  --title "Add missing 'use memo' directive to React components" \
  --desc "Post-migration cleanup: missing React Compiler directive

## Pattern
Component files missing the \`'use memo'\` directive at the top of component bodies.

## Scope
~[count] component files missing the directive.

## Sample Files (10 of [count])
- react/src/components/Foo.tsx
- react/src/components/Bar.tsx
[...10 samples...]

## Implementation Guide
1. Add \`'use memo'\` as the first statement inside each component function body
2. This enables React Compiler optimization
3. Run \`bash scripts/verify.sh\` to confirm

## References
- Epic: Post-migration cleanup (#5364)
- Detected by: /lit-audit scanner" \
  --labels "lit-cleanup,claude-batch,auto-mergeable"
```

Present summary after creation:

```
Issues created:

| # | Jira Key | Title | Files |
|---|----------|-------|-------|
| 1 | FR-XXXX | Migrate direct antd Button to BAIButton | 54 |
| 2 | FR-YYYY | Migrate Typography.Text to BAIText | 12 |
| ...

Next: Run /fiber-do FR-XXXX to implement individually.
```
