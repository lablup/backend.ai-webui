#!/usr/bin/env bash
# qa2-c: extract layout-container lines (gap / padding / stack) from legacy vs
# current for every table-bearing surface, and print only the files that differ.
set -u
cd "$(dirname "$0")/../.."

PAT='(<BAIFlex|<VStack|<HStack|<Stack|<BAICard|<Card |<Card$|gap=|padding=|paddingTop|styles=\{\{|direction=|align=|justify=)'

files=$(git grep -ln "BAITable" -- react/src packages/backend.ai-ui/src \
  | grep -v __generated__ | grep -v '\.stories\.' | grep -v '/locale/' \
  | grep -vE '\.(css|json)$' | sort)

for f in $files; do
  git show "origin/main:$f" > /tmp/qa2c_old.txt 2>/dev/null || continue
  grep -nE "$PAT" /tmp/qa2c_old.txt | sed 's/^[0-9]*://' | sed 's/^[[:space:]]*//' > /tmp/qa2c_old_l.txt
  grep -nE "$PAT" "$f" | sed 's/^[0-9]*://' | sed 's/^[[:space:]]*//' > /tmp/qa2c_new_l.txt
  if ! diff -q /tmp/qa2c_old_l.txt /tmp/qa2c_new_l.txt > /dev/null; then
    echo "###### $f"
    diff /tmp/qa2c_old_l.txt /tmp/qa2c_new_l.txt
    echo
  fi
done
