import { test } from "node:test";
import assert from "node:assert/strict";

import { defaultTheme, loadTheme, resolveHeaderFooter } from "./theme.js";

test("loadTheme — returns the default theme when name is omitted", () => {
  const theme = loadTheme();
  assert.equal(theme.name, "default");
  assert.equal(theme, defaultTheme);
});

test("loadTheme — returns the default theme when name is 'default'", () => {
  const theme = loadTheme("default");
  assert.equal(theme.name, "default");
});

test("loadTheme — returns the default theme (with warning) for an unknown name", (t) => {
  let warned = "";
  t.mock.method(console, "warn", (msg: string) => {
    warned = msg;
  });
  const theme = loadTheme("does-not-exist");
  assert.equal(theme.name, "default");
  assert.match(warned, /not found/i);
});

test("defaultTheme — exposes every required PdfTheme field as a non-empty string", () => {
  // Cheap snapshot: nothing should be undefined / empty. Catches accidental
  // typos when a new field is added to the PdfTheme interface but missed in
  // defaultTheme.
  for (const [key, value] of Object.entries(defaultTheme)) {
    assert.equal(typeof value, "string", `field ${key} should be a string`);
    assert.notEqual(value, "", `field ${key} should be non-empty`);
  }
});

test("resolveHeaderFooter — substitutes {{TITLE}} in headerHtml", () => {
  const out = resolveHeaderFooter(defaultTheme, "My Documentation");
  assert.ok(out.headerHtml.includes("My Documentation"));
  assert.ok(!out.headerHtml.includes("{{TITLE}}"));
});

test("resolveHeaderFooter — leaves footerHtml unchanged (no title placeholder there)", () => {
  const out = resolveHeaderFooter(defaultTheme, "Anything");
  assert.equal(out.footerHtml, defaultTheme.footerHtml);
});

test("resolveHeaderFooter — replaces every occurrence of {{TITLE}}", () => {
  const themeWithMultipleTitles = {
    ...defaultTheme,
    headerHtml: "<a>{{TITLE}}</a><b>{{TITLE}}</b>",
  };
  const out = resolveHeaderFooter(themeWithMultipleTitles, "T");
  assert.equal(out.headerHtml, "<a>T</a><b>T</b>");
});
