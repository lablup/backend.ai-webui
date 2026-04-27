/**
 * Unit tests for versions.ts (F6 / FR-2718).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *      (which executes `tsx --test src/versions.test.ts`)
 *
 * Coverage:
 *   - Single-version compatibility mode (no `versions` declared)
 *   - Validation: missing latest, multiple latest, duplicate label,
 *     bad source kind, missing archive-branch ref, patch-shaped label.
 *   - Normalization: outDir mirrors label, isLatest flag, ordering.
 *   - VersionPageRegistry: insert + lookup + enumerate.
 *   - canonicalPathFor: flat vs versioned.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import {
  loadVersions,
  findLatest,
  canonicalPathFor,
  resolveVersionSource,
  VersionPageRegistry,
} from "./versions.js";
import type { ResolvedDocConfig, VersionEntry } from "./config.js";

function makeConfig(versions: VersionEntry[] | undefined): ResolvedDocConfig {
  return {
    title: "t",
    subtitle: "s",
    company: "c",
    logoPath: null,
    logoFallbackHtml: "",
    projectRoot: path.resolve("/tmp/fake-project-root"),
    srcDir: path.resolve("/tmp/fake-project-root/src"),
    distDir: path.resolve("/tmp/fake-project-root/dist"),
    versionSource: "",
    version: null,
    languageLabels: { en: "English" },
    localizedStrings: {
      en: { userGuide: "User Guide", tableOfContents: "TOC" },
    },
    admonitionTitles: { en: { note: "NOTE" } },
    figureLabels: { en: "Figure" },
    pdfFilenameTemplate: "{title}.pdf",
    pdfMetadata: { author: "a", subject: "b", creator: "c" },
    cjkFontPaths: [],
    pathFallbacks: {},
    productName: "p",
    versions,
    // FR-2726: ResolvedDocConfig now also requires `code` and `branding`.
    // Use the toolkit's bundled defaults so this fixture stays minimal.
    code: { lightTheme: "github-light" },
    branding: {
      primaryColor: "#FF7A00",
      primaryColorHover: "#FF9729",
      primaryColorActive: "#E65C00",
      primaryColorSoft: "#FFF4E5",
      logoLight: null,
      logoDark: null,
      subLabel: {},
    },
  } satisfies ResolvedDocConfig;
}

describe("loadVersions — single-version compatibility mode", () => {
  it("returns enabled=false when versions is undefined", () => {
    const result = loadVersions(makeConfig(undefined));
    assert.equal(result.enabled, false);
    assert.deepEqual(result.entries, []);
    assert.equal(result.latest, null);
  });

  it("returns enabled=false when versions is an empty array", () => {
    const result = loadVersions(makeConfig([]));
    assert.equal(result.enabled, false);
  });
});

describe("loadVersions — happy path", () => {
  it("normalizes a workspace-only single-entry config", () => {
    const result = loadVersions(
      makeConfig([
        { label: "25.16", source: { kind: "workspace" }, latest: true },
      ]),
    );
    assert.equal(result.enabled, true);
    assert.equal(result.entries.length, 1);
    assert.equal(result.entries[0].label, "25.16");
    assert.equal(result.entries[0].outDir, "25.16");
    assert.equal(result.entries[0].isLatest, true);
    assert.equal(findLatest(result).label, "25.16");
  });

  it("preserves declared order and marks one as latest", () => {
    const result = loadVersions(
      makeConfig([
        { label: "25.16", source: { kind: "workspace" }, latest: true },
        {
          label: "25.10",
          source: { kind: "archive-branch", ref: "docs-archive/25.10" },
        },
      ]),
    );
    assert.equal(result.enabled, true);
    assert.deepEqual(
      result.entries.map((v) => v.label),
      ["25.16", "25.10"],
    );
    assert.equal(result.entries[0].isLatest, true);
    assert.equal(result.entries[1].isLatest, false);
  });
});

describe("loadVersions — validation failures", () => {
  it("throws when no entry is marked latest", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([{ label: "25.16", source: { kind: "workspace" } }]),
        ),
      /exactly one .*latest: true/,
    );
  });

  it("throws when multiple entries are marked latest", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            { label: "25.16", source: { kind: "workspace" }, latest: true },
            { label: "25.10", source: { kind: "workspace" }, latest: true },
          ]),
        ),
      /exactly one .*latest: true/,
    );
  });

  it("throws on duplicate labels", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            { label: "25.16", source: { kind: "workspace" }, latest: true },
            { label: "25.16", source: { kind: "workspace" } },
          ]),
        ),
      /duplicates an earlier entry/,
    );
  });

  it("rejects patch-shaped labels (the selector lists minors only)", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            { label: "25.16.5", source: { kind: "workspace" }, latest: true },
          ]),
        ),
      /must match \^\[0-9\]\+\\\.\[0-9\]\+\$/,
    );
  });

  it("rejects labels with non-numeric segments (matches GH workflow regex)", () => {
    for (const bad of ["25.16-rc1", "v25.16", "25.16/x", "latest", "25"]) {
      assert.throws(
        () =>
          loadVersions(
            makeConfig([
              { label: bad, source: { kind: "workspace" }, latest: true },
            ]),
          ),
        /must match \^\[0-9\]\+\\\.\[0-9\]\+\$/,
        `expected ${bad} to be rejected`,
      );
    }
  });

  it("rejects unknown source.kind", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            // Bypass the type check to simulate a malformed YAML config.
            {
              label: "25.16",
              source: { kind: "http" as "workspace" },
              latest: true,
            },
          ]),
        ),
      /must be "workspace" or "archive-branch"/,
    );
  });

  it("requires source.ref when kind is archive-branch", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            {
              label: "25.16",
              source: { kind: "archive-branch", ref: "" },
              latest: true,
            },
          ]),
        ),
      /source\.ref.* required/,
    );
  });

  it("rejects empty label", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            { label: "", source: { kind: "workspace" }, latest: true },
          ]),
        ),
      /must be a non-empty string/,
    );
  });
});

describe("loadVersions — pdfTag validation (FR-2731)", () => {
  it("accepts a well-formed pdfTag and exposes it on the runtime entry", () => {
    const result = loadVersions(
      makeConfig([
        {
          label: "26.4",
          source: { kind: "workspace" },
          latest: true,
          pdfTag: "v26.4.7",
        },
      ]),
    );
    assert.equal(result.enabled, true);
    assert.equal(result.entries[0].pdfTag, "v26.4.7");
  });

  it("treats absent pdfTag as no value at runtime (no defaults)", () => {
    const result = loadVersions(
      makeConfig([
        { label: "26.4", source: { kind: "workspace" }, latest: true },
      ]),
    );
    // Must be missing entirely — not coerced to null or empty string.
    assert.equal(result.entries[0].pdfTag, undefined);
    assert.equal("pdfTag" in result.entries[0], false);
  });

  it("rejects a tag missing the leading 'v'", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            {
              label: "26.4",
              source: { kind: "workspace" },
              latest: true,
              pdfTag: "26.4.7",
            },
          ]),
        ),
      /pdfTag.*must match \^v\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$/,
    );
  });

  it("rejects a tag missing the patch component", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            {
              label: "26.4",
              source: { kind: "workspace" },
              latest: true,
              pdfTag: "v26.4",
            },
          ]),
        ),
      /pdfTag.*must match \^v\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$/,
    );
  });

  it("rejects assorted malformed pdfTag shapes", () => {
    for (const bad of [
      "v26",
      "v26.4.7-rc1",
      "26.4.7v",
      "vv26.4.7",
      "v26.4.7.0",
      "release-26.4.7",
      "",
    ]) {
      assert.throws(
        () =>
          loadVersions(
            makeConfig([
              {
                label: "26.4",
                source: { kind: "workspace" },
                latest: true,
                pdfTag: bad,
              },
            ]),
          ),
        /pdfTag/,
        `expected pdfTag ${JSON.stringify(bad)} to be rejected`,
      );
    }
  });

  it("error messages name the offending entry index", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            { label: "26.4", source: { kind: "workspace" }, latest: true },
            {
              label: "25.16",
              source: { kind: "archive-branch", ref: "docs-archive/25.16" },
              pdfTag: "25.16.5",
            },
          ]),
        ),
      /versions\[1\]\.pdfTag/,
    );
  });

  it("preserves pdfTag presence per entry in a mixed multi-entry config", () => {
    const result = loadVersions(
      makeConfig([
        {
          label: "26.4",
          source: { kind: "workspace" },
          latest: true,
          pdfTag: "v26.4.7",
        },
        { label: "26.3", source: { kind: "workspace" } },
      ]),
    );
    // Entry with pdfTag carries the value
    assert.equal(result.entries[0].pdfTag, "v26.4.7");
    assert.equal("pdfTag" in result.entries[0], true);
    // Entry without pdfTag has the key omitted entirely
    assert.equal(result.entries[1].pdfTag, undefined);
    assert.equal("pdfTag" in result.entries[1], false);
  });
});

describe("canonicalPathFor", () => {
  it("returns flat layout when versions are not enabled", () => {
    const loaded = loadVersions(makeConfig(undefined));
    assert.equal(
      canonicalPathFor(loaded, "en", "session-page"),
      "en/session-page.html",
    );
  });

  it("returns latest-prefixed path when versions are enabled", () => {
    const loaded = loadVersions(
      makeConfig([
        { label: "25.16", source: { kind: "workspace" }, latest: true },
        {
          label: "25.10",
          source: { kind: "archive-branch", ref: "docs-archive/25.10" },
        },
      ]),
    );
    assert.equal(
      canonicalPathFor(loaded, "ko", "vfolder"),
      "25.16/ko/vfolder.html",
    );
  });
});

describe("resolveVersionSource — archive-branch ref safety", () => {
  it("rejects refs that contain `..` segments", () => {
    const config = makeConfig([
      { label: "25.16", source: { kind: "workspace" }, latest: true },
    ]);
    assert.throws(
      () =>
        resolveVersionSource(config, {
          label: "25.10",
          source: { kind: "archive-branch", ref: "../../etc/passwd" },
          isLatest: false,
          outDir: "25.10",
        }),
      /contains unsafe segments/,
    );
  });

  it("rejects refs with a leading slash", () => {
    const config = makeConfig([
      { label: "25.16", source: { kind: "workspace" }, latest: true },
    ]);
    assert.throws(
      () =>
        resolveVersionSource(config, {
          label: "25.10",
          source: { kind: "archive-branch", ref: "/etc/passwd" },
          isLatest: false,
          outDir: "25.10",
        }),
      /contains unsafe segments/,
    );
  });

  it("rejects refs with a leading dot", () => {
    const config = makeConfig([
      { label: "25.16", source: { kind: "workspace" }, latest: true },
    ]);
    assert.throws(
      () =>
        resolveVersionSource(config, {
          label: "25.10",
          source: { kind: "archive-branch", ref: ".hidden" },
          isLatest: false,
          outDir: "25.10",
        }),
      /contains unsafe segments/,
    );
  });

  it("accepts a normal docs-archive ref", () => {
    const config = makeConfig([
      { label: "25.16", source: { kind: "workspace" }, latest: true },
    ]);
    // Won't materialize on disk but must not throw — should return ok=false
    // with a "not materialized" warning rather than a security error.
    const result = resolveVersionSource(config, {
      label: "25.10",
      source: { kind: "archive-branch", ref: "docs-archive/25.10" },
      isLatest: false,
      outDir: "25.10",
    });
    assert.equal(result.ok, false);
    assert.match(result.warning ?? "", /not materialized/);
  });
});

describe("VersionPageRegistry", () => {
  it("records and looks up slugs per version", () => {
    const reg = new VersionPageRegistry();
    reg.record({
      version: "25.16",
      lang: "en",
      slug: "overview",
      path: "25.16/en/overview.html",
      isLatest: true,
    });
    reg.record({
      version: "25.10",
      lang: "en",
      slug: "overview",
      path: "25.10/en/overview.html",
      isLatest: false,
    });
    reg.record({
      version: "25.16",
      lang: "en",
      slug: "rbac",
      path: "25.16/en/rbac.html",
      isLatest: true,
    });
    assert.equal(reg.hasSlug("25.16", "overview"), true);
    assert.equal(reg.hasSlug("25.16", "rbac"), true);
    assert.equal(reg.hasSlug("25.10", "overview"), true);
    // rbac introduced in 25.16 only — does not exist in 25.10.
    assert.equal(reg.hasSlug("25.10", "rbac"), false);
    // Unknown version → never has the slug.
    assert.equal(reg.hasSlug("25.05", "overview"), false);
    assert.equal(reg.enumerateAll().length, 3);
  });
});
