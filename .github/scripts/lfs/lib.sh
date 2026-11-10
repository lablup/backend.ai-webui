# shellcheck shell=bash
# Shared helpers for the Git LFS scripts in this directory. Source, don't run.

LFS_POINTER_HEADER="version https://git-lfs.github.com/spec/v1"

# Docs source roots relative to a checkout: the package on normal branches, the
# repository root on `docs-archive/*` branches. Prints the ones present.
lfs_docs_roots() {
  local top="$1" root
  for root in packages/backend.ai-webui-docs/src src; do
    if [ -f "${top}/${root}/book.config.yaml" ]; then
      echo "$root"
    fi
  done
}

# Files under the given directories that are Git LFS pointer text (at most
# 1024 bytes, first line is the spec header). Prints one path per line.
lfs_find_pointer_files() {
  local f line
  [ $# -gt 0 ] || return 0
  while IFS= read -r -d '' f; do
    line=""
    IFS= read -r line < "$f" || true
    if [ "${line%$'\r'}" = "$LFS_POINTER_HEADER" ]; then
      printf '%s\n' "$f"
    fi
  done < <(find "$@" -type f -size -1025c -print0 2>/dev/null)
}

# Reads a blob of at most 1024 bytes on stdin; succeeds when it is a
# well-formed Git LFS pointer (header first, `oid sha256:…` and `size N`).
lfs_is_valid_pointer() {
  local line has_oid=0 has_size=0
  IFS= read -r line || return 1
  [ "$line" = "$LFS_POINTER_HEADER" ] || return 1
  while IFS= read -r line; do
    if [[ "$line" =~ ^oid\ sha256:[0-9a-f]{64}$ ]]; then
      has_oid=1
    elif [[ "$line" =~ ^size\ [0-9]+$ ]]; then
      has_size=1
    elif [[ ! "$line" =~ ^[a-z0-9.-]+\ [^[:space:]].*$ ]]; then
      return 1
    fi
  done
  [ "$has_oid" -eq 1 ] && [ "$has_size" -eq 1 ]
}
