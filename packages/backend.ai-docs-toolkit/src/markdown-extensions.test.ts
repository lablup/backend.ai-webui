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
import { parseShellSessionLines } from "./markdown-extensions.js";

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
