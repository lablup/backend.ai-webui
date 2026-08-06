// Count the "layout-only Form.Item (no name) that wraps noStyle children"
// pattern — the case BAIFormItem must aggregate sub-item errors for.
import ts from '/home/ubuntu/Workspace/backend.ai-webui/node_modules/typescript/lib/typescript.js';
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.SPIKE_REPO;
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === '__generated__' || e.name === 'node_modules') continue;
      walk(p);
    } else if (/\.tsx$/.test(e.name)) files.push(p);
  }
}
['react/src', 'packages/backend.ai-ui/src'].forEach((r) => walk(path.join(REPO, r)));

let aggregating = 0;
let noStyleWithName = 0;
let noStyleWithoutName = 0;
const sites = [];

for (const file of files) {
  const src = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const rel = path.relative(REPO, file);
  const isItem = (n) => {
    const t =
      n.kind === ts.SyntaxKind.JsxSelfClosingElement ? n.tagName : n.openingElement?.tagName;
    return t && /(^|\.)Form\.Item$/.test(t.getText());
  };
  const attrs = (n) =>
    (n.kind === ts.SyntaxKind.JsxSelfClosingElement ? n : n.openingElement).attributes.properties;
  const has = (n, name) =>
    attrs(n).some((a) => ts.isJsxAttribute(a) && a.name.getText() === name);

  const visit = (node) => {
    if (node.kind === ts.SyntaxKind.JsxElement && isItem(node)) {
      if (has(node, 'noStyle')) {
        if (has(node, 'name')) noStyleWithName++;
        else noStyleWithoutName++;
      } else if (!has(node, 'name')) {
        // does it contain a noStyle Form.Item descendant?
        let found = false;
        const dig = (n) => {
          if (n !== node && n.kind === ts.SyntaxKind.JsxElement && isItem(n) && has(n, 'noStyle'))
            found = true;
          if (
            n !== node &&
            n.kind === ts.SyntaxKind.JsxSelfClosingElement &&
            isItem(n) &&
            has(n, 'noStyle')
          )
            found = true;
          ts.forEachChild(n, dig);
        };
        dig(node);
        if (found) {
          aggregating++;
          sites.push(`${rel}:${src.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
}

console.log('noStyle WITH name (pure state wrapper):', noStyleWithName);
console.log('noStyle WITHOUT name (layout passthrough):', noStyleWithoutName);
console.log('aggregating layout items (no name, contains noStyle children):', aggregating);
sites.forEach((s) => console.log('   ', s));
