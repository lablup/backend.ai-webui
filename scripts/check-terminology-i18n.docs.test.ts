/**
 * Tests for the docs-prose source of the deterministic terminology checker
 * (FR-3373).
 *
 * The i18n side of CHECK 1 is covered by the data-precision harness
 * (`check-terminology-i18n.selftest.mjs`). What is new here — and what these
 * tests pin — is the markdown reader that turns the user manual into CHECK 1
 * leaves, plus the two rules that keep the docs gate high-signal:
 *
 *   1. non-prose markdown (code, link targets, comments, front matter) never
 *      reaches the matcher, and
 *   2. docs prose sees CONTEXT-FREE avoid rows only.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const {
  listMarkdownFiles,
  maskMarkdownNonProse,
  collectMarkdownLines,
  buildApprovedCompounds,
  runCheck1,
} = await import("./check-terminology-i18n.mjs");

type Leaf = { key: string; segment: string; value: string; raw: string };

/** Collect the prose leaves of a markdown document. */
const prose = (md: string, relPath = "page.md"): Leaf[] => {
  const out: Leaf[] = [];
  collectMarkdownLines(md, relPath, out);
  return out;
};

/** The matched (unmasked) text of every leaf, for terse assertions. */
const values = (leaves: Leaf[]) => leaves.map((l) => l.value.trim());

describe("maskMarkdownNonProse", () => {
  it("blanks inline code but keeps the surrounding prose", () => {
    const masked = maskMarkdownNonProse("Set `scaling group` in the panel.");
    expect(masked).not.toContain("scaling group");
    expect(masked).toContain("Set");
    expect(masked).toContain("in the panel.");
  });

  it("blanks link targets but keeps the link text", () => {
    const masked = maskMarkdownNonProse(
      "See [the key pair docs](https://example.com/key-pair/index.html).",
    );
    expect(masked).toContain("the key pair docs");
    expect(masked).not.toContain("example.com");
  });

  it("blanks reference-style link definitions", () => {
    const masked = maskMarkdownNonProse(
      "[ref]: https://example.com/scaling-group",
    );
    expect(masked.trim()).toBe("[ref]:");
  });

  it("blanks raw HTML tags and autolinks", () => {
    expect(maskMarkdownNonProse('<img src="scaling-group.png">').trim()).toBe(
      "",
    );
    expect(maskMarkdownNonProse("<https://example.com/key-pair>").trim()).toBe(
      "",
    );
  });

  it("masks a multi-backtick span whose content contains a single backtick", () => {
    // CommonMark: a run of N backticks closes at the next run of exactly N.
    // A naive /(`+)[^`]*?\1/ backtracks its opening run down to one backtick,
    // masks only the delimiters, and leaves the span's content exposed.
    const masked = maskMarkdownNonProse("Run ``scaling group ` here`` now.");
    expect(masked).not.toContain("scaling group");
    expect(masked).toContain("Run");
    expect(masked).toContain("now.");
  });

  it("leaves an unterminated backtick run as prose", () => {
    const line = "A stray ` backtick and the word organization.";
    const masked = maskMarkdownNonProse(line);
    expect(masked).toBe(line);
  });

  it("does not let a short inner run close a longer span", () => {
    const masked = maskMarkdownNonProse("``a ` b`` tail");
    expect(masked).toContain("tail");
    expect(masked.slice(0, "``a ` b``".length).trim()).toBe("");
  });

  it("preserves every column index so match spans stay valid", () => {
    const line = "The `code` word organization ends here.";
    const masked = maskMarkdownNonProse(line);
    expect(masked).toHaveLength(line.length);
    expect(masked.indexOf("organization")).toBe(line.indexOf("organization"));
  });
});

