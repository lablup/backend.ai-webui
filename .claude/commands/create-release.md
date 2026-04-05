# Create Release

Create a release branch, tag, and GitHub release for Backend.AI WebUI.

## Arguments

`$ARGUMENTS` specifies the version to release (e.g., `26.4.0`, `26.4.0-alpha.1`, `26.4.0-beta.0`).

### If Arguments Not Provided

Automatically determine the next version:

1. Read current version from root `package.json`
2. Parse the version: extract `MAJOR.MINOR.PATCH` and any prerelease suffix
3. Present options via `AskUserQuestion`:

```
AskUserQuestion({
  questions: [{
    question: "Which version do you want to release?",
    header: "Release Version",
    multiSelect: false,
    options: [
      { label: "MAJOR.MINOR.PATCH (Stable Release)", description: "Release as stable version" },
      { label: "MAJOR.MINOR.PATCH-alpha.N (Alpha)", description: "Alpha pre-release for testing" },
      { label: "MAJOR.MINOR.PATCH-beta.N (Beta)", description: "Beta pre-release for wider testing" },
      { label: "MAJOR.MINOR.PATCH-rc.N (Release Candidate)", description: "Release candidate before stable" },
      { label: "Custom version", description: "Enter a custom version string" }
    ]
  }]
})
```

Adjust the option labels with actual computed versions based on the current version:
- If current is `26.4.0-alpha.0`: suggest `26.4.0-alpha.1`, `26.4.0-beta.0`, `26.4.0-rc.0`, `26.4.0`
- If current is `26.4.0`: suggest `26.4.1`, `26.5.0-alpha.0`, `26.5.0`, `27.0.0-alpha.0`
- Increment the prerelease number if same type already exists

If user selects "Custom version", ask them to type it.

## Process

### 1. Validate Prerequisites

- Ensure current branch is `main` and working directory is clean (`git status`)
- If not clean, warn the user and stop
- Validate version format: `X.Y.Z` or `X.Y.Z-{alpha|beta|rc}.N`

### 2. Create Release Branch

Create a branch named `MAJOR.MINOR` (e.g., `26.4`) from `main`:

```bash
git checkout -b 26.4
```

If the branch already exists, check it out and merge `main` into it:

```bash
git checkout 26.4
git merge main -m "chore: merge main into 26.4 for v{VERSION} release"
```

If the merge has conflicts, warn the user and stop — do not force-resolve conflicts automatically.

### 3. Update Version in package.json

Use the Edit tool to set the `version` field in root `/package.json` to the target version (e.g., `26.4.0` or `26.4.0-alpha.1`).

### 4. Run `make versiontag`

This propagates the version to all related files:
- `version.json`
- `index.html`
- `manifest.json`
- `react/package.json`
- `packages/backend.ai-ui/package.json`
- `electron-app/package.json`

```bash
make versiontag
```

### 5. Commit All Changes

Stage all modified files and commit:

```bash
git add -A
git commit -m "release: v{VERSION}"
```

### 6. Create Version Tag

```bash
git tag v{VERSION}
```

### 7. Push Branch and Tag to Remote

```bash
git push -u origin {MAJOR.MINOR}
git push origin v{VERSION}
```

### 8. Create GitHub Release

Determine the base tag for auto-generated release notes:

#### Base Tag Selection Logic

1. List all tags sorted by version:
   ```bash
   git tag --sort=-version:refname
   ```

2. Determine the base tag:
   - **If releasing a stable version** (e.g., `v26.4.0`):
     - Find the most recent stable release tag (no `-alpha`, `-beta`, `-rc` suffix)
     - Skip the tag we just created
   - **If releasing a prerelease version** (e.g., `v26.4.0-alpha.1`):
     - Find the most recent tag of ANY type (stable or prerelease)
     - Skip the tag we just created
     - Pick the latest one as the base

3. Create the release:
   ```bash
   gh release create v{VERSION} \
     --title "v{VERSION}" \
     --generate-notes \
     --notes-start-tag {BASE_TAG} \
     --target {BRANCH}
   ```

   For prerelease versions (alpha/beta/rc), add `--prerelease` flag.

### 9. Improve Release Notes

After the GitHub release is created, invoke the `/fw:release-note` skill to improve and format the release notes:

```
/fw:release-note v{VERSION}
```

This will:
- Fetch the auto-generated release notes
- Categorize and group changes with emojis
- Add contextual descriptions
- Ask for user confirmation before updating

## Output Summary

After completion, provide:
1. **Release Branch**: branch name that was created/used
2. **Version**: the released version
3. **Tag**: the git tag created
4. **Base Tag**: the tag used as comparison base for release notes
5. **GitHub Release URL**: link to the created release

## Example

```
User: /create-release 26.4.0

1. Validates main branch is clean
2. Creates branch 26.4
3. Updates package.json to 26.4.0
4. Runs make versiontag
5. Commits: "release: v26.4.0"
6. Tags: v26.4.0
7. Pushes branch 26.4 and tag v26.4.0
8. Creates GitHub release (base: v26.3.0)
9. Runs /fw:release-note v26.4.0 to improve notes

User: /create-release 26.4.0-beta.0

1. Validates main branch is clean
2. Branch 26.4 already exists → checks it out and merges main into 26.4
3. Updates package.json to 26.4.0-beta.0
4. Runs make versiontag
5. Commits: "release: v26.4.0-beta.0"
6. Tags: v26.4.0-beta.0
7. Pushes branch 26.4 and tag v26.4.0-beta.0
8. Creates GitHub pre-release (base: v26.4.0-alpha.1)
9. Runs /fw:release-note v26.4.0-beta.0 to improve notes
```

## Notes

- This skill uses `git` directly for branch/tag operations (not Graphite) because release branches follow a different workflow than feature PRs
- Stable versions are published releases; alpha/beta/rc versions are marked as pre-releases
- Always confirm with the user before pushing to remote if anything looks unexpected
