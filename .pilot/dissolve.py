"""PHASE 5 — dissolve BAIFlexAstryx / BAIButtonAstryx / thin smallPrimitives.

BUI gap tokens resolve to antd `token.size*` px; Astryx steps are px/4.
  xxs 4 -> 1 | xs 8 -> 2 | sm 12 -> 3 | md 20 -> 5 | lg 24 -> 6 | xl 32 -> 8
"""
import pathlib
import re

GAP = {'xxs': 1, 'xs': 2, 'sm': 3, 'md': 5, 'lg': 6, 'xl': 8}


def rewrite_flex(src: str) -> str:
    """`<BAIFlex ...>` -> `<HStack ...>` / `<VStack ...>`, closing tags matched."""
    out = []
    i = 0
    stack = []
    while True:
        m = re.search(r'<(/?)BAIFlex([\s/>])', src[i:])
        if not m:
            out.append(src[i:])
            break
        start = i + m.start()
        out.append(src[i:start])
        if m.group(1) == '/':
            comp = stack.pop()
            out.append('</%s>' % comp)
            i = start + len('</BAIFlex>')
            continue
        # Opening tag: find its end (handles nested braces in props).
        j = start
        depth = 0
        while j < len(src):
            ch = src[j]
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            elif ch == '>' and depth == 0:
                break
            j += 1
        tag = src[start:j + 1]
        self_closing = tag.rstrip().endswith('/>')
        comp = 'VStack' if re.search(r'direction=[\'"{\s]*[\'"]column', tag) else 'HStack'
        body = tag[len('<BAIFlex'):-1]
        if self_closing:
            body = body.rstrip()[:-1]
        # direction is encoded in the component choice
        body = re.sub(r'\s*direction=(\{[^}]*\}|"[^"]*"|\'[^\']*\')', '', body)
        # gap token -> Astryx step
        body = re.sub(
            r"\s*gap=\{?['\"](\w+)['\"]\}?",
            lambda mm: (' gap={%d}' % GAP[mm.group(1)])
            if mm.group(1) in GAP
            else mm.group(0),
            body,
        )
        out.append('<%s%s%s>' % (comp, body, ' /' if self_closing else ''))
        if not self_closing:
            stack.append(comp)
        i = j + 1
    return ''.join(out)


def main():
    files = [
        'react/src/pages/AdminVFolderNodeListPage.tsx',
        'react/src/components/VFolderNodes.tsx',
        'react/src/components/DeleteVFolderModal.tsx',
        'react/src/components/FolderCreateModalV2.tsx',
    ]
    for p in files:
        f = pathlib.Path(p)
        s = f.read_text()
        if 'BAIFlex' not in s:
            continue
        s = rewrite_flex(s)
        s = re.sub(r"^import BAIFlex from '[^']*BAIFlexAstryx';\n", '', s, flags=re.M)
        if 'HStack' in s or 'VStack' in s:
            lines = s.split('\n')
            lines[4:4] = ["import { HStack, VStack } from '@astryxdesign/core/Stack';"]
            s = '\n'.join(lines)
        f.write_text(s)
        print('flex ->', p)


main()
