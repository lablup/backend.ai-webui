import { readFileSync, writeFileSync } from "fs";

function readJSON(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}
function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function sortKeyRank(k) {
  // $schema should always be first
  if (k === "$schema") return -1;
  
  const c = k.charAt(0);
  if (c >= "a" && c <= "z") return 0;
  if (c >= "A" && c <= "Z") return 1;
  return 2;
}
function compareKeyRank(a, b) {
  const rankA = sortKeyRank(a);
  const rankB = sortKeyRank(b);
  if (rankA !== rankB) return rankA - rankB;

  const lowerCaseA = a.toLowerCase();
  const lowerCaseB = b.toLowerCase();
  if (lowerCaseA < lowerCaseB) return -1;
  if (lowerCaseA > lowerCaseB) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}
// normalize object
function sortObject(obj) {
  if (!isObject(obj)) return obj;

  const result = {};
  for (const key of Object.keys(obj).sort(compareKeyRank)) {
    const value = obj[key];
    result[key] = sortObject(value);
  }
  return result;
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

const [, , basePath, oursPath, theirsPath] = process.argv;
// parsing + sorting
const base = sortObject(readJSON(basePath));
const ours = sortObject(readJSON(oursPath));
const theirs = sortObject(readJSON(theirsPath));

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

// final sorting and writing
result = sortObject(result);
writeFileSync(oursPath, JSON.stringify(result, null, 2) + "\n", "utf8");
process.exit(0);
