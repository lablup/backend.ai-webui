# record-e2e-gif Skill

Record Playwright e2e tests as GIF animations, one GIF per test case.

## Prerequisites

- `ffmpeg` must be installed (`/opt/homebrew/bin/ffmpeg` on macOS)
- Playwright dev server must be running. The endpoint is read from `e2e/envs/.env.playwright` (`E2E_WEBUI_ENDPOINT`). Do NOT hardcode the port — it varies per environment.

## How It Works

1. Run specified Playwright tests with `--video=on` (Playwright saves `.webm` per test in `test-results/`)
2. For each `.webm` file, convert to `.gif` using ffmpeg with palette optimization
3. Save GIFs to `e2e/recordings/{spec-name}/` directory
4. Return a map of test name → GIF file path

## Usage

When invoked, ask for or accept:
- `testFile`: path to the spec file (e.g. `e2e/environment/environment.spec.ts`)
- `grep`: optional test name pattern to filter (e.g. `BAIPropertyFilter`)
- `project`: browser project, default `chromium`
- `outputDir`: output directory for GIFs, default `e2e/recordings`

## Recording Command

```bash
pnpm exec playwright test {testFile} --grep "{grep}" --project={project} \
  --video=on --reporter=list 2>&1
```

Videos are saved to `test-results/*/video.webm` (one directory per test).

## Conversion Command (per video)

```bash
/opt/homebrew/bin/ffmpeg -y \
  -i "{input.webm}" \
  -vf "fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 \
  "{output.gif}"
```

- `fps=8`: 8 frames per second (smooth enough, small file size)
- `scale=960:-1`: 960px wide, height auto
- `palettegen/paletteuse`: two-pass palette for high quality GIF

## Finding Test Name from Directory

Playwright names test result directories as:
`{spec-dir}-{describe-name}-{test-name}-{project}/`

Parse the directory name to derive a slug for the GIF filename:
- Strip the browser suffix (`-chromium`)
- Replace spaces and special chars with `-`
- Truncate to 60 chars

## Uploading GIFs to GitHub PR

**IMPORTANT**: GIF files must NEVER be committed to git. `e2e/recordings/` is in `.gitignore`.

**Image upload MUST use Chrome DevTools MCP** — do NOT use `gh` CLI, GitHub releases, or any other method.

**CRITICAL: GIF table MUST be added to the PR body (본문), NEVER as a PR comment.**

The workflow:

1. Navigate to the PR page via `mcp__chrome-devtools__navigate_page`
2. Enter edit mode on the PR body (click "Show options" → "Edit comment")
3. Upload GIFs via the "Attach files" button (`mcp__chrome-devtools__upload_file`) to get CDN URLs
4. Extract CDN URLs (`github.com/user-attachments/assets/...`) from the textarea
5. If uploads went to the comment textarea, extract URLs and clear it
6. Set the PR body textarea content (preserve existing body + append GIF table) using `nativeInputValueSetter`
7. Submit via the "Update comment" button on the PR body form

This produces persistent GitHub CDN URLs that render correctly in markdown. The user must be logged into GitHub in Chrome for this to work.

See `.claude/agents/playwright-e2e-pr-updater.md` for the full step-by-step Chrome DevTools upload workflow.

## Output Format

Return a markdown table suitable for embedding in a PR description:

```markdown
| Test | Recording |
|------|-----------|
| Admin can see the BAIPropertyFilter | ![](https://github.com/user-attachments/assets/{uuid}) |
| Admin can filter by name | ![](https://github.com/user-attachments/assets/{uuid}) |
```
