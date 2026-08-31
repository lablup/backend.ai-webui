#!/bin/bash
# Claude Code statusline — line 1: worktree state + VS Code + Portless + Teams + Jira,
# line 2: model + token usage. Reads the session JSON on stdin.
#
# WHY IT LOOKS LIKE THIS
#   * Claude Code aborts the in-flight statusline on every refresh (300ms trailing
#     debounce), so a run must finish well under 300ms or it never renders while the
#     user is working. That budget is the whole design: exactly one python3 spawn
#     (this shim calls no coreutils — each is ~9ms on uutils) plus at most two git calls.
#     A healthy tick lands near 210ms. A repo whose git is pathologically slow is the
#     one case that overshoots, bounded by GIT_TOTAL_BUDGET and self-healing through
#     spawn_git_warm; that tick is aborted, which costs a frame, not correctness.
#   * Portless state is read straight from ~/.portless/{routes.json,proxy.port,proxy.tls};
#     the `portless` CLI is a workspace devDependency and is never on the statusline's
#     PATH. Route ownership is /proc/<pid>/cwd, which is also the liveness check.
#   * No network in the foreground. Jira is served from cache; a setsid-detached
#     refresher warms it (setsid, because the abort is a process-group SIGTERM).
#   * No `set -e`, and python3 runs as a CHILD (never `exec`): a run that COMPLETES
#     with empty stdout clears the statusline, while an abort merely freezes it.
#     Emitting something always beats exiting clean, so every python failure — even
#     one that only shows up after the interpreter has started — falls through to the
#     pure-bash tail at the bottom of this file.
#   * git runs WITHOUT --no-optional-locks so it may write the refreshed index back;
#     see the comment in git_facts() for the 25x this is worth on a stat-dirty tree.
#
# Requires (optional): ~/.config/atlassian/credentials with ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN.
# Jira field customfield_10176 = Teams thread URL.
# Env: CLAUDE_STATUSLINE_SSH_HOST (VS Code Remote-SSH host; prefer an ssh-config alias),
#      CLAUDE_STATUSLINE_CACHE_DIR, CLAUDE_STATUSLINE_DEBUG=1|2, CLAUDE_STATUSLINE_DEBUG_LOG,
#      PORTLESS_STATE_DIR / PORTLESS_HOME.
# Docs: https://docs.anthropic.com/en/docs/claude-code/statusline

IFS= read -r -d '' _PY <<'PYSRC'
import json
import os
import re
import socket
import subprocess
import sys
import time
import urllib.parse

T0 = time.monotonic()
CACHE_TTL = 300.0      # Jira cache freshness
ATTEMPT_TTL = 60.0     # floor between two refresher spawns for the same key
JIRA_BASE = "https://lablup.atlassian.net"
# git is the only thing that blocks, so its budget IS the script's worst case. The two
# calls share one deadline rather than each getting its own: sequential per-call
# timeouts sum, and a 0.4+0.6 worst case would overshoot the 300ms refresh debounce by
# more than 3x on exactly the pathological repo the timeouts exist for.
GIT_TOTAL_BUDGET = 0.8
GIT_REVPARSE_TIMEOUT = 0.4
GIT_STATUS_TIMEOUT = 0.6
GIT_MIN_TIMEOUT = 0.15
HOSTNAME_RE = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]{0,252}[A-Za-z0-9])?$")

LINE2 = ""
WROTE = False


def scrub(value):
    """Control characters would corrupt the OSC 8 sequences; data is never trusted."""
    if not isinstance(value, str):
        return ""
    return re.sub(r"[\x00-\x1f\x7f]", " ", value)


def link(url, text):
    return "\033]8;;%s\033\\%s\033]8;;\033\\" % (url, text)