describe("collectMarkdownLines", () => {
  it("skips fenced code blocks, including their content", () => {
    const leaves = prose(
      [
        "Intro line.",
        "```bash",
        "scaling group --help",
        "```",
        "Outro line.",
      ].join("\n"),
    );
    expect(values(leaves)).toEqual(["Intro line.", "Outro line."]);
  });

  it("closes a fence only on a matching fence character", () => {
    const leaves = prose(
      ["```", "~~~", "still code", "```", "Real prose."].join("\n"),
    );
    expect(values(leaves)).toEqual(["Real prose."]);
  });

  it("skips YAML front matter but only at the top of the file", () => {
    const leaves = prose(
      ["---", "title: Sessions", "---", "Body text.", "---"].join("\n"),
    );
    expect(values(leaves)).toEqual(["Body text.", "---"]);
  });

  it("skips multi-line HTML comments", () => {
    const leaves = prose(
      [
        "Before.",
        "<!-- a scaling group note",
        "still comment -->",
        "After.",
      ].join("\n"),
    );
    expect(values(leaves)).toEqual(["Before.", "After."]);
  });

  it("does not let a fence inside an HTML comment swallow the rest of the file", () => {
    // The comment is closed before fence detection runs, so the ``` lines
    // inside it never flip the fence state and the prose after it is still
    // scanned. Getting this order wrong hides every finding below the comment.
    const leaves = prose(
      [
        "<!-- commented-out example:",
        "```bash",
        "echo hi",
        "```",
        "-->",
        "Prose after the comment.",
      ].join("\n"),
    );
    expect(values(leaves)).toEqual(["Prose after the comment."]);
  });

  it("keeps the prose that follows a comment closing mid-line", () => {
    const leaves = prose(["<!-- note", "done --> Tail prose."].join("\n"));
    expect(values(leaves)).toEqual(["Tail prose."]);
  });

  it("honors the inline marker on the raw line, inside an HTML comment", () => {
    const leaves = prose(
      [
        "The old scaling group name. <!-- [[i18n-term-ok]] -->",
        "Normal line.",
      ].join("\n"),
    );
    expect(values(leaves)).toEqual(["Normal line."]);
  });

  it("numbers keys by 1-based source line and drops blank lines", () => {
    const leaves = prose(["First.", "", "Third."].join("\n"), "ko/intro.md");
    expect(leaves.map((l) => l.key)).toEqual([
      "ko/intro.md:1",
      "ko/intro.md:3",
    ]);
  });

  it("reports the original line as `raw` while matching the masked one", () => {
    const [leaf] = prose("Use `worker node` here.");
    expect(leaf.raw).toBe("Use `worker node` here.");
    expect(leaf.value).not.toContain("worker node");
    expect(leaf.value).toHaveLength(leaf.raw.length);
  });
});

describe("listMarkdownFiles", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "docs-terminology-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("walks nested directories, returns only .md, and sorts deterministically", () => {
    mkdirSync(join(dir, "b"), { recursive: true });
    writeFileSync(join(dir, "z.md"), "z");
    writeFileSync(join(dir, "a.md"), "a");
    writeFileSync(join(dir, "a.png"), "not markdown");
    writeFileSync(join(dir, "b", "c.md"), "c");

    expect(listMarkdownFiles(dir)).toEqual([
      join(dir, "a.md"),
      join(dir, "b", "c.md"),
      join(dir, "z.md"),
    ]);
  });

  it("returns [] for a missing directory instead of throwing", () => {
    expect(listMarkdownFiles(join(dir, "nope"))).toEqual([]);
  });
});

