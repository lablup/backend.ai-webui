---
name: record-e2e-gif
description: >
  Record Playwright e2e tests as one GIF per test case (video → ffmpeg palette
  GIF) and return a markdown table for a PR description. Use when the user
  wants e2e runs recorded as GIFs or attached to a PR.
---

# record-e2e-gif Skill

Record Playwright e2e tests as GIF animations, one GIF per test case.

## Prerequisites

- `ffmpeg` must be on `PATH` (`command -v ffmpeg`)
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
ffmpeg -y \
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

GIFs stay out of git (`e2e/recordings/` is in `.gitignore`). Upload them with
`gh pr edit --attach` (GitHub CLI 2.99.0 or later, push access required). The GIF table
goes in the PR body, not a comment.

1. Write the existing PR body plus the table below to `e2e/recordings/pr-body.md`
2. Run `gh pr edit {PR_NUMBER} --body-file e2e/recordings/pr-body.md --attach e2e/recordings/{slug}.gif`, one `--attach` per GIF (up to 50 per command)

`gh` uploads each file and rewrites its Markdown reference to a
`github.com/user-attachments/assets/{uuid}` URL. It does not rewrite HTML `<img src>` or
`<video src>`, so use Markdown image syntax.

If `ffmpeg` is unavailable, attach the `.webm` instead of a GIF: the same
`![name](./video.webm)` reference plays as a video, also inside a table cell.

See `.claude/agents/playwright-e2e-pr-updater.md` for the full workflow.

## Output Format

Return a markdown table suitable for embedding in a PR description, with paths relative to
the body file:

```markdown
| Test | Recording |
|------|-----------|
| Admin can see the BAIPropertyFilter | ![Admin can see the BAIPropertyFilter](./admin-can-see-the-baipropertyfilter.gif) |
| Admin can filter by name | ![Admin can filter by name](./admin-can-filter-by-name.gif) |
```