def run_ex(args, timeout):
    """Every foreground subprocess is bounded here — timeout(1) costs ~110ms on uutils.

    Returns (stdout or None, timed_out): a timeout is not the same failure as a
    non-zero exit, because only a timeout means the child was killed mid-work and
    may need to be finished out-of-band (see spawn_git_warm)."""
    try:
        p = subprocess.run(
            args,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return None, True
    except Exception:
        return None, False
    if p.returncode != 0:
        return None, False
    return p.stdout.decode("utf-8", "replace"), False


def run(args, timeout):
    return run_ex(args, timeout)[0]


# ── line 2: model + tokens ────────────────────────────────────────────────
def render_line2(payload):
    model = "Unknown Model"
    try:
        model = scrub((payload.get("model") or {}).get("display_name")) or "Unknown Model"
    except Exception:
        pass
    model_str = "\033[36m%s\033[0m" % model
    try:
        cw = payload.get("context_window") or {}
        used = cw.get("used_percentage")
        cur = cw.get("current_usage") or {}
        inp = cur.get("input_tokens")
        out = cur.get("output_tokens")
        if used is not None:
            used_int = round(used)
            color = "\033[31m" if used_int >= 80 else "\033[33m" if used_int >= 50 else "\033[32m"
            detail = ""
            if inp is not None and out is not None:
                detail = " \033[90m(in:%s out:%s)\033[0m" % (inp, out)
            return "%s | Tokens: %s%.1f%% used\033[0m%s" % (model_str, color, used, detail)
    except Exception:
        pass
    return "%s | Tokens: \033[90mno data yet\033[0m" % model_str


# ── git: one rev-parse for the claim root, one status for everything else ──
def which(name):
    """Resolve once, by stat: execvp's PATH walk would cost a failed execve per miss."""
    for d in (os.environ.get("PATH") or "").split(os.pathsep):
        if not d:
            continue
        p = os.path.join(d, name)
        if os.access(p, os.X_OK) and not os.path.isdir(p):
            return p
    return None


def git_facts(workspace, cache_dir=""):
    if not workspace:
        return None
    git = which("git")
    if not git:
        return None
    base = [git, "-C", workspace]
    started = time.monotonic()
    top = run(base + ["rev-parse", "--show-toplevel"], GIT_REVPARSE_TIMEOUT)
    if top is None:
        return None
    top = top.strip()
    if not top:
        return None
    facts = {"top": top, "branch": "", "ahead": 0, "dirty": False,
             "untracked": False, "status_ok": False}
    # porcelain=v2 --branch yields branch, upstream divergence and worktree state in
    # ONE call, and (unlike diff-index) refreshes the index so a stat-dirty tree does
    # not report a false "uncommitted".
    #
    # Deliberately NOT --no-optional-locks / GIT_OPTIONAL_LOCKS=0: those forbid
    # writing the refreshed index back, so a stat-dirty tree re-hashes on every tick
    # forever — 1507-1758ms here, against 60ms once the index may be written.
    #
    # The in-flight marker is what lets a repo whose status never finishes heal: an
    # aborted tick dies ~300ms in, before this timeout, so it can schedule nothing
    # itself — but it leaves the marker, and the next tick acts on it.
    inflight = os.path.join(cache_dir, "git-inflight-" + slug(top)) if cache_dir else ""
    if inflight and os.path.exists(inflight) and age(inflight) < 600.0:
        spawn_git_warm(git, top, cache_dir)
    if inflight:
        stamp(inflight)
    st, timed_out = run_ex(
        base + ["status", "--porcelain=v2", "--branch", "--untracked-files=normal"],
        max(GIT_MIN_TIMEOUT,
            min(GIT_STATUS_TIMEOUT, GIT_TOTAL_BUDGET - (time.monotonic() - started))))
    if inflight:
        try:
            os.unlink(inflight)
        except Exception:
            pass
    if st is None:
        if timed_out:
            spawn_git_warm(git, top, cache_dir)
        return facts
    for ln in st.split("\n"):
        if ln.startswith("# branch.head "):
            # Seeing this line is what proves the output really is porcelain v2, so
            # a `git` shim that exits 0 with junk on stdout cannot render a green
            # "clean" tick out of nothing.
            facts["status_ok"] = True
            head = ln[14:].strip()
            facts["branch"] = "" if head == "(detached)" else head
        elif ln.startswith("# branch.ab "):
            m = re.search(r"\+(\d+)", ln)
            if m:
                facts["ahead"] = int(m.group(1))
        elif ln[:2] in ("1 ", "2 ", "u "):
            facts["dirty"] = True
        elif ln.startswith("? "):
            facts["untracked"] = True
    return facts


def render_indicator(facts):
    if not facts:
        return ""
    if not facts["status_ok"]:
        # A repo was found but its state could not be read. Rendering nothing here
        # would fail OPEN — absent reads as "nothing to report" — so say unknown.
        return "\033[90m?\033[0m"
    if facts["dirty"]:
        return "\033[91m⚠ uncommitted\033[0m"
    if facts["untracked"]:
        return "\033[91m⚠ untracked\033[0m"
    if facts["ahead"] > 0:
        return "\033[93m↑%d\033[0m" % facts["ahead"]
    return "\033[32m✓\033[0m"


# ── VS Code ────────────────────────────────────────────────────────────────
def render_vscode(workspace):
    if not workspace:
        return ""
    target = workspace
    try:
        names = sorted(e.name for e in os.scandir(workspace) if e.name.endswith(".code-workspace"))
        if names:
            target = os.path.join(workspace, names[0])
    except Exception:
        pass
    quoted = urllib.parse.quote(target, safe="/")
    host = os.environ.get("CLAUDE_STATUSLINE_SSH_HOST") or ""
    if not host:
        fields = (os.environ.get("SSH_CONNECTION") or "").split()
        if len(fields) >= 3 and fields[2]:
            user = os.environ.get("USER") or os.environ.get("LOGNAME") or ""
            host = ("%s@%s" % (user, fields[2])) if user else fields[2]
    if not host:
        # cc-daemon strips SSH_CONNECTION from every Claude process, so without this
        # the link would tell the user's laptop to open a path that only exists here.
        # gethostname() first: it is a pure syscall, getfqdn() may hit DNS.
        try:
            name = socket.gethostname() or ""
            if not name or name.startswith("localhost"):
                name = socket.getfqdn() or ""
        except Exception:
            name = ""
        if name and name not in ("localhost", "localhost.localdomain"):
            host = name
    if host:
        url = "vscode://vscode-remote/ssh-remote+%s%s" % (scrub(host), quoted)
    else:
        url = "vscode://file%s" % quoted
    return link(url, "⧉ VS Code")


# ── Portless ───────────────────────────────────────────────────────────────
def portless_state_dir():
    return (os.environ.get("PORTLESS_STATE_DIR")
            or os.environ.get("PORTLESS_HOME")
            or os.path.join(os.path.expanduser("~"), ".portless"))


def resolve_cwds(pids):
    """pid -> cwd, for the whole route table at once.

    On Linux each entry is a readlink, and a dead pid simply raises, so this doubles
    as the liveness check a stale routes.json needs. Everywhere else it is ONE lsof
    for the entire set (it takes a comma-separated pid list): one subprocess per route
    is the bottleneck this rewrite exists to remove, and macOS is where lsof is the
    only option."""
    found = {}
    if not pids:
        return found
    if os.path.isdir("/proc"):
        for pid in pids:
            try:
                found[pid] = os.path.realpath(os.readlink("/proc/%d/cwd" % pid))
            except Exception:
                pass
        return found
    out = run(["lsof", "-p", ",".join(str(p) for p in pids), "-a", "-d", "cwd", "-Fn"], 1.5)
    if not out:
        return found
    pid = None
    for ln in out.split("\n"):
        if ln.startswith("p"):
            try:
                pid = int(ln[1:])
            except ValueError:
                pid = None
        elif ln.startswith("n") and pid is not None:
            found.setdefault(pid, os.path.realpath(ln[1:]))
    return found
    raise OSError("no cwd")


def leaf_label(name):
    """The leading subdomain — `fr-3658` out of `fr-3658.backend-ai-webui.localhost`."""
    return (name or "").split(".")[0]


def delta_label(primary_leaf, leaf):
    """What distinguishes a second dev server from the representative one.

    Portless derives a route name from the app name or the worktree, so extra servers
    on the same tree are usually the primary plus a suffix (`fr-3658`, `fr-3658-alt`).
    Show just the suffix when that holds, and the whole name when it does not — an
    unrelated name carries no useful delta."""
    for sep in ("-", "_"):
        prefix = primary_leaf + sep
        if leaf.startswith(prefix) and len(leaf) > len(prefix):
            return leaf[len(prefix):]
    return leaf


def sub_label(rel, hostname):
    if rel.startswith("scripts/temp-releases/"):
        return "Release"
    if rel.startswith("packages/backend.ai-ui"):
        return "Storybook"
    if rel.startswith("packages/backend.ai-webui-docs"):
        # Auto-named routes prefix the worktree slug, so the flavor can be any label.
        labels = hostname.split(".")
        if "docs-html" in labels:
            return "Docs HTML"
        if "docs-web" in labels:
            return "Docs Web"
        return "Docs"
    return "Portless"


def portless_links(claim_root):
    state = portless_state_dir()
    routes = []
    try:
        with open(os.path.join(state, "routes.json"), "rb") as f:
            parsed = json.loads(f.read().decode("utf-8", "replace"))
        if isinstance(parsed, list):
            routes = parsed
    except Exception:
        pass
    # No default port: a link to the wrong port renders green and live while being
    # dead, which is worse than showing no Portless segment at all.
    port = ""
    try:
        with open(os.path.join(state, "proxy.port")) as f:
            v = f.read().strip()
        if v.isdigit() and 0 < int(v) < 65536:
            port = v
    except Exception:
        pass
    # proxy.tls is an EXISTENCE marker, not a value: portless writes "1" when TLS is on
    # and unlinks the file when it is off (readTlsMarker/writeTlsMarker, pinned 0.15.5).
    # Reading its contents would hand `proxy start --no-tls` an https link that is dead.
    scheme = "https" if os.path.exists(os.path.join(state, "proxy.tls")) else "http"

    stats = {"routes": len(routes), "matched": 0}
    if not claim_root or not port:
        return [], stats
    root = claim_root.rstrip("/")
    root_prefix = root + "/"
    worktrees_prefix = root + "/.claude/worktrees/"

    candidates = []
    for r in routes:
        if not isinstance(r, dict):
            continue
        hostname = scrub(r.get("hostname")).strip()
        # A hostname is the only part of the link that comes from a file; anything
        # that is not one would go into the URL verbatim, so require the shape.
        if not hostname or not HOSTNAME_RE.match(hostname):
            continue
        try:
            pid = int(r.get("pid"))
        except Exception:
            continue
        if pid <= 0:
            continue  # alias route: no owning process, so there is no cwd to match
        candidates.append((hostname, pid))

    cwds = resolve_cwds([pid for _, pid in candidates])

    roots, subs = [], []
    for hostname, pid in candidates:
        cwd = cwds.get(pid)
        if not cwd:
            continue
        # The route's own `port` is the upstream app port; only the proxy port routes.
        url = "%s://%s:%s" % (scheme, hostname, port)
        if cwd == root:
            roots.append((hostname, url))
        elif cwd.startswith(root_prefix) and not cwd.startswith(worktrees_prefix):
            # Sibling worktrees live under .claude/worktrees/ and belong to their own
            # sessions; without that exclusion a root session claims all of them.
            subs.append((sub_label(cwd[len(root_prefix):], hostname), url))

    # Sub-project routes already say what they are (Storybook / Docs / Release). Root
    # routes are all "the dev server", so n of them would render as n identical
    # "Portless" links: name the representative one, and reduce the rest to the part
    # of their subdomain that differs from it.
    roots.sort()
    matches = []
    if roots:
        want = leaf_label(os.path.basename(root))
        pick = next((i for i, (h, _) in enumerate(roots) if leaf_label(h) == want), 0)
        primary_host, primary_url = roots.pop(pick)
        matches.append(("Portless", primary_url))
        primary_leaf = leaf_label(primary_host)
        matches.extend(("+" + delta_label(primary_leaf, leaf_label(h)), u) for h, u in roots)
    matches.extend(subs)
    stats["matched"] = len(matches)
    return matches, stats


def render_portless(matches):
    # Nothing to click, nothing to show. A dim non-link "Portless" sits among segments
    # that ARE links and reads as a broken one — the question it prompts is "why can't
    # I click this", not "ah, no dev server here".
    if not matches:
        return ""
    return "  ".join(link(u, "\033[32m%s\033[0m" % lbl) for lbl, u in matches)


def prune_cache(cache_dir):
    """Sweep what previous versions left behind (the pid->cwd cache, whose pid reuse
    silently mislinked worktrees; the gh PR summaries) and expire the attempt stamps,
    which are one-per-key-forever otherwise."""
    now = time.time()
    try:
        for e in os.scandir(cache_dir):
            n = e.name
            stale = ((n.startswith("portless-pid-") and n.endswith(".cwd"))
                     or (n.startswith("pr-FR-") and n.endswith(".txt")))
            if not stale and (n.endswith(".attempt") or n.startswith("git-inflight-")):
                try:
                    stale = abs(now - e.stat().st_mtime) > 86400.0
                except Exception:
                    stale = False
            if stale:
                try:
                    os.unlink(e.path)
                except Exception:
                    pass
    except Exception:
        pass


# ── Jira / Teams ───────────────────────────────────────────────────────────
REFRESH = r'''
key=$1; cache=$2
cred="${ATLASSIAN_CRED_FILE:-$HOME/.config/atlassian/credentials}"
[ -f "$cred" ] && . "$cred"
[ -n "${ATLASSIAN_EMAIL:-}" ] && [ -n "${ATLASSIAN_API_TOKEN:-}" ] || exit 0
auth=$(printf '%s:%s' "$ATLASSIAN_EMAIL" "$ATLASSIAN_API_TOKEN" | base64 | tr -d '\n')
tmp="${cache}.tmp.$$"
# The credential arrives on stdin via --config, never in argv: /proc is readable by
# every other process on a dev box that runs dozens of agents.
code=$(printf 'header = "Authorization: Basic %s"\n' "$auth" \
  | curl -s -o "$tmp" -w '%{http_code}' --max-time 3 --config - \
  "https://lablup.atlassian.net/rest/api/3/issue/${key}?fields=summary,status,customfield_10176" \
  -H "Content-Type: application/json" 2>/dev/null) || code=000
case "$code" in
  200)
    if python3 -c 'import json,sys; sys.exit(0 if "fields" in json.load(open(sys.argv[1])) else 1)' "$tmp" 2>/dev/null; then
      mv -f "$tmp" "$cache"
    fi
    ;;
  401|403|404)
    # Definitive failure: never clobber a good cache, just gate the next attempt.
    if [ -s "$cache" ]; then touch "$cache"; else printf '{}' >"$tmp" && mv -f "$tmp" "$cache"; fi
    ;;
esac
rm -f "$tmp" 2>/dev/null
exit 0
'''


def mtime(path):
    try:
        return os.path.getmtime(path)
    except Exception:
        return 0.0


def age(path):
    """abs(): a future mtime — a clock step back after an NTP correction, a
    suspend/resume, a restored snapshot — must not freeze a cache forever."""
    return abs(time.time() - mtime(path))


def stamp(path):
    try:
        with open(path, "w"):
            pass
        return True
    except Exception:
        return False


def slug(path):
    return re.sub(r"[^A-Za-z0-9]+", "-", path or "").strip("-")[-100:]


def spawn_git_warm(git, top, cache_dir):
    """The foreground `git status` could not finish — it timed out, or an earlier tick
    was aborted mid-status. On a stat-dirty index that means git was killed before it
    could write the refreshed index back, so every following tick would re-hash the
    whole tree again, forever (1.6s a tick here, against 60ms once the index is
    written). Finish the refresh out-of-band instead (start_new_session, because the
    refresh abort is a process-group SIGTERM), at most once a minute per repo."""
    if not git or not top or not cache_dir:
        return False
    attempt = os.path.join(cache_dir, "git-refresh-" + slug(top) + ".attempt")
    if age(attempt) < ATTEMPT_TTL or not stamp(attempt):
        return False
    try:
        subprocess.Popen(
            [git, "-C", top, "update-index", "-q", "--refresh"],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    except Exception:
        return False
    return True


def spawn_refresh(key, cache_path):
    bash = which("bash")
    if not bash:
        return False
    # The attempt stamp is written before the spawn, so a hard failure costs one
    # curl per minute instead of one per tick.
    attempt = cache_path + ".attempt"
    if age(attempt) < ATTEMPT_TTL or not stamp(attempt):
        return False
    try:
        # start_new_session calls setsid(2) in the child: the refresh abort is a SIGTERM
        # to the whole process group, which kills `&disown` children but not a new
        # session. Doing it here rather than through a setsid(1) binary keeps the path
        # alive on macOS, which does not ship one. All fds to /dev/null so our exit
        # closes the consumer's stdout pipe immediately.
        subprocess.Popen(
            [bash, "-c", REFRESH, "_", key, cache_path],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    except Exception:
        return False
    return True


def jira_segments(branch, cache_dir):
    m = re.search(r"fr-(\d+)", branch or "", re.I)
    if not m:
        return "", ""
    key = "FR-%s" % m.group(1)
    cache_path = os.path.join(cache_dir, key + ".json")
    if age(cache_path) >= CACHE_TTL:
        spawn_refresh(key, cache_path)
    # Whatever the cache state, render what is there and keep going: the key alone is
    # already useful on tick 1, and an early return is what caused the three-tick warmup.
    summary = status = teams = ""
    try:
        with open(cache_path, "rb") as f:
            fields = (json.loads(f.read().decode("utf-8", "replace")) or {}).get("fields") or {}
        summary = scrub(fields.get("summary"))
        status = scrub((fields.get("status") or {}).get("name"))
        teams = scrub(fields.get("customfield_10176")).strip()
    except Exception:
        pass
    # https:// only: whoever can edit the field controls where a link labelled
    # "Teams" points, so at least deny non-https schemes.
    teams_part = link(teams, "Teams") if teams.startswith("https://") else ""
    jira_part = link("%s/browse/%s" % (JIRA_BASE, key), key)
    if status:
        jira_part += " (%s)" % status
    if summary:
        if len(summary) > 45:
            summary = summary[:42] + "..."
        jira_part += ": %s" % summary
    return teams_part, jira_part


# ── debug ──────────────────────────────────────────────────────────────────
def debug_log(level, payload, cache_dir, info):
    # Not /tmp, and 0600: level 2 dumps the whole payload, which carries the session
    # id, the transcript path, cost and rate-limit state.
    path = (os.environ.get("CLAUDE_STATUSLINE_DEBUG_LOG")
            or os.path.join(cache_dir or ".", "debug.log"))
    try:
        flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND
        if os.path.exists(path) and os.path.getsize(path) > 1048576:
            flags = os.O_WRONLY | os.O_CREAT | os.O_TRUNC
        ws = payload.get("workspace") or {}
        wt = payload.get("worktree") or {}
        with os.fdopen(os.open(path, flags, 0o600), "a") as f:
            f.write("%s sid=%s agent=%s cwd=%s wt=%s model=%s root=%s routes=%s matched=%s "
                    "total_ms=%.1f git_ms=%.1f portless_ms=%.1f\n" % (
                        time.strftime("%Y-%m-%dT%H:%M:%S"),
                        str(payload.get("session_id") or "")[:8],
                        payload.get("agent_type"), ws.get("current_dir"), wt.get("path"),
                        (payload.get("model") or {}).get("id"),
                        info.get("root"), info.get("routes"), info.get("matched"),
                        info.get("total_ms", 0.0), info.get("git_ms", 0.0),
                        info.get("portless_ms", 0.0)))
            if level == "2":
                f.write("  payload=%s\n" % json.dumps(payload, ensure_ascii=False))
    except Exception:
        pass


# ── main ───────────────────────────────────────────────────────────────────
def main():
    global LINE2, WROTE
    try:
        payload = json.loads(sys.stdin.read()) or {}
    except Exception:
        payload = {}
    if not isinstance(payload, dict):
        payload = {}

    LINE2 = render_line2(payload)  # computed first: it is the guaranteed fallback

    workspace = ""
    worktree = {}
    try:
        workspace = scrub((payload.get("workspace") or {}).get("current_dir")) or ""
        wt = payload.get("worktree")
        worktree = wt if isinstance(wt, dict) else {}
    except Exception:
        pass

    cache_dir = (os.environ.get("CLAUDE_STATUSLINE_CACHE_DIR")
                 or os.path.join(os.path.expanduser("~"), ".cache", "claude-statusline"))
    try:
        os.makedirs(cache_dir, exist_ok=True)
    except Exception:
        pass
    prune_cache(cache_dir)

    t = time.monotonic()
    facts = None
    try:
        facts = git_facts(workspace, cache_dir)
    except Exception:
        pass
    git_ms = (time.monotonic() - t) * 1000.0

    claim_root = ""
    try:
        # Inside a linked worktree --show-toplevel returns the worktree path, so this
        # one expression covers main checkout, worktree and any subdirectory of either.
        src = (facts or {}).get("top") or scrub(worktree.get("path")) or workspace
        if src:
            claim_root = os.path.realpath(src)
    except Exception:
        pass

    t = time.monotonic()
    try:
        matches, pstats = portless_links(claim_root)
    except Exception:
        matches, pstats = [], {"routes": 0, "matched": 0}
    portless_ms = (time.monotonic() - t) * 1000.0

    segments = []
    for producer in (
        lambda: render_indicator(facts),
        lambda: render_vscode(workspace),
        lambda: render_portless(matches),
    ):
        try:
            part = producer()
        except Exception:
            part = ""
        if part:
            segments.append(part)

    try:
        branch = (facts or {}).get("branch") or scrub(worktree.get("branch")) or ""
        teams_part, jira_part = jira_segments(branch, cache_dir)
        if teams_part:
            segments.append(teams_part)
        if jira_part:
            segments.append(jira_part)
    except Exception:
        pass

    line1 = "  ".join(segments)
    out = (line1 + "\n" + LINE2) if line1 else LINE2
    sys.stdout.write(out)
    WROTE = True

    level = os.environ.get("CLAUDE_STATUSLINE_DEBUG")
    if level in ("1", "2"):
        debug_log(level, payload, cache_dir, {
            "root": claim_root, "routes": pstats.get("routes"),
            "matched": pstats.get("matched"),
            "total_ms": (time.monotonic() - T0) * 1000.0,
            "git_ms": git_ms, "portless_ms": portless_ms,
        })


try:
    main()
except BaseException:
    pass
finally:
    try:
        if not WROTE:
            sys.stdout.write(LINE2 or "\033[36mUnknown Model\033[0m | Tokens: \033[90mno data yet\033[0m")
        sys.stdout.flush()
    except BaseException:
        pass
PYSRC

# Read the payload here, not in python: the fallback below needs it too, and it is
# a builtin, so it costs no process.
IFS= read -r -d '' _payload

# NOT `exec python3`: exec only falls through when the binary cannot be launched at
# all, so a python3 that starts and THEN dies (stale PYTHONHOME, a sitecustomize that
# raises) would have replaced this shell already — zero bytes out, and Claude Code
# keeps stale text on screen forever. Run it as a child and check what came back.
#   -I       isolated: ignore PYTHON* and user site-packages. Program is stdlib-only.
#   -X utf8  the program travels on argv and carries non-ASCII glyphs (⚠ ⧉ ✓), which
#            a C/POSIX LC_CTYPE can decode into neither argv nor stdout.
# `command -v` is a builtin: the guard costs no process and keeps stderr silent on a
# box without python3.
_out=""
if command -v python3 >/dev/null 2>&1; then
  if [ -n "${CLAUDE_STATUSLINE_DEBUG:-}" ]; then
    _out=$(printf '%s' "$_payload" | python3 -I -X utf8 -c "$_PY")
  else
    _out=$(printf '%s' "$_payload" | python3 -I -X utf8 -c "$_PY" 2>/dev/null)
  fi
fi
if [ -n "$_out" ]; then
  printf '%s' "$_out"
  exit 0
fi

# Last resort: no python3, or python3 died without producing anything. Pull the model
# name out of the payload with parameter expansion only — no subprocess, so this can
# never be the thing that breaks.
_model=""
case "$_payload" in
  *'"display_name"'*)
    _model="${_payload#*\"display_name\"}"          # ": "Opus 5 …", …
    _model="${_model#*:}"                            #  "Opus 5 …", …
    _model="${_model#"${_model%%[![:space:]]*}"}"    # drop leading whitespace
    case "$_model" in
      '"'*) _model="${_model#\"}"; _model="${_model%%\"*}" ;;
      *)    _model="" ;;
    esac
    ;;
esac
printf '\033[36m%s\033[0m | Tokens: \033[90mno data yet\033[0m' "${_model:-Unknown Model}"
