#!/usr/bin/env python3
"""Render the legacy-vs-current comparison table for the header user menu.

Usage: qa4-table.py <legacy.json> <current.json> [<after.json>]
Each file is a `qa4-menu-metrics.mjs` capture.
"""
import json
import sys


def load(p):
    with open(p) as f:
        return json.load(f)


def rows(d):
    s, m, it = d["surface"], d["menu"], d["items"]
    enabled = next((i for i in it if not i["disabled"]), it[0] if it else {})
    disabled = next((i for i in it if i["disabled"]), {})
    dv = d["dividers"][0] if d["dividers"] else {}
    gaps = [g for g in d["rowGaps"] if g >= 0]
    # the modal row gap between two ADJACENT items (ignore divider straddles)
    adj = min(gaps) if gaps else None
    return {
        "panel w": s["w"],
        "panel h": s["h"],
        "panel pad": m["pad"],
        "panel radius": s["radius"],
        "panel bg": s["bg"],
        "panel shadow": s["shadow"][:58],
        "panel max-height": m["maxHeight"],
        "panel scrolls": d["scrolls"],
        "content height": d["contentHeight"],
        "row gap": adj,
        "item h": enabled.get("h"),
        "item pad": enabled.get("pad"),
        "item radius": enabled.get("radius"),
        "item font": enabled.get("labelFont"),
        "item weight": enabled.get("labelWeight"),
        "item color": enabled.get("labelColor"),
        "disabled color": disabled.get("labelColor"),
        "disabled opacity": disabled.get("opacity"),
        "icon w": enabled.get("iconW"),
        "icon->label gap": enabled.get("iconLabelGap"),
        "icon x from panel": enabled.get("iconXFromPanel"),
        "label x from panel": enabled.get("labelXFromPanel"),
        "divider h": dv.get("h"),
        "divider margin": dv.get("margin"),
        "divider inset L/R": f"{dv.get('insetLeft')}/{dv.get('insetRight')}",
        "offset from trigger": d["offsetFromTrigger"],
        "right-align delta": d["rightAlignDelta"],
        "page errors": len(d.get("pageErrors", [])),
    }


files = sys.argv[1:]
names = ["legacy (antd)", "before", "after"][: len(files)]
data = [rows(load(f)) for f in files]

w = max(len(k) for k in data[0]) + 1
hdr = "| " + "metric".ljust(w) + "| " + " | ".join(n.ljust(30) for n in names) + " |"
print(hdr)
print("|" + "-" * (w + 1) + "|" + "|".join(["-" * 32] * len(names)) + "|")
for k in data[0]:
    vals = [str(d[k]).ljust(30) for d in data]
    mark = "" if len(data) < 2 or all(str(d[k]) == str(data[0][k]) for d in data[1:]) else ""
    print("| " + (k + mark).ljust(w) + "| " + " | ".join(vals) + " |")
