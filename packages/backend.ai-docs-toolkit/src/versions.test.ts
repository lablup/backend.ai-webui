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
  pickDisplayVersion,
  resolveVersionSource,
  VersionPageRegistry,
  type Version,
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

describe("loadVersions — 'next' label sentinel (FR-2710 F6)", () => {
  it("accepts label='next' when paired with source.kind='workspace'", () => {
    const result = loadVersions(
      makeConfig([
        { label: "26.4", source: { kind: "workspace" }, latest: true },
        { label: "next", source: { kind: "workspace" } },
      ]),
    );
    assert.equal(result.enabled, true);
    assert.equal(result.entries.length, 2);
    assert.equal(result.entries[1].label, "next");
    assert.equal(result.entries[1].outDir, "next");
    assert.equal(result.entries[1].isLatest, false);
  });

  it("rejects label='next' paired with source.kind='archive-branch'", () => {
    assert.throws(
      () =>
        loadVersions(
          makeConfig([
            { label: "26.4", source: { kind: "workspace" }, latest: true },
            {
              label: "next",
              source: { kind: "archive-branch", ref: "docs-archive/next" },
            },
          ]),
        ),
      /label "next" must use source\.kind = "workspace"/,
    );
  });

  it("still rejects other non-numeric labels (e.g., 'stable', 'preview', 'latest')", () => {
    for (const bad of ["stable", "preview", "latest", "main", "dev"]) {
      assert.throws(
        () =>
          loadVersions(
            makeConfig([
              { label: "26.4", source: { kind: "workspace" }, latest: true },
              { label: bad, source: { kind: "workspace" } },
            ]),
          ),
        /must match \^\[0-9\]\+\\\.\[0-9\]\+\$.*or be the literal "next"/,
        `expected label ${JSON.stringify(bad)} to be rejected`,
      );
    }
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

  it("declareSlug records slug presence without adding sitemap rows (FR-2754)", () => {
    // Bug 1 of FR-2754: when versions render in declared order, later
    // versions are absent from the registry while earlier ones render,
    // so the per-page `availability` map is wrong. Fix: pre-pass calls
    // declareSlug() for every (version, slug) pair before rendering.
    // declareSlug must NOT add sitemap rows — only record() does that.
    const reg = new VersionPageRegistry();
    reg.declareSlug("26.4", "index");
    reg.declareSlug("26.4", "quickstart");
    reg.declareSlug("next", "index");
    assert.equal(reg.hasSlug("26.4", "index"), true);
    assert.equal(reg.hasSlug("26.4", "quickstart"), true);
    assert.equal(reg.hasSlug("next", "index"), true);
    assert.equal(reg.hasSlug("next", "quickstart"), false);
    // Critical: declareSlug must not pollute the sitemap row stream.
    assert.equal(reg.enumerateAll().length, 0);
  });

  it("record() after declareSlug() of the same (version, slug) is idempotent", () => {
    // The pre-pass declares every slug it can find from book.config;
    // the render pass then calls record() with the full row. The set
    // membership stays the same, but the sitemap row is added exactly
    // once per call to record().
    const reg = new VersionPageRegistry();
    reg.declareSlug("26.4", "overview");
    reg.record({
      version: "26.4",
      lang: "en",
      slug: "overview",
      path: "26.4/en/overview.html",
      isLatest: true,
    });
    reg.record({
      version: "26.4",
      lang: "ko",
      slug: "overview",
      path: "26.4/ko/overview.html",
      isLatest: true,
    });
    assert.equal(reg.hasSlug("26.4", "overview"), true);
    // declareSlug added 0 rows; the two record() calls each added 1.
    assert.equal(reg.enumerateAll().length, 2);
  });
});

describe("pickDisplayVersion — FR-2754 brand version pill", () => {
  const archive26: Version = {
    label: "26.4",
    source: { kind: "archive-branch", ref: "docs-archive/26.4" },
    isLatest: true,
    outDir: "26.4",
    pdfTag: "v26.4.7",
  };
  const archive26NoTag: Version = {
    label: "26.3",
    source: { kind: "archive-branch", ref: "docs-archive/26.3" },
    isLatest: false,
    outDir: "26.3",
  };
  const workspaceNext: Version = {
    label: "next",
    source: { kind: "workspace" },
    isLatest: false,
    outDir: "next",
  };
  const ws = "v26.5.0-alpha.0 (be6c92b05)";

  it("returns the workspace version in flat (non-versioned) mode", () => {
    assert.equal(
      pickDisplayVersion({
        workspaceVersion: ws,
        versionLabel: null,
        versionEntry: null,
      }),
      ws,
    );
  });

  it("returns the workspace version for the workspace-source `next` entry", () => {
    // `next` IS the workspace tip, so the SHA is meaningful and the
    // pdfTag concept does not apply.
    assert.equal(
      pickDisplayVersion({
        workspaceVersion: ws,
        versionLabel: "next",
        versionEntry: workspaceNext,
      }),
      ws,
    );
  });

  it("returns the pdfTag for archive-branch versions when set (e.g. v26.4.7)", () => {
    // This is the user-facing fix: visiting `/26.4/...` should reveal
    // exactly which Backend.AI release the docs were cut from, not the
    // workspace version of whichever build emitted the page.
    assert.equal(
      pickDisplayVersion({
        workspaceVersion: ws,
        versionLabel: "26.4",
        versionEntry: archive26,
      }),
      "v26.4.7",
    );
  });

  it("falls back to the version label when an archive-branch entry has no pdfTag", () => {
    assert.equal(
      pickDisplayVersion({
        workspaceVersion: ws,
        versionLabel: "26.3",
        versionEntry: archive26NoTag,
      }),
      "26.3",
    );
  });

  it("returns the workspace version when versionEntry is missing (defensive)", () => {
    // If the caller couldn't resolve the entry from the label, the
    // safe fallback is the workspace version — same as flat mode.
    assert.equal(
      pickDisplayVersion({
        workspaceVersion: ws,
        versionLabel: "26.4",
        versionEntry: null,
      }),
      ws,
    );
  });
});
