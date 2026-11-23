import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { classify, computeChanges } from "./adr-changes.mjs";
import { buildAdrPreview, fillAdrRef } from "./build-adr-preview.mjs";

const VIEWER = `<!doctype html>
<html><head>
    <meta name="adr-ref" content="" />
</head><body></body></html>
`;

const adr = (id, title, body = "body") => `# ${id} — ${title}\n\n${body}\n`;

// A repo with `main` holding three ADR pairs and the index; the caller's edit
// runs on branch `feature`, and the test runs with that repo as cwd.
function withRepo(edit, fn) {
  const dir = mkdtempSync(join(tmpdir(), "adr-changes-"));
  const run = (...args) =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  const put = (path, text) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  run("init", "-q", "-b", "main");
  run("config", "user.email", "t@example.com");
  run("config", "user.name", "t");
  put("docs/index.html", VIEWER);
  put("docs/ARCHITECTURE.md", "# Architecture\n");
  put("docs/ARCHITECTURE.ko.md", "# 아키텍처\n");
  for (const [id, slug, title] of [
    ["0001", "first", "First decision"],
    ["0002", "second", "Second decision"],
    ["0003", "third", "Third decision"],
  ]) {
    put(`docs/adr/${id}-${slug}.md`, adr(id, title));
    put(`docs/adr/${id}-${slug}.ko.md`, adr(id, `${title} (ko)`));
  }
  put("README.md", "readme\n");
  run("add", "-A");
  run("commit", "-qm", "base");
  run("checkout", "-qb", "feature");
  edit({ put, run, rm: (p) => rmSync(join(dir, p)) });
  run("add", "-A");
  run("commit", "-qm", "edit", "--allow-empty");
  // A later main commit must not leak into the PR's diff.
  run("checkout", "-q", "main");
  put("docs/adr/0009-on-main.md", adr("0009", "Landed on main"));
  run("add", "-A");
  run("commit", "-qm", "main moves on");
  run("checkout", "-q", "feature");

  const cwd = process.cwd();
  process.chdir(dir);
  try {
    return fn(dir);
  } finally {
    process.chdir(cwd);
    rmSync(dir, { recursive: true, force: true });
  }
}

const changes = (edit) =>
  withRepo(edit, () =>
    computeChanges({ base: "main", head: "feature", headRef: "feature" }),
  );

test("classify: ADR content, the viewer and the pipeline", () => {
  assert.deepEqual(classify(["react/src/App.tsx"]), {
    adr: false,
    reason: "none",
  });
  assert.deepEqual(classify(["docs/adr/0001-x.ko.md"]), {
    adr: true,
    reason: "content",
  });
  assert.deepEqual(classify(["docs/ARCHITECTURE.ko.md"]), {
    adr: true,
    reason: "content",
  });
  for (const file of [
    "docs/index.html",
    ".github/workflows/pr-preview.yml",
    ".github/scripts/pr-preview/adr-changes.mjs",
  ]) {
    assert.deepEqual(classify([file]), { adr: true, reason: "viewer" }, file);
  }
  assert.deepEqual(classify(["docs/index.html", "docs/adr/0002-y.md"]), {
    adr: true,
    reason: "mixed",
  });
  assert.deepEqual(classify(["docs/adr/README.md", "docs/other.md"]), {
    adr: false,
    reason: "none",
  });
});

test("no ADR change: an empty list and no preview", () => {
  const result = changes(({ put }) => put("README.md", "changed\n"));
  assert.equal(result.adr, false);
  assert.equal(result.diffMode, "three-dot");
  assert.deepEqual(result.changes.adrs, []);
  assert.deepEqual(result.changes.architecture, {
    en: "unchanged",
    ko: "unchanged",
  });
  assert.equal(result.changes.base, "main");
  assert.equal(result.changes.head, "feature");
  assert.match(result.changes.baseSha, /^[0-9a-f]{40}$/);
  assert.match(result.changes.headSha, /^[0-9a-f]{40}$/);
});

