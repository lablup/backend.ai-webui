---
description: Bump version to next alpha and update dependencies after release.
argument-hint: [26.1.0-alpha.0]
model: sonnet
---

# Bump to Alpha Version and Update Dependencies

After a release, this command updates the project to the next alpha version and updates all dependencies within semver-compatible ranges.

## Arguments

`$ARGUMENTS` specifies the new alpha version (e.g., `26.1.0-alpha.0`).

### If Arguments Not Provided

If no version is specified, automatically determine the next version options:

1. **Read current version** from root `package.json`
2. **Parse the version**: Extract `MAJOR.MINOR.PATCH` (ignore any existing prerelease suffix)
3. **Generate three options** for the user to choose from:
   - **Patch bump**: `MAJOR.MINOR.(PATCH+1)-alpha.0` (e.g., `26.1.1-alpha.0`)
   - **Minor bump**: `MAJOR.(MINOR+1).0-alpha.0` (e.g., `26.2.0-alpha.0`)
   - **Major bump**: `(MAJOR+1).1.0-alpha.0` (e.g., `27.1.0-alpha.0`)

4. **Use `AskUserQuestion`** to let the user select:

```
AskUserQuestion({
  questions: [{
    question: "Which version bump do you want for the next alpha release?",
    header: "Version",
    multiSelect: false,
    options: [
      {
        label: "26.1.1-alpha.0 (Patch)",
        description: "Patch version bump - for small fixes and updates"
      },
      {
        label: "26.2.0-alpha.0 (Minor)",
        description: "Minor version bump - for new features (Recommended)"
      },
      {
        label: "27.1.0-alpha.0 (Major)",
        description: "Major version bump - for breaking changes"
      }
    ]
  }]
})
```

**Note**: If the current version already has `-alpha.N` suffix, strip it before calculating the next versions.

## Process

### 1. Validate Version Format

- Ensure the version follows semver format with alpha suffix: `X.Y.Z-alpha.N`
- Example valid formats: `26.1.0-alpha.0`, `26.2.0-alpha.1`

### 2. Update Root package.json Version

- Update the `version` field in the root `/package.json` to the new alpha version

### 3. Run `make versiontag`

- This command propagates the version to all related files:
  - `version.json`
  - `index.html`
  - `manifest.json`
  - `react/package.json`
  - `packages/backend.ai-ui/package.json`
  - `electron-app/package.json`

### 4. Update Dependencies

Update dependencies in the following package.json files within semver-compatible ranges:

- `/packages/backend.ai-ui/package.json`
- `/react/package.json`

**Important Rules:**

- **Read `pnpm-workspace.yaml`** first to check the following settings:
  - `minimumReleaseAge`: Minimum age in minutes for package versions (e.g., 10080 = 7 days)
  - `minimumReleaseAgeExclude`: List of packages exempt from the minimum age rule
- Respect these settings when updating dependencies
- Use `pnpm update` with appropriate flags for semver-compatible updates

### 5. Install Updated Dependencies

Run `pnpm install` to update the lockfile with new dependency versions.

### 6. Verify Changes and Fix TypeScript Errors

After updating dependencies, verify everything works correctly:

1. **Run `pnpm install`** to ensure no errors in dependency resolution
2. **Check all package.json files** have the correct version
3. **Note any peer dependency warnings**
4. **Run TypeScript type checking** to detect any type errors caused by updated packages:

```bash
# Check TypeScript errors in react package
pnpm --prefix ./react run typecheck

# Check TypeScript errors in backend.ai-ui package
pnpm --prefix ./packages/backend.ai-ui run typecheck

# Or run tsc directly if typecheck script is not available
pnpm --prefix ./react exec tsc --noEmit
pnpm --prefix ./packages/backend.ai-ui exec tsc --noEmit
```

5. **If TypeScript errors occur**, fix them before proceeding:
   - Review the error messages to identify which updated packages caused the issue
   - Common fixes include:
     - Updating type definitions (`@types/*` packages)
     - Adjusting code to match new API signatures
     - Adding type assertions where needed
   - Fix all errors before completing the version bump

6. **Run build to ensure everything compiles**:

```bash
pnpm run build
```

## Commands Reference

```bash
# Update root package.json version (use Edit tool)

# Propagate version to all files
make versiontag

# Update dependencies in workspace packages
pnpm update --recursive --latest --workspace

# Or update specific packages
cd react && pnpm update
cd packages/backend.ai-ui && pnpm update

# If engine constraints block:
pnpm update --ignore-engines

# Install to update lockfile
pnpm install
```

## Output Summary

After completion, provide a summary including:

1. **Version Update**: Old version -> New version
2. **Files Updated**: List of files modified by `make versiontag`
3. **Dependencies Updated**: Summary of updated packages with version changes
4. **Peer Dependency Warnings**: Any warnings encountered
5. **Next Steps**: Suggest committing changes if everything looks good

## Example Workflow

```
User: /bump-alpha-version 26.1.0-alpha.0

Claude:
1. Updates package.json version to 26.1.0-alpha.0
2. Runs make versiontag
3. Updates dependencies in react/ and packages/backend.ai-ui/
4. Runs pnpm install
5. Provides summary of all changes
```

## Notes

- Always verify the current version before updating
- Check git status before running to ensure a clean working directory
- This command does NOT create a commit - let the user decide when to commit
- If there are uncommitted changes, warn the user first
