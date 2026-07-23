/**
 * Unit tests for markdown-extensions helpers (FR-2756 / FR-2755).
 *
 * Run with: `pnpm test` (uses tsx --test).
 *
 * Focus: parseShellSessionLines — the parser that converts a fenced
 * `shellsession` / `console` block into command vs output rows for the
 * web and PDF processors. Edge cases: prompt vs no prompt, mixed lines,
 * `#` root prompt, blank lines, trailing newline trimming.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseShellSessionLines,
  decodeHtmlEntities,
  stripHtmlTags,
  parseFrontmatter,
  frontmatterString,
} from "./markdown-extensions.js";

test("parseShellSessionLines — empty input yields no rows", () => {
  assert.deepEqual(parseShellSessionLines(""), []);
  assert.deepEqual(parseShellSessionLines("\n"), []);
});

test("parseShellSessionLines — single $-prompt command strips the prompt", () => {
  assert.deepEqual(parseShellSessionLines("$ ls -la"), [
    { type: "cmd", prompt: "$", text: "ls -la" },
  ]);
});

test("parseShellSessionLines — # is treated as a root prompt", () => {
  assert.deepEqual(parseShellSessionLines("# apt-get update"), [
    { type: "cmd", prompt: "#", text: "apt-get update" },
  ]);
});

test("parseShellSessionLines — interleaves cmd + output rows", () => {
  const transcript = [
    "$ echo hello",
    "hello",
    "$ uname",
    "Linux",
  ].join("\n");
  assert.deepEqual(parseShellSessionLines(transcript), [
    { type: "cmd", prompt: "$", text: "echo hello" },
    { type: "output", text: "hello" },
    { type: "cmd", prompt: "$", text: "uname" },
    { type: "output", text: "Linux" },
  ]);
});

test("parseShellSessionLines — preserves blank output lines as separators", () => {
  const transcript = ["$ pwd", "/home/user", "", "$ id"].join("\n");
  assert.deepEqual(parseShellSessionLines(transcript), [
    { type: "cmd", prompt: "$", text: "pwd" },
    { type: "output", text: "/home/user" },
    { type: "output", text: "" },
    { type: "cmd", prompt: "$", text: "id" },
  ]);
});

test("parseShellSessionLines — drops a single trailing newline", () => {
  // The marked lexer hands code blocks WITH the trailing newline preserved;
  // the parser must not produce a phantom empty output row at the bottom.
  const transcript = "$ ls\nfile.txt\n";
  assert.deepEqual(parseShellSessionLines(transcript), [
    { type: "cmd", prompt: "$", text: "ls" },
    { type: "output", text: "file.txt" },
  ]);
});

test("parseShellSessionLines — prompt requires whitespace after the symbol", () => {
  // `$variable` is not a prompt — it's a parameter expansion in a command
  // and must be classified as output (or, more precisely, as a non-prompt
  // line). Otherwise we'd silently rewrite shell expansions.
  assert.deepEqual(parseShellSessionLines("$variable=42"), [
    { type: "output", text: "$variable=42" },
  ]);
});

test("parseShellSessionLines — tolerates tab after the prompt", () => {
  assert.deepEqual(parseShellSessionLines("$\techo tabbed"), [
    { type: "cmd", prompt: "$", text: "echo tabbed" },
  ]);
});

test("parseShellSessionLines — multi-space prompts still work", () => {
  assert.deepEqual(parseShellSessionLines("$    ls"), [
    { type: "cmd", prompt: "$", text: "ls" },
  ]);
});

test("parseShellSessionLines — output containing $ mid-line stays as output", () => {
  assert.deepEqual(parseShellSessionLines("error: cannot expand $HOME"), [
    { type: "output", text: "error: cannot expand $HOME" },
  ]);
});

test("decodeHtmlEntities — decodes the entities marked emits", () => {
  assert.equal(
    decodeHtmlEntities("Manage User&#39;s Keypairs"),
    "Manage User's Keypairs",
  );
  assert.equal(decodeHtmlEntities("a &amp; b"), "a & b");
  assert.equal(
    decodeHtmlEntities("&lt;tag&gt; &quot;x&quot; &#x27;y&#x27; &apos;z&apos;"),
    "<tag> \"x\" 'y' 'z'",
  );
});

test("decodeHtmlEntities — collapses double encoding one level (amp last)", () => {
  // A literal, single-encoded "&#39;" must survive rather than becoming "'".
  assert.equal(decodeHtmlEntities("&amp;#39;"), "&#39;");
});

test("decodeHtmlEntities — leaves plain text and invalid refs untouched", () => {
  assert.equal(decodeHtmlEntities("no entities here"), "no entities here");
  assert.equal(decodeHtmlEntities("100% & rising"), "100% & rising");
});

test("decodeHtmlEntities — recovers a clean slug source for escaped apostrophes", () => {
  // Regression guard: without decoding, `stripHtmlTags` leaves `&#39;`,
  // which slugify turns into the broken `user39s` anchor. Decoding first
  // yields the plain apostrophe that slugify then drops → `User's` → `users`.
  const rendered = "Manage User&#39;s Keypairs";
  const plain = decodeHtmlEntities(stripHtmlTags(rendered));
  assert.equal(plain, "Manage User's Keypairs");
  assert.ok(!/\d9s/.test(plain), "must not contain entity-derived digits");
});

test("parseFrontmatter — no frontmatter returns input untouched", () => {
  const md = "# Title\n\nBody.\n";
  assert.deepEqual(parseFrontmatter(md), { attributes: {}, body: md });
  // A --- later in the file is a horizontal rule, not frontmatter.
  const hr = "# Title\n\n---\n\nBody.\n";
  assert.deepEqual(parseFrontmatter(hr), { attributes: {}, body: hr });
});

test("parseFrontmatter — extracts navTitle and strips the block", () => {
  const md = "---\nnavTitle: Storage Folders\n---\n\n# Handling Data & Storage Folders\n";
  const { attributes, body } = parseFrontmatter(md);
  assert.equal(attributes.navTitle, "Storage Folders");
  assert.equal(body, "\n# Handling Data & Storage Folders\n");
});

test("parseFrontmatter — empty block strips cleanly with no attributes", () => {
  const { attributes, body } = parseFrontmatter("---\n\n---\n# T\n");
  assert.deepEqual(attributes, {});
  assert.equal(body, "# T\n");
});

test("parseFrontmatter — unterminated or malformed YAML leaves input visible", () => {
  const unterminated = "---\nnavTitle: X\n# T\n";
  assert.deepEqual(parseFrontmatter(unterminated), {
    attributes: {},
    body: unterminated,
  });
  const malformed = "---\nnavTitle: [unclosed\n---\n# T\n";
  assert.deepEqual(parseFrontmatter(malformed), {
    attributes: {},
    body: malformed,
  });
});

test("frontmatterString — string coercion rules", () => {
  assert.equal(frontmatterString({ navTitle: " Top Bar " }, "navTitle"), "Top Bar");
  assert.equal(frontmatterString({ navTitle: "" }, "navTitle"), undefined);
  assert.equal(frontmatterString({ navTitle: 42 }, "navTitle"), undefined);
  assert.equal(frontmatterString({}, "navTitle"), undefined);
});
