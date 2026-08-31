/**
 * Tests for the WEBUIHelpButton manual-anchor checker (FR-3773).
 *
 * Two things are worth pinning. First, PARITY: the checker replicates the
 * docs-toolkit's slug rules rather than importing them (the toolkit is
 * TypeScript with no build output here, so the plain-`node` checker cannot
 * load it). Vitest can, so the "parity with the docs toolkit source" suite
 * imports the canonical functions from the toolkit's TypeScript and compares
 * every port against them over every heading and navigation path of the
 * English manual — drift in either copy fails the suite, which the
 * hard-coded cases alone (both sides being the same copy) could not catch.
 * Second, RESOLUTION: a deliberately broken entry must be reported.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  slugify,
  slugFromNavPath,
  headingPlainText,
  headingId,
  collectAnchorIds,
  readNavigationPaths,
  buildManualIndex,
  checkEntries,
  stripHtmlTags,
  decodeHtmlEntities,
  // @ts-expect-error -- plain-JS ESM checker, no type declarations
} from "./check-help-anchors.mjs";
import {
  decodeHtmlEntities as toolkitDecodeHtmlEntities,
  escapeHtml as toolkitEscapeHtml,
  stripHtmlTags as toolkitStripHtmlTags,
} from "../packages/backend.ai-docs-toolkit/src/markdown-extensions";
import {
  slugFromNavPath as toolkitSlugFromNavPath,
  slugify as toolkitSlugify,
} from "../packages/backend.ai-docs-toolkit/src/markdown-processor";

const DOCS_SRC = fileURLToPath(
  new URL("../packages/backend.ai-webui-docs/src/", import.meta.url),
);

/**
 * Every ATX / setext heading line of one markdown file, raw (marker and
 * inline syntax intact), skipping front matter and fenced code.
 */
function rawHeadings(markdown: string): string[] {
  const headings: string[] = [];
  let inFence = false;
  let fenceMarker = "";
  let inFrontMatter = false;
  let previousLine = "";
  markdown.split(/\r?\n/).forEach((line, index) => {
    if (index === 0 && line.trim() === "---") {
      inFrontMatter = true;
      return;
    }
    if (inFrontMatter) {
      if (line.trim() === "---") inFrontMatter = false;
      return;
    }
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence[1][0];
      } else if (fence[1][0] === fenceMarker) {
        inFence = false;
      }
      previousLine = "";
      return;
    }
    if (inFence) {
      previousLine = "";
      return;
    }
    if (/^#{1,6}\s+\S/.test(line)) {
      headings.push(line);
    } else if (
      /^ {0,3}(=+|-+) *$/.test(line) &&
      previousLine.trim() !== "" &&
      !/^ {0,3}(#|>|[-*+] |\d+[.)] |\|)/.test(previousLine)
    ) {
      headings.push(previousLine.trim());
    }
    previousLine = line;
  });
  return headings;
}

/** The English manual's navigation paths and every heading they contain. */
function readManualCorpus() {
  const navPaths: string[] = readNavigationPaths(
    readFileSync(`${DOCS_SRC}book.config.yaml`, "utf8"),
    "en",
  );
  const headings = navPaths.flatMap((navPath) =>
    rawHeadings(readFileSync(`${DOCS_SRC}en/${navPath}`, "utf8")),
  );
  return { navPaths, headings };
}

/** Inputs on which the two sides disagree, so a failure names every drift. */
function disagreements<T>(
  inputs: readonly T[],
  ours: (input: T) => unknown,
  theirs: (input: T) => unknown,
) {
  return inputs
    .map((input) => ({ input, checker: ours(input), toolkit: theirs(input) }))
    .filter(({ checker, toolkit }) => checker !== toolkit);
}

type Str = (s: string) => string;
const headingIdPipeline =
  (strip: Str, decode: Str, slug: Str) => (raw: string) =>
    slug(decode(strip(raw)));

describe("slugify parity with the docs toolkit", () => {
  it.each([
    ["Admin Features", "admin-features"],
    ["Manage user's keypairs", "manage-users-keypairs"],
    ["List & filter", "list-filter"],
    ["Fair share scheduler", "fair-share-scheduler"],
    ["Prometheus query presets", "prometheus-query-presets"],
  ])("slugifies %j to %j", (text, expected) => {
    expect(slugify(text)).toBe(expected);
  });
});

