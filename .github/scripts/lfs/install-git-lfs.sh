#!/usr/bin/env bash
# Make `git lfs` available without root: reuse an installed git-lfs, otherwise
# download the pinned release, verify its sha256 and install it into a user dir.
#
# Usage: dir="$(bash .github/scripts/lfs/install-git-lfs.sh)" && export PATH="$dir:$PATH"
#
# stdout carries only the directory holding `git-lfs` (empty when git-lfs is
# reachable without a PATH entry); progress goes to stderr. When $GITHUB_PATH is
# set the directory is also appended there for later workflow steps.
# GIT_LFS_INSTALL_DIR overrides the install directory.
set -euo pipefail

VERSION="3.8.1"
SHA256="e72cf723a4a660438862282e8aecf3885fc8123e88bfcad534cf6b941a354b75"
URL="https://github.com/git-lfs/git-lfs/releases/download/v${VERSION}/git-lfs-linux-amd64-v${VERSION}.tar.gz"
INSTALL_DIR="${GIT_LFS_INSTALL_DIR:-${XDG_DATA_HOME:-$HOME/.local/share}/git-lfs/v${VERSION}/bin}"

log() { echo "[install-git-lfs] $*" >&2; }

publish() {
  if [ -n "${GITHUB_PATH:-}" ] && [ -n "$1" ]; then
    echo "$1" >> "$GITHUB_PATH"
  fi
  echo "$1"
}

if git lfs version >/dev/null 2>&1; then
  log "already available: $(git lfs version)"
  found="$(command -v git-lfs 2>/dev/null || true)"
  publish "${found:+$(dirname "$found")}"
  exit 0
fi

if [ -x "${INSTALL_DIR}/git-lfs" ] && "${INSTALL_DIR}/git-lfs" version 2>/dev/null | grep -q "git-lfs/${VERSION} "; then
  log "reusing ${INSTALL_DIR}/git-lfs ($("${INSTALL_DIR}/git-lfs" version))"
  publish "$INSTALL_DIR"
  exit 0
fi

os="$(uname -s)"
arch="$(uname -m)"
if [ "$os" != "Linux" ] || [ "$arch" != "x86_64" ]; then
  log "git-lfs is not installed and this script only downloads it for Linux x86_64 (this is ${os} ${arch})."
  log "Install git-lfs yourself (https://git-lfs.com, e.g. 'brew install git-lfs'), then run 'git lfs install'."
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
tarball="${tmp}/git-lfs.tar.gz"

# Node (>= 18, global fetch) is the fallback: some CI images ship neither curl nor wget.
# shellcheck disable=SC2016  # JavaScript, not shell
NODE_DOWNLOAD='
const [url, out] = process.argv.slice(1);
(async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      require("fs").writeFileSync(out, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (err) {
      if (attempt >= 3) { console.error(String(err)); process.exit(1); }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
})();'

if command -v curl >/dev/null 2>&1; then
  log "downloading ${URL} (curl)"
  curl -fsSL --retry 3 --retry-delay 2 -o "$tarball" "$URL"
elif command -v wget >/dev/null 2>&1; then
  log "downloading ${URL} (wget)"
  wget -q --tries=3 -O "$tarball" "$URL"
elif command -v node >/dev/null 2>&1; then
  log "downloading ${URL} (node)"
  node -e "$NODE_DOWNLOAD" "$URL" "$tarball"
else
  log "none of curl, wget or node is available to download git-lfs."
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tarball" | cut -d' ' -f1)"
elif command -v shasum >/dev/null 2>&1; then
  actual="$(shasum -a 256 "$tarball" | cut -d' ' -f1)"
else
  actual="$(node -e 'process.stdout.write(require("crypto").createHash("sha256").update(require("fs").readFileSync(process.argv[1])).digest("hex"))' "$tarball")"
fi
if [ "$actual" != "$SHA256" ]; then
  log "sha256 mismatch for ${URL}"
  log "  expected ${SHA256}"
  log "  actual   ${actual}"
  exit 1
fi
log "sha256 verified (${SHA256})"

tar -xzf "$tarball" -C "$tmp"
binary="${tmp}/git-lfs-${VERSION}/git-lfs"
[ -f "$binary" ] || { log "git-lfs binary not found in the release tarball"; exit 1; }

mkdir -p "$INSTALL_DIR"
install -m 0755 "$binary" "${INSTALL_DIR}/git-lfs"
log "installed $("${INSTALL_DIR}/git-lfs" version) into ${INSTALL_DIR}"
publish "$INSTALL_DIR"
