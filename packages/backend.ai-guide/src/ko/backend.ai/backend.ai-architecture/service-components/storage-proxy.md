---
title: 스토리지 프록시 (Storage Proxy)
order: 7
---
# Storage Proxy

Backend.AI Storage Proxy is a proxy to offload the large file transfers from the manager. It also provides an abstraction of underlying storage vendor’s acceleration APIs since many storage vendors offer vendor-specific APIs for filesystem operations like scanning of directories with millions of files. Using the storage proxy, we apply our abstraction models for such filesystem operations and quota management specialized to each vendor API.
