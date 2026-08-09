"""Which `<Form>` call sites declare `layout`, and which inherit the default?

antd's default is `horizontal`; the engine's is `vertical`. Sites with no
`layout` prop are exactly the ones the two disagree about.
"""

import os
import re

ROOTS = ["react/src", "packages/backend.ai-ui/src"]
files = []
for root in ROOTS:
    for dirpath, _d, filenames in os.walk(root):
        if "__generated__" in dirpath or "form-engine" in dirpath:
            continue
        for name in filenames:
            if name.endswith(".tsx"):
                files.append(os.path.join(dirpath, name))

open_re = re.compile(r"<Form(?=[\s/>])")
with_layout = []
without_layout = []
def strip_comments(src: str) -> str:
    """Blank out // and /* */ comments so a `<Form …>` mentioned in prose is
    not counted as a call site (measured: 3 false positives)."""
    out = []
    i = 0
    n = len(src)
    while i < n:
        if src.startswith("//", i):
            j = src.find("\n", i)
            j = n if j == -1 else j
            out.append(" " * (j - i))
            i = j
        elif src.startswith("/*", i):
            j = src.find("*/", i + 2)
            j = n if j == -1 else j + 2
            out.append("".join(c if c == "\n" else " " for c in src[i:j]))
            i = j
        else:
            out.append(src[i])
            i += 1
    return "".join(out)


for path in files:
    text = strip_comments(open(path, encoding="utf8").read())
    pos = 0
    while True:
        m = open_re.search(text, pos)
        if not m:
            break
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
        line = text[: m.start()].count("\n") + 1
        stripped = re.sub(r"//[^\n]*", "", body)
        stripped = re.sub(r"/\*.*?\*/", "", stripped, flags=re.S)
        entry = f"{path}:{line}"
        if re.search(r"\blayout\s*=", stripped):
            mm = re.search(r"\blayout\s*=\s*(\{?['\"]?\w+)", stripped)
            with_layout.append((entry, mm.group(1) if mm else "?"))
        else:
            has_label_col = bool(re.search(r"\blabelCol\s*=", stripped))
            without_layout.append((entry, "labelCol" if has_label_col else ""))
        pos = i + 1

print(f"--- <Form> WITH explicit layout: {len(with_layout)} ---")
for e, v in with_layout:
    print(f"  {v:14s} {e}")
print(f"\n--- <Form> WITHOUT layout (antd=horizontal, engine=vertical): {len(without_layout)} ---")
for e, v in without_layout:
    print(f"  {v:10s} {e}")