test("added, modified (en only, ko only), removed and renamed ADRs", () => {
  const result = changes(({ put, rm, run }) => {
    put("docs/adr/0031-new-thing.md", adr("0031", "New thing"));
    put("docs/adr/0031-new-thing.ko.md", adr("0031", "새로운 것"));
    put("docs/adr/0001-first.md", adr("0001", "First decision, revised"));
    put("docs/adr/0002-second.ko.md", adr("0002", "Second (ko)", "개정"));
    rm("docs/adr/0003-third.md");
    rm("docs/adr/0003-third.ko.md");
    run("add", "-A");
    run("commit", "-qm", "wip");
    run("mv", "docs/adr/0002-second.md", "docs/adr/0002-second-renamed.md");
  });
  assert.equal(result.reason, "content");
  const { adrs } = result.changes;
  assert.deepEqual(
    adrs.map((a) => [a.id, a.status, a.title]),
    [
      ["0001", "modified", "First decision, revised"],
      ["0002", "modified", "Second decision"],
      ["0003", "removed", "Third decision"],
      ["0031", "added", "New thing"],
    ],
  );
  assert.deepEqual(adrs[0].files, {
    en: { path: "adr/0001-first.md", status: "modified" },
    ko: { path: "adr/0001-first.ko.md", status: "unchanged" },
  });
  assert.deepEqual(adrs[1].files, {
    en: {
      path: "adr/0002-second-renamed.md",
      status: "renamed",
      basePath: "adr/0002-second.md",
    },
    ko: { path: "adr/0002-second.ko.md", status: "modified" },
  });
  assert.deepEqual(adrs[2].files, {
    en: { path: "adr/0003-third.md", status: "removed" },
    ko: { path: "adr/0003-third.ko.md", status: "removed" },
  });
  assert.deepEqual(adrs[3].files, {
    en: { path: "adr/0031-new-thing.md", status: "added" },
    ko: { path: "adr/0031-new-thing.ko.md", status: "added" },
  });
  // 0009 landed on main after the fork point: not this PR's change.
  assert.ok(!adrs.some((a) => a.id === "0009"));
});

test("no merge base falls back to the base tip, reported as two-dot", () => {
  withRepo(
    () => {},
    () => {
      const run = (...a) => execFileSync("git", a, { encoding: "utf8" });
      run("checkout", "-q", "--orphan", "unrelated");
      run("rm", "-rqf", ".");
      run("commit", "-qm", "orphan", "--allow-empty");
      const result = computeChanges({ base: "unrelated", head: "feature" });
      assert.equal(result.diffMode, "two-dot");
      assert.equal(
        result.changes.baseSha,
        run("rev-parse", "unrelated").trim(),
      );
      assert.equal(result.changes.adrs.length, 3);
      assert.ok(result.changes.adrs.every((a) => a.status === "added"));
    },
  );
});

test("a ko-only change lists the untouched en file as unchanged", () => {
  const result = changes(({ put }) =>
    put("docs/adr/0002-second.ko.md", adr("0002", "둘째", "개정")),
  );
  assert.deepEqual(result.changes.adrs, [
    {
      id: "0002",
      status: "modified",
      title: "Second decision",
      files: {
        en: { path: "adr/0002-second.md", status: "unchanged" },
        ko: { path: "adr/0002-second.ko.md", status: "modified" },
      },
    },
  ]);
});

test("an en-only new ADR is added; a pair losing one file is modified", () => {
  const result = changes(({ put, rm }) => {
    put("docs/adr/0040-solo.md", adr("0040", "Solo"));
    rm("docs/adr/0001-first.ko.md");
  });
  assert.deepEqual(
    result.changes.adrs.map((a) => [a.id, a.status, a.files]),
    [
      [
        "0001",
        "modified",
        {
          en: { path: "adr/0001-first.md", status: "unchanged" },
          ko: { path: "adr/0001-first.ko.md", status: "removed" },
        },
      ],
      ["0040", "added", { en: { path: "adr/0040-solo.md", status: "added" } }],
    ],
  );
});

