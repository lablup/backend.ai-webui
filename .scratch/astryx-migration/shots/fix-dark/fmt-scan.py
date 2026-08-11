import json
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    print("  (no json)")
    sys.exit()
if not data:
    print("  clean")
for h in data:
    rule = (h.get("rules") or [""])[-1][:90]
    print(
        "  -",
        h["tag"],
        h["size"],
        "bg=" + h["bg"],
        "inline=" + str(h["inlineBg"]),
        "|",
        h["cls"][:60],
        "|",
        rule,
    )
