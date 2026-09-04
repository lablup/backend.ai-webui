Two things I noticed on the dev server, both on the deployments work:

Pin is 8px off and the tooltip is clipped.

> 📍 **Start › webui-header › button "Create Deployment"** · `c_ew7rxz4`
> ⚛️ in ActionItemContent (at /src/components/ActionItemContent.tsx:47)
>   in Button (@astryxdesign/core)
>   in StartPage (at /src/pages/StartPage.tsx)
> [Open on dev server](http://fr-3811.jongeun.10-82-0-159.sslip.io/project/default/session/start?tab=general#bai=v3.c_ew7rxz4.ZY5BTsMwEEWvEv0VlZwaSlTQSEWqyoYzUBaOM22MEjvYE5qoyt2R6QqxGb2R3p_5V3yDHhUSCO-NEVMKJ3HN7ogL16MrWzYNxyM-ipeiHkWCJy9tGU6lzAPfbVZQGEDQQwyfbEU3fDJjJzpxSi54ncREgcIXCGLq3Zk9R9NBQcwZhNvRvE4CwiGyES5eeejC3LPPUXEN6E8fKES2ArpiAt2vnzcKc4aHSuHyC1uFNkNVLQo2m970DMLeigv-Tbg_BC-3DylaUJ7ahn4Inr0k_U9cS5qoeqItluUH)
<!-- bai-review v3 id=c_ew7rxz4 pr=9330 at=2026-08-31T09:00:00Z -->

Placeholder still says "Search" after the filter is applied.

> 📍 **Sessions › vfolder-filter › input "Search"** · `c_6jcddj5`
> ⚛️ in BAIPropertyFilter (at /src/components/BAIPropertyFilter.tsx:118)
> [Open on dev server](http://fr-3811.jongeun.10-82-0-159.sslip.io/project/default/session?status=RUNNING#bai=v3.c_6jcddj5.ZY2xigIxFEV_RW4djcM28sBit1ixGRbFSrcIyZs1MiYx740o4r8vFjZaHu7hnhvOoA8DAWEbnLqxsmgM8x3OXe4D13EXe-W6w-8opjIoDAoIttR8YK82cOeGXq2wSMwJBicQRJ0OMl9t2nbZLmCg7g-E54NeFIQ1u-r3D4wB9BKEgQfdkNyRQfj6XP7UXLjq9fu5S_WPVPXW52PJiZOKfRMnKhdqmhk1U9zv_w)
<!-- bai-review v3 id=c_6jcddj5 pr=9330 at=2026-08-31T09:04:00Z -->

Can you fix both? The second one is the one that bugs me most.
