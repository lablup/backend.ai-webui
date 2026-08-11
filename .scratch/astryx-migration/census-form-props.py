"""Census of the antd Form surface actually used in this repo.

Scope decision input for ticket 34's parity hardening: only props that appear
at a real call site need pixel parity; the rest is documented accepted gap.
Run from the repo root:  python3 .scratch/astryx-migration/census-form-props.py
"""

import collections
import os
import re

ROOTS = ["react/src", "packages/backend.ai-ui/src", "react/theme-probe", "e2e"]
TAGS = (
    "Form.Item",
    "BAIFormItem",
    "Form.List",
    "Form.ErrorList",
    "Form.Provider",
    "Form",
)

files = []
for root in ROOTS:
    for dirpath, _dirnames, filenames in os.walk(root):
        if "__generated__" in dirpath:
            continue
        for name in filenames:
            if name.endswith((".tsx", ".ts")):
                files.append(os.path.join(dirpath, name))

counters = collections.defaultdict(collections.Counter)
sites = collections.defaultdict(lambda: collections.defaultdict(set))

open_re = re.compile(r"<(Form\.Item|BAIFormItem|Form\.List|Form\.ErrorList|Form\.Provider|Form)(?=[\s/>])")
attr_re = re.compile(r"(?:^|\s)([a-zA-Z][a-zA-Z0-9_]*)\s*(?==|/?>|\s|$)")

for path in files:
    text = open(path, encoding="utf8").read()
    pos = 0
    while True:
        m = open_re.search(text, pos)
        if not m:
            break
        tag = m.group(1)
        i = m.end()
        depth = 0
        while i < len(text):
            ch = text[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
            elif ch == ">" and depth == 0:
                break
            i += 1
        body = text[m.end() : i]
        flat = body
        for _ in range(10):
            flat = re.sub(r"\{[^{}]*\}", "{}", flat)
        flat = re.sub(r'"[^"]*"', '""', flat)
        flat = re.sub(r"'[^']*'", "''", flat)
        key = "Form.Item" if tag == "BAIFormItem" else tag
        for attr in set(attr_re.findall(flat)):
            counters[key][attr] += 1
            sites[key][attr].add(path)
        pos = i + 1

for key in ("Form", "Form.Item", "Form.List", "Form.ErrorList", "Form.Provider"):
    print(f"===== <{key}> =====")
    for attr, n in counters[key].most_common():
        example = sorted(sites[key][attr])[0]
        print(f"{n:5d}  {attr:24s} {example}")
    print()

# FormInstance method census
method_re = re.compile(
    r"\b(?:form|formInstance|f)\s*\.\s*"
    r"(getFieldValue|getFieldsValue|getFieldError|getFieldWarning|getFieldsError|"
    r"setFieldValue|setFieldsValue|setFields|resetFields|validateFields|submit|"
    r"isFieldsTouched|isFieldTouched|isFieldValidating|isFieldsValidating|"
    r"scrollToField|focusField|getFieldInstance)\b"
)
mc = collections.Counter()
for path in files:
    for m in method_re.finditer(open(path, encoding="utf8").read()):
        mc[m.group(1)] += 1
print("===== FormInstance methods =====")
for name, n in mc.most_common():
    print(f"{n:5d}  {name}")
