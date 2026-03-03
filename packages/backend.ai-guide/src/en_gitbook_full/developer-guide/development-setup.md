---
title: Development Setup
order: 149
---
# Development Setup

Currently Backend.AI is developed and tested under only \*NIX-compatible platforms (Linux or macOS).

The development setup uses a mono-repository for the backend stack and a side-by-side repository checkout of the frontend stack. In contrast, the production setup uses per-service independent virtual environments and relies on a separately provisioned app proxy pool.

There are three ways to run both the backend and frontend stacks for development, as demonstrated in Fig. 4, Fig. 5, and Fig. 6. The installation guide in this page using `scripts/install-dev.sh` covers all three cases because the only difference is that how you launch the Web UI from the mono-repo.

<figure><img src="../images/image (5).png" alt=""><figcaption><p>Fig. 4 A standard development setup of Backend.AI open source components</p></figcaption></figure>

<figure><img src="../images/image (2) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>Fig. 5 A development setup of Backend.AI open source components for Electron-based desktop app</p></figcaption></figure>

<figure><img src="../images/image (3) (1) (1) (1) (1).png" alt=""><figcaption><p>Fig. 6 A development setup of Backend.AI open source components with pre-built web UI from the <code>backend.ai-app</code> repository</p></figcaption></figure>







