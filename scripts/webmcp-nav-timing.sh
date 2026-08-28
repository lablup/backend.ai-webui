#!/usr/bin/env bash
# FR-3750 prototype — call a navigation tool through the relay and measure the
# time until the tab visibly shows the expected text.
#   scripts/webmcp-nav-timing.sh <tool> '<json-args>' '<expected text>' [tab]
set -u
TOOL=$1; ARGS=$2; EXPECT=$3; TAB=${4:-0}
CTRL=http://127.0.0.1:9555
curl -s "$CTRL/console" >/dev/null
T0=$(date +%s%N)
node scripts/webmcp-client.mjs call "$TOOL" "$ARGS" 2>&1 | grep -v '^\[webmcp-local-relay\]' | cut -c1-400
T1=$(date +%s%N)
echo "call round-trip (incl. relay spawn+init): $(( (T1 - T0) / 1000000 ))ms"
for _ in $(seq 1 40); do
  if curl -s "$CTRL/text?tab=$TAB" | grep -q "$EXPECT"; then
    T2=$(date +%s%N)
    echo "visible '$EXPECT' at +$(( (T2 - T0) / 1000000 ))ms after call start; url=$(curl -s "$CTRL/url?tab=$TAB")"
    exit 0
  fi
  sleep 0.25
done
echo "NOT visible after 10s; url=$(curl -s "$CTRL/url?tab=$TAB")"
