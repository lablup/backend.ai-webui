import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MergeConflict, mergeIndexTexts } from "./merge-search-index.mjs";
import { DRIVERS, declaredDrivers } from "./register-merge-drivers.mjs";

const ROOT = resolve(__dirname, "..");
const INDEX_FILE = join(ROOT, "react/src/generated/searchIndex.json");
const DRIVER = join(ROOT, "scripts/merge-search-index.mjs");

type Index = {
  version: number;
  entries: Array<Record<string, any>>;
  [k: string]: unknown;
};

const committedText = readFileSync(INDEX_FILE, "utf8");
const committed = (): Index => JSON.parse(committedText);
const text = (index: Index) => JSON.stringify(index, null, 2) + "\n";
const entry = (index: Index, path: string) =>
  index.entries.find((e) => e.path === path)!;
const merge = (base: Index, ours: Index, theirs: Index) =>
  mergeIndexTexts(text(base), text(ours), text(theirs));

// A page with tabs and enough keys to insert neighbours into.
const PAGE = committed().entries.find(
  (e) => e.keys.length > 20 && e.tabs.length > 1,
)!.path;
const SETTINGS_PAGE = committed().entries.find((e) => e.settings.length)!.path;

describe("merge-search-index", () => {
  it("resolves neighbouring key insertions that git's line merge conflicts on", () => {
    const base = committed();
    const ours = committed();
    const theirs = committed();
    const [k1, k2] = entry(base, PAGE).keys;
    entry(ours, PAGE).keys.splice(1, 0, `${k1}A`);
    entry(theirs, PAGE).keys.splice(1, 0, `${k1}B`);
    entry(theirs, PAGE).keys = entry(theirs, PAGE).keys.filter(
      (k: string) => k !== k2,
    );

    const merged = JSON.parse(merge(base, ours, theirs));
    const keys = entry(merged, PAGE).keys;
    expect(keys).toContain(`${k1}A`);
    expect(keys).toContain(`${k1}B`);
    expect(keys).not.toContain(k2);
    expect(keys).toEqual([...keys].sort());
  });

  it("returns the other side when one side equals base", () => {
    const base = committed();
    const changed = committed();
    entry(changed, PAGE).keys.push("zzz.Added");
    changed.entries.push({
      menuKey: null,
      scope: "user",
      path: "/zzz-new-page",
      labelKey: "zzz.Label",
      tabs: [],
      settings: [],
      keys: [],
    });
    const normalized = merge(changed, changed, changed);
    expect(merge(base, base, changed)).toBe(normalized);
    expect(merge(base, changed, base)).toBe(normalized);
  });

  it("is symmetric in ours and theirs", () => {
    const base = committed();
    const ours = committed();
    const theirs = committed();
    entry(ours, PAGE).keys.push("aaa.Ours");
    entry(theirs, PAGE).tabs.push({
      param: "tab",
      key: "zzz",
      labelKey: "x.Y",
    });
    const setting = entry(theirs, SETTINGS_PAGE).settings[0];
    setting.descriptionKeys = [...setting.descriptionKeys, "zzz.Description"];
    expect(merge(base, ours, theirs)).toBe(merge(base, theirs, ours));
  });

  it("keeps the committed bytes when nothing changed", () => {
    const base = committed();
    expect(merge(base, base, base)).toBe(committedText);
  });

  it("merges an entry both sides added", () => {
    const base = committed();
    const added = (keys: string[]) => ({
      menuKey: null,
      scope: "user",
      path: "/zzz-new-page",
      labelKey: "zzz.Label",
      tabs: [],
      settings: [],
      keys,
    });
    const ours = { ...committed(), entries: [...base.entries, added(["a.A"])] };
    const theirs = {
      ...committed(),
      entries: [...base.entries, added(["b.B"])],
    };
    expect(
      entry(JSON.parse(merge(base, ours, theirs)), "/zzz-new-page").keys,
    ).toEqual(["a.A", "b.B"]);
  });

  it.each([
    [
      "the version differs",
      (_o: Index, t: Index) => {
        t.version = 2;
      },
    ],
    [
      "both sides change the same scalar",
      (o: Index, t: Index) => {
        entry(o, PAGE).labelKey = "x.Ours";
        entry(t, PAGE).labelKey = "x.Theirs";
      },
    ],
    [
      "both sides change the same tab differently",
      (o: Index, t: Index) => {
        entry(o, PAGE).tabs[0].labelKey = "x.Ours";
        entry(t, PAGE).tabs[0].labelKey = "x.Theirs";
      },
    ],
    [
      "one side removes an entry the other changed",
      (o: Index, t: Index) => {
        o.entries = o.entries.filter((e) => e.path !== PAGE);
        entry(t, PAGE).keys.push("zzz.Added");
      },
    ],
  ])("falls back to a conflict when %s", (_name, mutate) => {
    const base = committed();
    const ours = committed();
    const theirs = committed();
    mutate(ours, theirs);
    expect(() => merge(base, ours, theirs)).toThrow(MergeConflict);
  });

  it("falls back on invalid JSON", () => {
    expect(() => mergeIndexTexts(committedText, "{", committedText)).toThrow(
      MergeConflict,
    );
  });

  describe("as a git merge driver", () => {
    let dir: string;
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    const run = (base: string, ours: string, theirs: string) => {
      dir = mkdtempSync(join(tmpdir(), "merge-search-index-"));
      const [o, a, b] = ["O", "A", "B"].map((n) => join(dir, n));
      writeFileSync(o, base);
      writeFileSync(a, ours);
      writeFileSync(b, theirs);
      // Outside a repository, so no marker or log is written anywhere.
      const r = spawnSync(process.execPath, [DRIVER, o, a, b, "index.json"], {
        cwd: dir,
        encoding: "utf8",
      });
      return { status: r.status, result: readFileSync(a, "utf8") };
    };

    it("writes the merge into %A and exits 0", () => {
      const ours = committed();
      entry(ours, PAGE).keys.push("zzz.Added");
      const { status, result } = run(committedText, text(ours), committedText);
      expect(status).toBe(0);
      expect(entry(JSON.parse(result), PAGE).keys).toContain("zzz.Added");
    });

    it("leaves conflict markers and exits 1 when it cannot merge", () => {
      const ours = committed();
      const theirs = committed();
      entry(ours, PAGE).labelKey = "x.Ours";
      entry(theirs, PAGE).labelKey = "x.Theirs";
      const { status, result } = run(committedText, text(ours), text(theirs));
      expect(status).toBe(1);
      expect(result).toContain("<<<<<<< ours");
      expect(result).toContain(">>>>>>> theirs");
    });
  });
});

describe("register-merge-drivers", () => {
  it("defines every driver .gitattributes declares for the index", () => {
    const attrs = readFileSync(join(ROOT, ".gitattributes"), "utf8");
    expect(declaredDrivers(attrs)).toContain("search-index");
    expect(DRIVERS["search-index"].driver).toContain(
      "scripts/merge-search-index.mjs",
    );
  });

  it("reads merge= declarations and skips comments and built-ins", () => {
    expect(
      declaredDrivers(
        "# a merge=commented\nfoo merge=one\nbar -text merge=union\nbaz linguist-generated=true merge=two\n",
      ),
    ).toEqual(["one", "two"]);
  });
});
