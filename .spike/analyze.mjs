import ts from '/home/ubuntu/Workspace/backend.ai-webui/node_modules/typescript/lib/typescript.js';
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.SPIKE_REPO;
const ROOTS = process.argv.slice(2);
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === '__generated__' || e.name === 'node_modules') continue;
      walk(p);
    } else if (/\.(tsx|ts)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) files.push(p);
  }
}
ROOTS.forEach(walk);

const out = {
  files: files.length,
  formItemProps: {},
  formItemPropFiles: {},
  formProps: {},
  formListProps: {},
  formProviderProps: {},
  instanceMethods: {},
  instanceMethodFiles: {},
  useWatch: [], useFormInstance: [], useForm: [],
  formItemNameKinds: { string: 0, arrayFlat: 0, arrayNested: 0, dynamic: 0, expr: 0, absent: 0 },
  nestedNameSamples: [],
  rulesDetail: { total: 0, withValidator: 0, withAsyncValidator: 0, declarativeOnly: 0, samplesValidator: [] },
  formListSites: [],
  validateFieldsCatch: [],
  formItemFiles: new Set(),
  formFiles: new Set(),
  itemsPerFile: {},
  formItemLikeComponents: {},
  validateTriggerValues: {},
  layoutValues: {},
  ruleKeys: {},
};

function inc(o, k) { o[k] = (o[k] || 0) + 1; }
function addFile(o, k, f) { (o[k] = o[k] || new Set()).add(f); }

function tagName(node) {
  const t = node.kind === ts.SyntaxKind.JsxSelfClosingElement ? node.tagName : node.openingElement.tagName;
  return t.getText();
}
function attrsOf(node) {
  const el = node.kind === ts.SyntaxKind.JsxSelfClosingElement ? node : node.openingElement;
  return el.attributes.properties;
}

