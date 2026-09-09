# Context Map

The Web UI is one application with several bounded contexts. Only the ones that
have been modeled explicitly are listed; add a context here when its glossary is
written.

## Contexts

- [Dev review overlay](./react/vite-plugins/review-overlay/CONTEXT.md) — the
  dev-server-only tool a reviewer uses to pin an element, write a note about
  it, and hand the result to a PR comment, a Teams thread or a Claude prompt.

## Relationships

- **Dev review overlay → PR review loop**: the overlay writes blocks and links;
  the `fw` plugin's `pr-review-thread-resolver` skill (claude-mp) reads them
  through the overlay's own codec, run from a Web UI checkout.
