# About

This package serves two purposes inside the `backend.ai-webui` monorepo:

1. **Boilerplate** — a copy-paste starter project for developers who want
   to use `backend.ai-docs-toolkit` for their own documentation. Trim or
   extend it as you like; the structure is intentionally minimal.
2. **Test fixture** — the toolkit's integration tests build this package
   and assert against the rendered web site and PDFs. Keeping the fixture
   inside the same repo means a toolkit change that breaks the example
   surfaces immediately, not on the next downstream consumer's deploy.

> [!NOTE]
> The Korean (`ko`) content here is intentionally short and exists to
> exercise the CJK font code path in the PDF pipeline. It is not a
> translation review of any product.

## License

Licensed under LGPL-3.0-or-later, same as the rest of the repository.

## Where the real toolkit lives

- Source: `packages/backend.ai-docs-toolkit/`
- Architecture notes: `packages/backend.ai-docs-toolkit/ARCHITECTURE.md`
- Real-world consumer: `packages/backend.ai-webui-docs/` (Backend.AI WebUI
  user manual — large, multi-version, four languages)
