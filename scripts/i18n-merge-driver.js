const { readFileSync, writeFileSync } = require("fs");

function readJSON(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}
function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
// Use prettier to sort JSON objects
async function sortObject(obj) {
  // Lazy load prettier to avoid issues in test environment
  const prettier = require("prettier");

  // Format the JSON using prettier with inline config
  const formatted = await prettier.format(JSON.stringify(obj), {
    parser: "json",
    plugins: ["prettier-plugin-sort-json"],
    jsonRecursiveSort: true,
  });

  return JSON.parse(formatted.trim());
}
// collect changed diff
function diffLeaves(base, v, path = [], acc = []) {
  if (deepEqual(base, v)) return acc; // no change
  if (isObject(base) && isObject(v)) {
    const keys = new Set([...Object.keys(base), ...Object.keys(v)]);
    for (const key of keys) {
      const baseValue = base[key];
      const newValue = v[key];
      diffLeaves(baseValue, newValue, [...path, key], acc);
    }
    return acc;
  } else {
    acc.push({ path, value: v });
    return acc;
  }
}

function setAt(root, path, value) {
  if (path.length === 0) return value;
  let current = root;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (!isObject(current[k])) current[k] = {};
    current = current[k];
  }
  const last = path[path.length - 1];
  if (value === undefined) {
    // delete
    delete current[last];
  } else {
    current[last] = value;
  }
  return root;
}
function pathKey(path) {
  return path.join("\x1f");
}

// Export functions for testing
module.exports = {
  readJSON,
  isObject,
  deepEqual,
  diffLeaves,
  setAt,
  pathKey,
};

// Only run the main logic if this file is executed directly
if (require.main === module) {
  (async () => {
    const [, , basePath, oursPath, theirsPath] = process.argv;
    // parsing + sorting
    const base = await sortObject(readJSON(basePath));
    const ours = await sortObject(readJSON(oursPath));
    const theirs = await sortObject(readJSON(theirsPath));

    // collect changed diff
    const dOurs = diffLeaves(base, ours);
    const dTheirs = diffLeaves(base, theirs);

    // occur conflicts when both sides have changes
    const mOurs = new Map(dOurs.map((e) => [pathKey(e.path), e]));
    const mTheirs = new Map(dTheirs.map((e) => [pathKey(e.path), e]));
    for (const [k, o] of mOurs) {
      if (mTheirs.has(k)) {
        const t = mTheirs.get(k);
        if (!deepEqual(o.value, t.value)) {
          console.error("i18n JSON merge conflict at path:", o.path.join("."));
          process.exit(1);
        }
      }
    }

    // merge: base -> ours -> theirs
    let result = JSON.parse(JSON.stringify(base));
    for (const e of dOurs) result = setAt(result, e.path, e.value);
    for (const e of dTheirs) result = setAt(result, e.path, e.value);

    result = await sortObject(result);
    writeFileSync(oursPath, JSON.stringify(result, null, 2) + "\n", "utf8");
    process.exit(0);
  })();
}