test("a ko-only ADR takes its title from the ko file", () => {
  const result = changes(({ put }) =>
    put("docs/adr/0050-ko-only.ko.md", adr("0050", "한국어만")),
  );
  assert.equal(result.changes.adrs[0].title, "한국어만");
});

test("ARCHITECTURE changes are reported per language", () => {
  const result = changes(({ put, rm }) => {
    put("docs/ARCHITECTURE.md", "# Architecture\n\nmore\n");
    rm("docs/ARCHITECTURE.ko.md");
  });
  assert.equal(result.adr, true);
  assert.deepEqual(result.changes.adrs, []);
  assert.deepEqual(result.changes.architecture, {
    en: "modified",
    ko: "removed",
  });
});

test("adr-ref is filled and attribute-escaped", () => {
  assert.equal(
    fillAdrRef(VIEWER, `feat/a"b<c>&'d`),
    VIEWER.replace('content=""', 'content="feat/a&quot;b&lt;c&gt;&amp;&#39;d"'),
  );
  assert.equal(
    fillAdrRef(VIEWER, "x$&y"),
    VIEWER.replace('content=""', () => 'content="x$&amp;y"'),
  );
  assert.throws(() => fillAdrRef("<html></html>", "x"));
});

test("build writes head files, base copies and changes.json", () => {
  withRepo(
    ({ put, rm, run }) => {
      put("docs/adr/0001-first.md", adr("0001", "First decision, revised"));
      put("docs/ARCHITECTURE.ko.md", "# 아키텍처\n\n추가\n");
      rm("docs/adr/0003-third.md");
      run("mv", "docs/adr/0002-second.ko.md", "docs/adr/0002-moved.ko.md");
    },
    (dir) => {
      const out = join(dir, "..", `${dir.split("/").pop()}-out`);
      try {
        buildAdrPreview({
          base: "main",
          head: "feature",
          headRef: "feat/<x>",
          out,
        });
        const read = (p) => readFileSync(join(out, p), "utf8");
        assert.match(read("index.html"), /content="feat\/&lt;x&gt;"/);
        assert.match(read("adr/0001-first.md"), /revised/);
        assert.ok(existsSync(join(out, "adr/0002-moved.ko.md")));
        assert.ok(!existsSync(join(out, "adr/0003-third.md")));
        assert.ok(!existsSync(join(out, "adr/0009-on-main.md")));
        assert.match(read("base/adr/0001-first.md"), /First decision\n/);
        assert.match(
          read("base/adr/0002-second.ko.md"),
          /Second decision \(ko\)/,
        );
        assert.match(read("base/adr/0003-third.md"), /Third decision/);
        assert.ok(!existsSync(join(out, "base/adr/0001-first.ko.md")));
        assert.equal(read("base/ARCHITECTURE.ko.md"), "# 아키텍처\n");
        assert.equal(read("base/ARCHITECTURE.md"), "# Architecture\n");
        assert.match(read("ARCHITECTURE.ko.md"), /추가/);
        const manifest = JSON.parse(read("changes.json"));
        assert.equal(manifest.head, "feat/<x>");
        assert.deepEqual(
          manifest.adrs.map((a) => [a.id, a.status]),
          [
            ["0001", "modified"],
            ["0002", "modified"],
            ["0003", "modified"],
          ],
        );
        assert.deepEqual(manifest.architecture, {
          en: "unchanged",
          ko: "modified",
        });
        assert.throws(() =>
          buildAdrPreview({ base: "main", head: "feature", headRef: "x", out }),
        );
      } finally {
        rmSync(out, { recursive: true, force: true });
      }
    },
  );
});
