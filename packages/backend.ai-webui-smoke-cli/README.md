# backend.ai-webui-smoke-cli

Post-install smoke verification CLI for Backend.AI WebUI. See
[`.specs/FR-2871-webui-smoke-cli/spec.md`](../../.specs/FR-2871-webui-smoke-cli/spec.md)
for the full spec. The operator-facing README (EN + KO) lands in FR-2883
(Phase 2).

## Usage (alpha)

```sh
bai-smoke run \
  --endpoint https://webui.example.com \
  --email admin@example.com \
  --password "***" \
  --output ./smoke-report
```

This is an alpha MVP. Full operator docs land with FR-2883.
