#!/usr/bin/env bash
# PreToolUse hook: block Graphite (gt) CLI invocations.
#
# Graphite is banned in this repository (FR-3391) — stacked-PR work goes
# through GitHub Stacked PRs (`gh stack`; see .claude/skills/gh-stack/).
# The permissions deny rule in .claude/settings.json covers plain `gt ...`
# commands; this hook blocks when either check finds gt as a command word:
# - the command tokenised (shlex): the first word of any simple command, behind
#   assignments, redirects, env / command / time / nohup / exec / sudo / nice /
#   timeout / xargs (and their options), `!`, `{`, if/then/do/else/while, a function body,
#   or as a path (`/x/gt`); array literals, case patterns and `command -v gt` are not commands;
# - the raw text: gt after a separator, `$(`, a backtick or one of those prefix words,
#   which also covers `$(gt …)` in double quotes and `bash -c '…; gt …'`.
# `-gt` numeric comparisons and substrings like `mgt` do not trigger it.

FIND=$(cat <<'PY'
import json, os, re, shlex, sys
cmd = json.load(sys.stdin).get('tool_input', {}).get('command', '')
WORDS = 'then|do|else|elif|if|while|until|xargs|env|command|time|nohup|exec|sudo|nice|timeout'
RAW = re.compile(r'(?:^|[;&|]|\$\(|`|\b(?:' + WORDS + r')\b)[ \t]*(?:[A-Za-z_]\w*=\S*[ \t]+)*(?:\S*/)?gt(?:\s|$)', re.M)
KEYWORDS = {'!', '{', 'then', 'do', 'else', 'elif', 'if', 'while', 'until'}
# prefix command -> its options that take a separate value; timeout also takes a duration
VALUED = {'env': {'-u', '--unset', '-C', '--chdir', '-S', '--split-string'}, 'command': set(), 'time': {'-f', '-o', '--format', '--output'},
          'nohup': set(), 'exec': {'-a'}, 'nice': {'-n', '--adjustment'}, 'timeout': {'-s', '--signal', '-k', '--kill-after'},
          'sudo': {'-u', '-g', '-h', '-p', '-C', '-U', '-r', '-t', '-D', '-R'},
          'xargs': {'-n', '-I', '-L', '-P', '-d', '-E', '-s', '-a', '--max-args', '--replace', '--max-lines', '--max-procs', '--delimiter'}}

def is_gt(c):
    i = 0
    while i < len(c):
        w = c[i]
        if re.match(r'^[A-Za-z_]\w*=', w) or w in KEYWORDS:
            i += 1
        elif w == 'function':
            i += 2
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

def tokens_find():
    lex = shlex.shlex(re.sub(r'\\\n', ' ', cmd).replace('\n', ' ; ').replace('`', ' ; '), posix=True, punctuation_chars=';&|()<>')
    lex.whitespace_split = True
    lex.commenters = ''
    cur, skip, array, case = [], False, False, False
    for t in lex:
        if skip:
            skip = False
            continue
        if array:
            array = ')' not in t
            continue
        if t and set(t) <= set(';&|()<>'):
            if '<' in t or '>' in t:  # a redirect: drop the fd number before it and the target after it
                if cur and cur[-1].isdigit():
                    cur.pop()
                skip = True
                continue
            if t.startswith('(') and cur and cur[-1].endswith('='):
                array = ')' not in t
                continue
            if case and t.startswith(')'):
                cur = []  # a case pattern
                continue
            if cur and cur[0] == 'case':
                case = True
            if cur and cur[-1:] == ['esac'] or cur[:1] == ['esac']:
                case = False
            if is_gt(cur):
                return True
            cur = []
        else:
            cur.append(t)
    return is_gt(cur)

found = bool(RAW.search(cmd))
if not found:
    try:
        found = tokens_find()
    except ValueError:
        pass  # unbalanced quoting: the raw check above already decided
print('gt' if found else 'none')
PY
)
verdict=$(python3 -c "$FIND" 2>/dev/null) || exit 0
if [ "$verdict" = gt ]; then
  echo "Blocked: Graphite (gt) is banned in this repo (FR-3391). Use 'gh stack' instead — see .claude/skills/gh-stack/SKILL.md." >&2
  exit 2
fi
exit 0