describe("parity with the docs toolkit source", () => {
  const { navPaths, headings } = readManualCorpus();
  const texts = headings.map((raw) => headingPlainText(raw));
  // The form marked hands to the renderer (its escaper also turns `'` into
  // `&#39;`), so the entity-decoding branch is exercised on real input.
  const escaped = headings.map((raw) =>
    toolkitEscapeHtml(raw).replace(/'/g, "&#39;"),
  );

  it("reads a corpus large enough to mean something", () => {
    expect(navPaths.length).toBeGreaterThan(20);
    expect(headings.length).toBeGreaterThan(100);
    expect(escaped.some((raw) => raw.includes("&#39;"))).toBe(true);
    expect(escaped.some((raw) => raw.includes("&amp;"))).toBe(true);
  });

  it("slugify matches the toolkit on every manual heading", () => {
    expect(disagreements(texts, slugify, toolkitSlugify)).toEqual([]);
    expect(disagreements(headings, slugify, toolkitSlugify)).toEqual([]);
  });

  it("stripHtmlTags matches the toolkit on every raw heading", () => {
    expect(
      disagreements(headings, stripHtmlTags, toolkitStripHtmlTags),
    ).toEqual([]);
  });

  it("decodeHtmlEntities matches the toolkit on every escaped heading", () => {
    expect(
      disagreements(
        [...headings, ...escaped],
        decodeHtmlEntities,
        toolkitDecodeHtmlEntities,
      ),
    ).toEqual([]);
  });

  it("the whole heading-id pipeline matches the toolkit's composition", () => {
    expect(
      disagreements(
        [...headings, ...escaped],
        headingIdPipeline(stripHtmlTags, decodeHtmlEntities, slugify),
        headingIdPipeline(
          toolkitStripHtmlTags,
          toolkitDecodeHtmlEntities,
          toolkitSlugify,
        ),
      ),
    ).toEqual([]);
  });

  it("slugFromNavPath matches the toolkit on every navigation path", () => {
    expect(
      disagreements(navPaths, slugFromNavPath, toolkitSlugFromNavPath),
    ).toEqual([]);
  });

  it("slugFromNavPath rejects the same inputs as the toolkit", () => {
    for (const bad of ["한글.md", "---.md", "___.md"]) {
      expect(() => slugFromNavPath(bad)).toThrow(/Cannot derive a slug/);
      expect(() => toolkitSlugFromNavPath(bad)).toThrow(/Cannot derive a slug/);
    }
  });
});

describe("slugFromNavPath", () => {
  it("keeps underscores so admin_menu.md stays admin_menu", () => {
    expect(slugFromNavPath("admin_menu/admin_menu.md")).toBe("admin_menu");
  });

  it("uses the leaf basename, not the folder", () => {
    expect(slugFromNavPath("user_settings/user_settings.md")).toBe(
      "user_settings",
    );
    expect(slugFromNavPath("quickstart.md")).toBe("quickstart");
  });

  it("collapses runs of dashes, including ones a dropped char produced", () => {
    expect(slugFromNavPath("foo--bar.md")).toBe("foo-bar");
    expect(slugFromNavPath("foo -bar.md")).toBe("foo-bar");
    expect(slugFromNavPath("Foo Bar.md")).toBe("foo-bar");
    expect(slugFromNavPath("-lead-.md")).toBe("lead");
  });

  it("refuses a basename that sanitizes to nothing", () => {
    expect(() => slugFromNavPath("한글.md")).toThrow(/Cannot derive a slug/);
  });
});

describe("headingPlainText", () => {
  it("decodes the escaped apostrophe instead of leaving user39s", () => {
    // The dead anchor this checker was written to catch.
    expect(headingId("admin_menu", "## Manage user's keypairs")).toBe(
      "admin_menu-manage-users-keypairs",
    );
  });

  it("unwraps link syntax so the URL never reaches the slug", () => {
    expect(headingPlainText("## See [the manual](https://example.com/x)")).toBe(
      "See the manual",
    );
  });

  it("leaves inline markers for slugify to strip", () => {
    // marked drops them as tags, slugify drops them as punctuation — same id.
    expect(headingId("deployment", "#### A (`config.yaml`) note")).toBe(
      "deployment-a-configyaml-note",
    );
    expect(headingId("admin_menu", "### List & filter")).toBe(
      "admin_menu-list-filter",
    );
  });
});

describe("parity against real manual headings", () => {
  const index = buildManualIndex();

  it.each([
    ["admin_menu.html", "admin_menu-manage-users-keypairs"],
    ["admin_menu.html", "admin_menu-list-filter"],
    [
      "deployment.html",
      "deployment-pre-configuring-a-deployment-deployment-configyaml",
    ],
    ["project_admin.html", "project_admin-users"],
  ])("indexes %s#%s", (page, anchor) => {
    expect(index.get(page as string)?.anchors.has(anchor as string)).toBe(true);
  });
});

describe("collectAnchorIds", () => {
  const markdown = [
    "---",
    "navTitle: Admin Features",
    "---",
    "",
    '<a id="admin-menus"></a>',
    "",
    "# Admin Features",
    "",
    "```bash",
    "# not a heading",
    "```",
    "",
    "## Manage user's keypairs",
  ].join("\n");

  it("indexes headings, chapter-prefixed", () => {
    const ids = collectAnchorIds(markdown, "admin_menu");
    expect(ids.has("admin_menu-admin-features")).toBe(true);
    expect(ids.has("admin_menu-manage-users-keypairs")).toBe(true);
  });

  it("indexes explicit <a id> markers verbatim", () => {
    expect(collectAnchorIds(markdown, "admin_menu").has("admin-menus")).toBe(
      true,
    );
  });

  it("ignores comment lines inside fenced code blocks", () => {
    expect(
      collectAnchorIds(markdown, "admin_menu").has("admin_menu-not-a-heading"),
    ).toBe(false);
  });

  it("indexes setext headings, which the web build also gives ids", () => {
    const setext = [
      "Underlined title",
      "================",
      "",
      "Underlined section",
      "------------------",
      "",
      "| a | b |",
      "|---|---|",
    ].join("\n");
    const ids = collectAnchorIds(setext, "admin_menu");
    expect(ids.has("admin_menu-underlined-title")).toBe(true);
    expect(ids.has("admin_menu-underlined-section")).toBe(true);
    expect(ids.has("admin_menu-a-b")).toBe(false);
  });
});

describe("readNavigationPaths", () => {
  const yaml = [
    "navigation:",
    "  en:",
    "    - category: Getting Started",
    "      items:",
    "        - path: quickstart.md",
    "        - path: admin_menu/admin_menu.md",
    "  ko:",
    "    - category: 시작하기",
    "      items:",
    "        - path: quickstart.md",
  ].join("\n");

  it("reads only the requested language block", () => {
    expect(readNavigationPaths(yaml, "en")).toEqual([
      "quickstart.md",
      "admin_menu/admin_menu.md",
    ]);
  });

  it("returns nothing for an absent language", () => {
    expect(readNavigationPaths(yaml, "de")).toEqual([]);
  });
});

describe("checkEntries", () => {
  const index = buildManualIndex();

  it("resolves every shipped help-anchor entry", () => {
    const { entries } = JSON.parse(
      readFileSync(
        fileURLToPath(
          new URL("../react/src/helper/helpAnchors.json", import.meta.url),
        ),
        "utf8",
      ),
    );
    expect(checkEntries(entries, index)).toEqual([]);
  });

  it("reports an anchor that no longer exists", () => {
    const problems = checkEntries(
      [
        {
          path: "credential",
          tab: "credentials",
          docPage: "admin_menu.html",
          anchor: "admin_menu-manage-user39s-keypairs",
        },
      ],
      index,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].type).toBe("missing-anchor");
    expect(problems[0].message).toContain("admin_menu-manage-user39s-keypairs");
  });

  it("reports a docPage that maps to no manual source", () => {
    const problems = checkEntries(
      [{ path: "ghost", docPage: "no_such_page.html" }],
      index,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].type).toBe("missing-page");
  });

  it("accepts an entry with no anchor once the page exists", () => {
    expect(
      checkEntries([{ path: "rbac", docPage: "rbac_management.html" }], index),
    ).toEqual([]);
  });
});
