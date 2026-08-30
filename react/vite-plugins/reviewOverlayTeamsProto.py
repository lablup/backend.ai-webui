#!/usr/bin/env python3
"""PROTOTYPE (FR-3791) — throwaway. Read a Teams thread's replies + reactions
as JSON for the review-overlay pins prototype. Read-only; no Graph writes.

Reuses the fw teams-workflow reader (parse_teams_url / get_token / fetch)
by path import. stdout: one JSON object; any failure -> {"error": "..."}.
"""

import json
import os
import sys
from pathlib import Path

READER_DIR = os.environ.get(
    "BAI_TEAMS_READER_DIR",
    "/home/ubuntu/Workspace/claude-mp/plugins/fw/skills/teams-workflow/scripts",
)
sys.path.insert(0, READER_DIR)

def out(obj):
    print(json.dumps(obj, ensure_ascii=False))
    sys.exit(0)

def main():
    if len(sys.argv) < 2:
        out({"error": "usage: reviewOverlayTeamsProto.py <teams-message-url>"})
    url = sys.argv[1]
    try:
        import httpx
        import teams_reader as tr
    except Exception as e:  # noqa: BLE001 — prototype: any import failure is terminal
        out({"error": f"import failed: {e}"})
    try:
        info = tr.parse_teams_url(url)
    except ValueError as e:
        out({"error": f"bad thread url: {e}"})

    tenant_id = os.environ.get("TEAMS_TENANT_ID") or info.get("tenant_id") or ""
    client_id = os.environ.get("TEAMS_CLIENT_ID", "")
    if not client_id:
        # Prototype fallback: the MSAL cache already knows which client it
        # belongs to — read it rather than requiring env plumbing.
        try:
            cache = json.loads(Path(tr.TOKEN_CACHE_FILE).read_text())
            for sec in ("RefreshToken", "AccessToken"):
                for v in cache.get(sec, {}).values():
                    if v.get("client_id"):
                        client_id = v["client_id"]
                        break
                if client_id:
                    break
        except Exception:  # noqa: BLE001
            pass
    if not tenant_id or not client_id:
        out({"error": "missing tenant/client id (env TEAMS_TENANT_ID/TEAMS_CLIENT_ID)"})

    try:
        token = tr.get_token(tenant_id, client_id, interactive=False)
    except Exception as e:  # noqa: BLE001
        out({"error": f"auth: {e}", "needsReauth": True})

    def slim(m):
        body = m.get("body") or {}
        return {
            "id": m.get("id"),
            "author": ((m.get("from") or {}).get("user") or {}).get("displayName"),
            "createdDateTime": m.get("createdDateTime"),
            "contentType": body.get("contentType"),
            "content": body.get("content") or "",
            "reactions": [
                {
                    "reactionType": r.get("reactionType"),
                    "displayName": r.get("displayName"),
                }
                for r in (m.get("reactions") or [])
            ],
        }

    try:
        with httpx.Client(
            headers={"Authorization": f"Bearer {token}"}, timeout=20.0
        ) as client:
            root = tr.fetch_message(
                client, info["team_id"], info["channel_id"], info["message_id"]
            )
            replies = tr.fetch_replies(
                client, info["team_id"], info["channel_id"], info["message_id"]
            )
    except Exception as e:  # noqa: BLE001
        out({"error": f"graph: {e}"})

    # Graph returns replies newest-first (FR-3789); normalize to oldest-first.
    replies = sorted(replies, key=lambda m: m.get("createdDateTime") or "")
    out({"root": slim(root), "replies": [slim(m) for m in replies]})

if __name__ == "__main__":
    main()
