import re, os

import sys
root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
pat_render = re.compile(r'render:\s*\(([^)]*)\)\s*(:[^=]+)?=>', re.S)
files = []
for base in ['react/src', 'packages/backend.ai-ui/src']:
    for dp, dn, fn in os.walk(os.path.join(root, base)):
        if '__generated__' in dp:
            continue
        for f in fn:
            if f.endswith(('.tsx', '.ts')) and not f.endswith('.stories.tsx'):
                files.append(os.path.join(dp, f))

for path in sorted(files):
    src = open(path).read()
    for m in pat_render.finditer(src):
        params = [p.strip() for p in m.group(1).split(',') if p.strip()]
        if len(params) != 1:
            continue
        depth = 0
        j = m.start()
        while j > 0:
            j -= 1
            c = src[j]
            if c == '}':
                depth += 1
            elif c == '{':
                if depth == 0:
                    break
                depth -= 1
        obj_start = j
        depth = 0
        k = m.start()
        while k < len(src):
            c = src[k]
            if c == '{':
                depth += 1
            elif c == '}':
                if depth == 0:
                    break
                depth -= 1
            k += 1
        obj = src[obj_start:k]
        if re.search(r'\bdataIndex\s*:', obj):
            continue
        line = src[:m.start()].count('\n') + 1
        print('%s:%d: params=%s' % (os.path.relpath(path, root), line, params))
