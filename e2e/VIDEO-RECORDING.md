# E2E Test Video Recording

## Overview

`playwright-video.config.ts` extends the base Playwright config to enable video recording for E2E tests. This is used to capture test runs as videos, which can then be converted to GIFs for PR documentation.

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `video` | `retain-on-failure` (default) | Records video only for failed tests |
| `video` | `on` (with `PLAYWRIGHT_VIDEO=on`) | Records video for all tests |
| `workers` | `1` | Single worker for deterministic, sequential recordings |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PLAYWRIGHT_VIDEO` | (unset) | Set to `on` to record all tests. Otherwise only failed tests are recorded. |

## Usage

### Record all tests with video

```bash
PLAYWRIGHT_VIDEO=on pnpm exec playwright test --config=playwright-video.config.ts
```

### Record specific test file

```bash
PLAYWRIGHT_VIDEO=on pnpm exec playwright test e2e/auth/login.spec.ts --config=playwright-video.config.ts
```

### Record only failed tests (default)

```bash
pnpm exec playwright test --config=playwright-video.config.ts
```

## Output Directory

Videos are saved by Playwright to the `test-results/` directory:

```
test-results/
├── auth-login-User-can-login-with-valid-credentials-chromium/
│   └── video.webm
├── auth-login-User-sees-error-on-invalid-password-chromium/
│   └── video.webm
└── ...
```

Each test gets its own subdirectory named as `{spec-dir}-{describe}-{test-name}-{project}/`.

## Converting to GIF

Use `ffmpeg` to convert `.webm` videos to optimized GIFs:

```bash
ffmpeg -y -i input.webm \
  -vf "fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 output.gif
```

For large GIFs (>10MB), reduce quality:

```bash
ffmpeg -y -i input.webm \
  -vf "fps=5,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 output.gif
```

## Integration with `/e2e-test record`

The `/e2e-test record` command automatically uses this config to record tests and attach GIFs to PRs. See the [e2e-test command documentation](https://github.com/lablup/claude-mp) for details.