describe("CHECK 1 over a docs store", () => {
  const termbase = {
    concepts: [],
    avoid: [
      {
        avoid: "scaling group",
        useInstead: "resource group",
        reason: "Deprecated term",
        lang: "en",
        context: null,
      },
      {
        avoid: "group",
        useInstead: "project",
        reason: "Ambiguous",
        lang: "en",
        context: "for project",
      },
      {
        avoid: "슈퍼관리자",
        useInstead: "슈퍼 관리자",
        reason: "Spacing",
        lang: "ko",
        context: null,
      },
    ],
  };
  const allow = {
    ignoreValues: new Set<string>(),
    ignoreKeys: new Set<string>(),
  };
  const compounds = buildApprovedCompounds(termbase);

  const check = (lang: string, md: string) => {
    const leaves: Leaf[] = [];
    collectMarkdownLines(md, "page.md", leaves);
    return runCheck1(
      [
        {
          file: `/docs/${lang}/page.md`,
          label: "packages/backend.ai-webui-docs/src",
          lang,
          kind: "docs",
          leaves,
        },
      ],
      termbase.avoid,
      allow,
      compounds,
    );
  };

  it("blocks a context-free English avoid term in prose", () => {
    const findings = check("en", "Pick a scaling group for the session.");
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe("error");
    expect(findings[0].term).toBe("scaling group");
    // The report shows the original line, not the masked one.
    expect(findings[0].value).toBe("Pick a scaling group for the session.");
  });

  it("ignores context-qualified rows on prose, where the ordinary sense is legitimate", () => {
    // "group three GPUs" is English, not a mislabelled project — exactly the
    // judgement call the docs source deliberately leaves to docs-lead.
    expect(check("en", "You can group three GPUs together.")).toHaveLength(0);
  });

  it("blocks the non-English drift the docs source was added for", () => {
    // This is the exact drift FR-3373 found in the ko manual. It was warn-only
    // then — FR-3374 made context-free rows error in every language, so the
    // gate that found it can now also stop it.
    const findings = check("ko", "슈퍼관리자는 진단 페이지를 열 수 있습니다.");
    expect(findings).toHaveLength(1);
    expect(findings[0].term).toBe("슈퍼관리자");
    expect(findings[0].severity).toBe("error");
  });

  it("keeps a context-qualified row warn-only regardless of language", () => {
    // Severity keys off `context`, not language (FR-3374). The i18n store is
    // used here because prose skips context-qualified rows entirely.
    const findings = runCheck1(
      [
        {
          file: "/i18n/ko.json",
          label: "resources/i18n",
          lang: "ko",
          kind: "i18n",
          leaves: [
            { key: "fixture", segment: "fixture", value: "자동 스케일링 규칙" },
          ],
        },
      ],
      [
        {
          avoid: "자동 스케일링",
          useInstead: "오토스케일링",
          reason: "UI label",
          lang: "ko",
          context: "auto scaling rule",
        },
      ],
      allow,
      compounds,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe("warn");
  });

  it("does not apply an avoid row to a document in another language", () => {
    expect(check("ja", "슈퍼관리자")).toHaveLength(0);
  });

  it("does not fire on a term that only appears inside code or a link target", () => {
    expect(
      check(
        "en",
        "Set `scaling group` via [the API](https://x.test/scaling-group).",
      ),
    ).toHaveLength(0);
  });
});

describe("check defaults (which checks a bare invocation runs)", () => {
  // These defaults are load-bearing: CHECK 2 and CHECK 3 were promoted to
  // default-on only after their backlogs were driven to zero (FR-3376 and
  // FR-3373). Nothing else in the suite would notice a silent revert to
  // opt-in, so pin them here — and pin the opt-outs, because scripts/verify.sh
  // depends on being able to turn both off.
  const run = (argv: string[]) =>
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL("./check-terminology-i18n.mjs", import.meta.url)),
        ...argv,
      ],
      { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    );

  it("runs CHECK 1, CHECK 2 and CHECK 3 on a bare invocation", () => {
    const out = run([]);
    expect(out).toContain("CHECK 1 — terminology drift");
    expect(out).toContain("CHECK 2 — near-duplicate value divergence");
    expect(out).toContain("CHECK 3 — unknown capitalized user-facing noun");
  });

  it("suppresses CHECK 2 with --no-check2 and CHECK 3 with --no-check3", () => {
    const out = run(["--no-check2", "--no-check3"]);
    expect(out).toContain("CHECK 1 — terminology drift");
    expect(out).not.toContain("CHECK 2 — near-duplicate value divergence");
    expect(out).not.toContain("CHECK 3 — unknown capitalized user-facing noun");
  });

  it("keeps CHECK 2 and CHECK 3 report-only — neither can fail --strict", () => {
    // The repo baseline is clean, so this also guards the baseline itself:
    // a non-zero exit here means real drift landed, not a defaults regression.
    expect(() => run(["--strict"])).not.toThrow();
  });
});
