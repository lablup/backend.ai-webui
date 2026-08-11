#!/usr/bin/env python3
"""Legacy-vs-before-vs-after table for the login dialog's header logo."""
import json

KEYS = [
    ("logo x from dialog left", lambda d: d["logoXFromDialogLeft"]),
    ("logo right gap", lambda d: d["logoRightGap"]),
    ("logo y from dialog top", lambda d: d["logoYFromDialogTop"]),
    ("centred?", lambda d: d["centred"]),
    ("logo x == form x", lambda d: d["logo"]["x"] == d["form"]["x"]),
    ("title slot width", lambda d: d["title"]["w"] if d.get("title") else None),
    ("title justify-content", lambda d: (d.get("titleInner") or {}).get("justifyContent")),
    ("dialog w x h", lambda d: f'{d["dialog"]["w"]}x{d["dialog"]["h"]}'),
    ("form x / w", lambda d: f'{d["form"]["x"]} / {d["form"]["w"]}'),
    ("logo -> form gap", lambda d: round(d["form"]["y"] - (d["logo"]["y"] + d["logo"]["h"]), 1)),
    ("page errors", lambda d: len(d.get("pageErrors", []))),
]

for mode in ("light", "dark"):
    cols = [
        ("legacy (antd)", json.load(open(f"/tmp/qa4-oracle-{mode}.json"))),
        ("before", json.load(open(f"/tmp/qa4-live-login-{mode}.json"))),
        ("after", json.load(open(f"/tmp/qa4-live-login-after-{mode}.json"))),
    ]
    print(f"\n### {mode.upper()}\n")
    w = max(len(k) for k, _ in KEYS) + 1
    print("| " + "metric".ljust(w) + "| " + " | ".join(n.ljust(16) for n, _ in cols) + " |")
    print("|" + "-" * (w + 1) + "|" + "|".join(["-" * 18] * len(cols)) + "|")
    for label, fn in KEYS:
        vals = []
        for _, d in cols:
            try:
                vals.append(str(fn(d)).ljust(16))
            except Exception:
                vals.append("n/a".ljust(16))
        print("| " + label.ljust(w) + "| " + " | ".join(vals) + " |")
