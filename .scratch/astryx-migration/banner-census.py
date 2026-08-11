import re
import subprocess

files = (
    subprocess.check_output(
        ['git', 'grep', '-l', '<Banner', 'react/src', 'packages/backend.ai-ui/src']
    )
    .decode()
    .split()
)
tot = 0
count = 0
for f in files:
    src = open(f).read()
    for m in re.finditer(r'<Banner\b', src):
        count += 1
        i = m.start()
        j = i + 7
        brace = 0
        instr = None
        while j < len(src):
            c = src[j]
            if instr:
                if c == instr and src[j - 1] != '\\':
                    instr = None
            elif c in '"\'`':
                instr = c
            elif c == '{':
                brace += 1
            elif c == '}':
                brace -= 1
            elif brace == 0 and c == '>':
                break
            j += 1
        tag = src[i : j + 1]
        toks = []
        cur = ''
        brace = 0
        instr = None
        k = 7
        while k < len(tag):
            c = tag[k]
            if instr:
                cur += c
                if c == instr and tag[k - 1] != '\\':
                    instr = None
            elif c in '"\'`':
                cur += c
                instr = c
            elif c == '{':
                brace += 1
                cur += c
            elif c == '}':
                brace -= 1
                cur += c
            elif brace == 0 and c in ' \n\t':
                if cur.strip():
                    toks.append(cur.strip())
                cur = ''
            else:
                cur += c
            k += 1
        if cur.strip():
            toks.append(cur.strip())
        st = [t for t in toks if t.startswith(('style=', 'xstyle=', 'className='))]
        ec = [t for t in toks if t.startswith('endContent=')]
        line = src[: i].count('\n') + 1
        if st:
            tot += 1
            print(
                f"{f}:{line}",
                ' | '.join(re.sub(r'\s+', ' ', x)[:110] for x in st),
            )
print('TOTAL <Banner> call sites:', count)
print('with Banner-level style/className:', tot)
