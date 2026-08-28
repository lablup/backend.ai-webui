#!/usr/bin/env bash
# Probe: is the X-BackendAI-SessionID header value accepted as the AIOHTTP_SESSION cookie?
set -u
cd "$(dirname "$0")/../.."
set -a; . e2e/envs/.env.playwright; set +a
mask() { sed -E 's/(=[A-Za-z0-9_-]{6})[^;[:space:]]*/\1…/g; s/(SessionID: [A-Za-z0-9_-]{6})[^[:space:]]*/\1…/gI'; }
curl -s -D /tmp/h.txt -o /tmp/b.json -X POST "$E2E_WEBSERVER_ENDPOINT/server/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$E2E_ADMIN_EMAIL\",\"password\":\"$E2E_ADMIN_PASSWORD\"}"
echo "login body: $(head -c 200 /tmp/b.json)"
echo "login headers:"; grep -i "set-cookie\|sessionid" /tmp/h.txt | mask
SID=$(grep -i "X-BackendAI-SessionID" /tmp/h.txt | awk '{print $2}' | tr -d '\r')
COOKIE=$(grep -i "set-cookie" /tmp/h.txt | sed -E 's/.*AIOHTTP_SESSION=([^;]*).*/\1/' | tr -d '\r')
echo "SID len=${#SID}  cookie len=${#COOKIE}  equal=$([ "$SID" = "$COOKIE" ] && echo yes || echo no)"
echo "$SID" > /tmp/sid
Q='{"query":"query { user(email: \"admin@lablup.com\") { email username role } }"}'
echo "--- cookie(from header)+header"; curl -s -w "\nHTTP %{http_code}\n" -X POST "$E2E_WEBSERVER_ENDPOINT/func/admin/gql" -H 'Content-Type: application/json' -H "Cookie: AIOHTTP_SESSION=$SID" -H "X-BackendAI-SessionID: $SID" -d "$Q" | head -c 400
echo "--- cookie only"; curl -s -w "\nHTTP %{http_code}\n" -X POST "$E2E_WEBSERVER_ENDPOINT/func/admin/gql" -H 'Content-Type: application/json' -H "Cookie: AIOHTTP_SESSION=$SID" -d "$Q" | head -c 300
echo "--- header only"; curl -s -w "\nHTTP %{http_code}\n" -X POST "$E2E_WEBSERVER_ENDPOINT/func/admin/gql" -H 'Content-Type: application/json' -H "X-BackendAI-SessionID: $SID" -d "$Q" | head -c 300
echo "--- no auth"; curl -s -w "\nHTTP %{http_code}\n" -X POST "$E2E_WEBSERVER_ENDPOINT/func/admin/gql" -H 'Content-Type: application/json' -d "$Q" | head -c 300
echo "--- bogus id"; curl -s -w "\nHTTP %{http_code}\n" -X POST "$E2E_WEBSERVER_ENDPOINT/func/admin/gql" -H 'Content-Type: application/json' -H "Cookie: AIOHTTP_SESSION=bogus" -H "X-BackendAI-SessionID: bogus" -d "$Q" | head -c 300
