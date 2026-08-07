# Visual comparison report (antd → Astryx)

- before: `.scratch/astryx-migration/shots/06/before-antd`
- after:  `.scratch/astryx-migration/shots/06/after-bai`
- judgment basis: **layout anatomy + token compliance** — pixel equality is a non-goal
- box tolerance: 16px, ignored keys: `^(div#(antd|bai)|h3:)`

## light — REVIEW

- landmarks: before 52 / after 52 / matched 45
- anatomy: missing 7, extra 7, order inversions 0, moved beyond tolerance 2
- token compliance: before 79/184 (42.9%) → after 114/193 (59.1%)
- MISSING in after: `label:Metric source`, `label:Metric name`, `label:Condition`, `label:Step size`, `label:Rule name`, `label:Cooldown (seconds)`, `label:Key`
- EXTRA in after: `label:*Metric source`, `label:*Metric name`, `label:*Condition`, `label:*Step size`, `label:*Rule name`, `label:*Cooldown (seconds)`, `label:*Key`
- moved:
  - `label:Enabled`: (33,590 67×22) → (33,590 1374×22)
  - `label:Value`: (704,787 50×22) → (704,787 663×22)

screenshots: `.scratch/astryx-migration/shots/06/before-antd/light.png` vs `.scratch/astryx-migration/shots/06/after-bai/light.png`

## dark — REVIEW

- landmarks: before 52 / after 52 / matched 45
- anatomy: missing 7, extra 7, order inversions 0, moved beyond tolerance 2
- token compliance: before 70/184 (38.0%) → after 105/193 (54.4%)
- MISSING in after: `label:Metric source`, `label:Metric name`, `label:Condition`, `label:Step size`, `label:Rule name`, `label:Cooldown (seconds)`, `label:Key`
- EXTRA in after: `label:*Metric source`, `label:*Metric name`, `label:*Condition`, `label:*Step size`, `label:*Rule name`, `label:*Cooldown (seconds)`, `label:*Key`
- moved:
  - `label:Enabled`: (33,590 67×22) → (33,590 1374×22)
  - `label:Value`: (704,787 50×22) → (704,787 663×22)

screenshots: `.scratch/astryx-migration/shots/06/before-antd/dark.png` vs `.scratch/astryx-migration/shots/06/after-bai/dark.png`
