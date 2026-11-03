#!/usr/bin/env bash
# PreToolUse hook: block Graphite (gt) CLI invocations.
#
# Graphite is banned in this repository (FR-3391) — stacked-PR work goes
# through GitHub Stacked PRs (`gh stack`; see .claude/skills/gh-stack/).
# The permissions deny rule in .claude/settings.json covers plain `gt ...`
# commands; this hook looks at the part of the command bash would run — quoted
# text and heredoc data are dropped, except `$(…)`/backticks inside double
# quotes, the string of `bash|sh|zsh|dash -c` and `eval`, and a heredoc fed to a shell —
# and blocks when gt is a command word there: after a separator, a subshell or
# process substitution, behind assignments, redirects, env / command / time / nohup /
# exec / sudo / nice / timeout / xargs / watch / stdbuf (and their options), `!`, `{`,
# if/then/do/else/while, a function body, or as a path (`/x/gt`).
# `command -v gt`, array literals, case patterns, `-gt` comparisons and `mgt` pass.
# If python fails, a plain grep on the raw text decides.

FIND=$(cat <<'PY'
import json, os, re, shlex, sys
cmd = (json.load(sys.stdin).get('tool_input') or {}).get('command') or ''
SHELLS = {'bash', 'sh', 'zsh', 'dash'}
WORDS = 'then|do|else|elif|if|while|until|xargs|env|command|time|nohup|exec|sudo|nice|timeout|watch|stdbuf|eval'
RAW = re.compile(r'(?:^|[;&|]|\$\(|`|\b(?:' + WORDS + r')\b)[ \t]*(?:[A-Za-z_]\w*=\S*[ \t]+)*(?:\S*/)?gt(?:\s|$)', re.M)
KEYWORDS = {'!', '{', 'then', 'do', 'else', 'elif', 'if', 'while', 'until'}
# prefix command -> its options that take a separate value (timeout also takes a duration)
VALUED = {'env': {'-u', '--unset', '-C', '--chdir', '-S', '--split-string'}, 'command': set(), 'time': {'-f', '-o', '--format', '--output'},
          'nohup': set(), 'exec': {'-a'}, 'nice': {'-n', '--adjustment'}, 'timeout': {'-s', '--signal', '-k', '--kill-after'},
          'sudo': {'-u', '--user', '-g', '--group', '-h', '--host', '-p', '--prompt', '-C', '--close-from', '-U', '--other-user', '-r', '--role',
                   '-t', '--type', '-D', '--chdir', '-R', '--chroot'},
          'xargs': {'-n', '--max-args', '-I', '--replace', '-L', '--max-lines', '-P', '--max-procs', '-d', '--delimiter', '-E', '--eof',
                    '-s', '--max-chars', '-a', '--arg-file'},
          'watch': {'-n', '--interval', '-d', '--differences'}, 'stdbuf': {'-i', '--input', '-o', '--output', '-e', '--error'}}

def substitutions(s):
    """The $(…) and backtick commands inside a double-quoted string."""
    out, i = [], 0
    while i < len(s):
        if s.startswith('$(', i) and not s.startswith('$((', i):
            depth, j = 1, i + 2
            while j < len(s) and depth:
                depth += {'(': 1, ')': -1}.get(s[j], 0)
                j += 1
            out.append(s[i + 2:j - 1])
            i = j
        elif s[i] == '`':
            j = s.find('`', i + 1)
            j = len(s) if j < 0 else j
            out.append(s[i + 1:j])
            i = j + 1
        else:
            i += 1
    return out

def exec_text(src):
    """The command with data removed: quoted text and heredoc bodies, except what bash would run."""
    out, lines, li, pending = [], src.split('\n'), 0, []
    while li < len(lines):
        line, i, seg = lines[li], 0, ''
        li += 1
        while i < len(line):
            ch = line[i]
            if ch == '\\':
                seg += line[i:i + 2]
                i += 2
            elif ch in '\'"':
                j, escapes = i + 1, ch == '"' or seg.endswith('$')  # $'…' (ANSI-C) honours backslash escapes
                while j < len(line) and line[j] != ch:
                    j += 2 if escapes and line[j] == '\\' else 1
                body = line[i + 1:j]
                i = j + 1
                if re.search(r'(?:^|[\s;&|(])(?:(?:\S*/)?(?:bash|sh|zsh|dash)(?:\s+-\w+)*\s+-\w*c\w*|eval)\s*$', seg):
                    seg += ' ' + body + ' ; '  # a string bash will run
                elif ch == '"':
                    seg += ' _ ' + ''.join(' ; ' + s + ' ; ' for s in substitutions(body))
                else:
                    seg += ' _ '
            elif line.startswith('<<', i) and not line.startswith('<<<', i) and line[i - 1:i] != '<' \
                    and seg.count('$((') <= seg.count('))'):
                m = re.match(r'<<(-?)\s*([\'"]?)([^\s\'"<>;&|()]+)\2', line[i:])
                if not m:
                    seg += '<<'
                    i += 2
                    continue
                last = re.split(r'[;&|()]', seg)[-1].split()
                head = next((w for w in last if not re.match(r'^[A-Za-z_]\w*=', w)), '')
                pending.append((m.group(3), m.group(1) == '-', m.group(2) != '', os.path.basename(head) in SHELLS))
                seg += ' '
                i += m.end()
            else:
                seg += ch
                i += 1
        out.append(seg)
        for delim, dash, quoted, shell in pending:  # heredoc bodies follow the line that opened them
            body = []
            while li < len(lines) and (lines[li].lstrip('\t') if dash else lines[li]) != delim:
                body.append(lines[li])
                li += 1
            li += 1
            if shell:
                out.extend(body)
            elif not quoted:
                out.extend(' ; '.join(substitutions(b)) for b in body)
        pending = []
    return '\n'.join(out)

def is_gt(c):
    i = 0
    while i < len(c):
        w = c[i]
        if re.match(r'^[A-Za-z_]\w*=', w) or w in KEYWORDS:
            i += 1
        elif w == 'function':
            i += 2
        elif w == 'eval':
            return found(' '.join(c[i + 1:]))
        elif os.path.basename(w) in SHELLS:
            rest = c[i + 1:]
            k = next((n for n, a in enumerate(rest) if re.match(r'^-\w*c\w*$', a)), None)
            return k is not None and k + 1 < len(rest) and found(rest[k + 1])
        elif w in VALUED:
            if w == 'command' and i + 1 < len(c) and c[i + 1] in ('-v', '-V'):
                return False  # a lookup, not a run
            i += 1
            while i < len(c) and c[i].startswith('-') and c[i] != '-':
                i += 2 if c[i] in VALUED[w] else 1
            if w == 'timeout':
                i += 1
        else:
            return os.path.basename(w) == 'gt'
    return False

def tokens_find(text):
    lex = shlex.shlex(re.sub(r'\\\n', ' ', text).replace('\n', ' ; ').replace('`', ' ; '), posix=True, punctuation_chars=';&|()<>')
    lex.whitespace_split = True
    lex.commenters = ''
    cur, skip, array, case, depth = [], False, False, False, 0
    for t in lex:
        if skip:
            skip = False
            if not (t and set(t) <= set(';&|()<>')):
                continue  # the redirect target; an operator (`2> >(…)`) is handled below
        if array:
            array = ')' not in t
            continue
        if t and set(t) <= set(';&|()<>'):
            if ('<' in t or '>' in t) and '(' not in t:  # a redirect: drop the fd number before it and the target after it
                if cur and cur[-1].isdigit():
                    cur.pop()
                skip = True
                continue
            if t.startswith('(') and cur and cur[-1].endswith('='):
                array = ')' not in t
                continue
            if case and t.startswith(')') and depth == 0:
                cur = []  # a case pattern
                continue
            if cur and cur[0] == 'case':
                case = True
            if 'esac' in cur:
                case = False
            if is_gt(cur):
                return True
            cur = []
            depth = max(0, depth + t.count('(') - t.count(')'))
        else:
            cur.append(t)
    return is_gt(cur)

def found(text):
    text = exec_text(text)
    if RAW.search(text):
        return True
    try:
        return tokens_find(text)
    except ValueError:
        return False  # unbalanced quoting: the raw check above already decided

try:
    hit = found(cmd)
except Exception:
    hit = bool(RAW.search(cmd))
print('gt' if hit else 'none')
PY
)
input=$(cat)
verdict=$(printf '%s' "$input" | python3 -c "$FIND" 2>/dev/null) || verdict=''
if [ -z "$verdict" ]; then
  # python failed: a plain match on the raw text decides
  printf '%s' "$input" | grep -qE '(^|[;&|(]|\$\(|`|\\n|[{!"]|then|do|else|xargs|env|command|time|nohup|exec|sudo|nice|timeout)[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*([^[:space:]]*/)?gt([[:space:]]|$|\\n|")' && verdict=gt
fi
if [ "$verdict" = gt ]; then
  echo "Blocked: Graphite (gt) is banned in this repo (FR-3391). Use 'gh stack' instead — see .claude/skills/gh-stack/SKILL.md." >&2
  exit 2
fi
exit 0