for (const file of files) {
  const src = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const rel = path.relative(REPO, file);

  const visit = (node) => {
    if (node.kind === ts.SyntaxKind.JsxSelfClosingElement || node.kind === ts.SyntaxKind.JsxElement) {
      const name = tagName(node);
      const attrs = attrsOf(node);
      const propNames = attrs.filter(a => ts.isJsxAttribute(a)).map(a => a.name.getText());
      const spreads = attrs.filter(a => !ts.isJsxAttribute(a)).length;
      const getAttr = (n) => attrs.find(a => ts.isJsxAttribute(a) && a.name.getText() === n);

      const isItem = /(^|\.)Form\.Item$|^FormItem$|^BAIFormItem$/.test(name);
      const isForm = name === 'Form' || name === 'BAIForm';
      const isList = /Form\.List$|^FormList$/.test(name);
      const isProvider = /Form\.Provider$/.test(name);

      if (isItem) {
        out.formItemFiles.add(rel);
        out.itemsPerFile[rel] = (out.itemsPerFile[rel] || 0) + 1;
        inc(out.formItemLikeComponents, name);
        if (spreads) inc(out.formItemProps, '(...spread)');
        for (const p of propNames) { inc(out.formItemProps, p); addFile(out.formItemPropFiles, p, rel); }
        const nm = getAttr('name');
        if (!nm || !nm.initializer) out.formItemNameKinds.absent++;
        else {
          const init = nm.initializer;
          if (ts.isStringLiteral(init)) out.formItemNameKinds.string++;
          else if (ts.isJsxExpression(init) && init.expression) {
            const e = init.expression;
            if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) out.formItemNameKinds.string++;
            else if (ts.isArrayLiteralExpression(e)) {
              const allStatic = e.elements.every(x => ts.isStringLiteral(x) || ts.isNumericLiteral(x));
              if (e.elements.length > 1) {
                out.formItemNameKinds.arrayNested++;
                out.nestedNameSamples.push({ file: rel, line: src.getLineAndCharacterOfPosition(node.getStart()).line + 1, text: e.getText().replace(/\s+/g, ' ').slice(0, 140), static: allStatic });
              } else out.formItemNameKinds.arrayFlat++;
            } else out.formItemNameKinds.expr++;
          } else out.formItemNameKinds.expr++;
        }
        const rl = getAttr('rules');
        if (rl && rl.initializer && ts.isJsxExpression(rl.initializer) && rl.initializer.expression) {
          out.rulesDetail.total++;
          const expr = rl.initializer.expression;
          const txt = expr.getText();
          // collect declarative rule keys from object literals
          const collectKeys = (n) => {
            if (ts.isObjectLiteralExpression(n)) {
              for (const p of n.properties) if (p.name) inc(out.ruleKeys, p.name.getText());
            }
            ts.forEachChild(n, collectKeys);
          };
          collectKeys(expr);
          const hasValidator = /\bvalidator\s*:/.test(txt);
          const isAsync = /validator\s*:\s*async/.test(txt) || /\bawait\b/.test(txt) || /Promise\.(reject|resolve)/.test(txt) === false && false;
          const asyncish = /validator\s*:\s*async/.test(txt) || /\bawait\b/.test(txt);
          if (hasValidator) {
            out.rulesDetail.withValidator++;
            if (asyncish) out.rulesDetail.withAsyncValidator++;
            if (out.rulesDetail.samplesValidator.length < 60) out.rulesDetail.samplesValidator.push({ file: rel, line: src.getLineAndCharacterOfPosition(node.getStart()).line + 1, snippet: txt.replace(/\s+/g, ' ').slice(0, 220), async: asyncish });
          } else out.rulesDetail.declarativeOnly++;
        }
        const vt = getAttr('validateTrigger');
        if (vt) inc(out.validateTriggerValues, (vt.initializer ? vt.initializer.getText() : 'true').replace(/\s+/g, ' ').slice(0, 60));
      }
      if (isForm) {
        out.formFiles.add(rel);
        if (spreads) inc(out.formProps, '(...spread)');
        for (const p of propNames) inc(out.formProps, p);
        const ly = getAttr('layout');
        if (ly && ly.initializer) inc(out.layoutValues, ly.initializer.getText().replace(/["{}']/g, ''));
      }
      if (isList) {
        for (const p of propNames) inc(out.formListProps, p);
        const nm = getAttr('name');
        out.formListSites.push({ file: rel, name: nm && nm.initializer ? nm.initializer.getText().replace(/\s+/g, ' ') : '(none)', line: src.getLineAndCharacterOfPosition(node.getStart()).line + 1 });
      }
      if (isProvider) for (const p of propNames) inc(out.formProviderProps, p);
    }

    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const m = node.expression.name.getText();
      const recv = node.expression.expression.getText();
      const FORM_METHODS = ['validateFields', 'setFieldsValue', 'setFieldValue', 'getFieldsValue', 'getFieldValue', 'resetFields', 'setFields', 'isFieldsTouched', 'isFieldTouched', 'getFieldError', 'getFieldsError', 'getFieldWarning', 'scrollToField', 'submit', 'validateField', 'getInternalHooks'];
      if (FORM_METHODS.includes(m) && /form|Form|instance/.test(recv)) {
        inc(out.instanceMethods, m);
        addFile(out.instanceMethodFiles, m, rel);
        if (m === 'validateFields') {
          let p = node.parent;
          let found = null;
          for (let i = 0; i < 8 && p; i++, p = p.parent) {
            if (ts.isPropertyAccessExpression(p) && p.name.getText() === 'catch') { found = 'promise.catch'; break; }
            if (ts.isTryStatement(p)) { found = 'try/catch'; break; }
            if (ts.isCatchClause(p)) { found = 'try/catch'; break; }
          }
          out.validateFieldsCatch.push({ file: rel, line: src.getLineAndCharacterOfPosition(node.getStart()).line + 1, kind: found, text: node.getText().replace(/\s+/g, ' ').slice(0, 100) });
        }
      }
    }
    if (ts.isCallExpression(node)) {
      const t = node.expression.getText();
      const line = src.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      if (/(^|\.)Form\.useWatch$|^useWatch$/.test(t)) out.useWatch.push({ file: rel, line, args: node.arguments.map(a => a.getText().replace(/\s+/g, ' ').slice(0, 90)) });
      if (/(^|\.)Form\.useFormInstance$|^useFormInstance$/.test(t)) out.useFormInstance.push({ file: rel, line });
      if (/(^|\.)Form\.useForm$|^useForm$/.test(t)) out.useForm.push({ file: rel, line });
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
}

out.formItemFiles = [...out.formItemFiles];
out.formFiles = [...out.formFiles];
for (const k of Object.keys(out.instanceMethodFiles)) out.instanceMethodFiles[k] = [...out.instanceMethodFiles[k]];
for (const k of Object.keys(out.formItemPropFiles)) out.formItemPropFiles[k] = [...out.formItemPropFiles[k]].length;
fs.writeFileSync(path.join(REPO, '.spike/report.json'), JSON.stringify(out, null, 2));

const totalItems = Object.values(out.itemsPerFile).reduce((a, b) => a + b, 0);
console.log('files scanned:', out.files);
console.log('Form.Item sites:', totalItems, 'in', out.formItemFiles.length, 'files');
console.log('<Form> sites files:', out.formFiles.length);
console.log('\n=== Form.Item props ===');
Object.entries(out.formItemProps).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(v).padStart(5), k, '  files:', out.formItemPropFiles[k] ?? '-'));
console.log('\n=== Form props ===');
Object.entries(out.formProps).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(v).padStart(5), k));
console.log('\n=== FormInstance methods ===');
Object.entries(out.instanceMethods).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(v).padStart(5), k, ' files:', out.instanceMethodFiles[k].length));
console.log('\n=== name kinds ===', JSON.stringify(out.formItemNameKinds));
console.log('=== rules ===', JSON.stringify({ ...out.rulesDetail, samplesValidator: out.rulesDetail.samplesValidator.length }));
console.log('=== rule keys ===', JSON.stringify(out.ruleKeys));
console.log('=== Form.List sites ===', out.formListSites.length);
out.formListSites.forEach(s => console.log('   ', s.file + ':' + s.line, s.name));
console.log('=== Form.List props ===', JSON.stringify(out.formListProps));
console.log('=== useWatch ===', out.useWatch.length, '| useFormInstance', out.useFormInstance.length, '| useForm', out.useForm.length);
console.log('=== validateTrigger values ===', JSON.stringify(out.validateTriggerValues));
console.log('=== layout values ===', JSON.stringify(out.layoutValues));
console.log('=== Form.Provider props ===', JSON.stringify(out.formProviderProps));
console.log('\n=== top files by Form.Item count ===');
Object.entries(out.itemsPerFile).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(String(v).padStart(4), k));
