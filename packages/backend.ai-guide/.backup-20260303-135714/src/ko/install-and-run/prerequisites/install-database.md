---
title: Install Prerequisites
order: 28
---
# Install Prerequisites

To install Backend.AI, PostgresSQL, Redis, and etcd environment should be prepared.

## PostgresSQL

Backend.AI makes use of PostgreSQL as its primary database to manage user information, enforce access control policies, and maintain persistent system states, such as agent and container tracking registries. To launch the service, generate the Docker Compose file located at `$HOME/halfstack/postgres-cluster-default/docker-compose.yaml` and populate it with the following YAML configuration.&#x20;

Volume paths and port settings can be adjusted as necessary. For the most [up-to-date configuration](https://github.com/lablup/backend.ai/blob/main/docker-compose.halfstack-main.yml), refer to the symbolic link provided and follow its target filename if needed.

```
x-base: &base
   logging:
      driver: "json-file"
      options:
         max-file: "5"
         max-size: "10m"

services:
   backendai-half-db:
      <<: *base
      image: postgres:16.3-alpine
      container_name: backendai-halfstack-db
      restart: unless-stopped
      command: >
         postgres
         -c "max_connections=256"
         -c "max_worker_processes=4"
         -c "deadlock_timeout=10s"
         -c "lock_timeout=60000"
         -c "idle_in_transaction_session_timeout=60000"
      environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=develove
         - POSTGRES_DB=backend
         - POSTGRES_INITDB_ARGS="--data-checksums"
      healthcheck:
         test: ["CMD", "pg_isready", "-U", "postgres"]
         interval: 10s
         timeout: 3s
         retries: 10
      volumes:
         - "${HOME}/.data/backend.ai/postgres-data/active:/var/lib/postgresql/data:rw"
      ports:
         - "8100:5432"
      networks:
         half_stack:
      cpu_count: 4
      mem_limit: "4g"

networks:
    half_stack:
```

Execute the following command to start the service container. The project `${USER}` is added for operational convenience.

```
$ cd ${HOME}/halfstack/postgres-cluster-default
$ docker compose up -d
$ # -- To terminate the container:
$ # docker compose down
$ # -- To see the container logs:
$ # docker compose logs -f
```

## Redis

Backend.AI employs Redis as both the message queue (event bus) and the cache backend. To launch the service, generate the Docker Compose file located at `$HOME/halfstack/redis-cluster-default/docker-compose.yaml` and populate it with the appropriate YAML configuration. Volume paths and port settings can be adjusted based on your requirements. For the [up-to-date configuration](https://github.com/lablup/backend.ai/blob/main/docker-compose.halfstack-main.yml), refer to the symbolic link provided and follow its target filename as needed.

```
x-base: &base
   logging:
      driver: "json-file"
      options:
         max-file: "5"
         max-size: "10m"

services:
   backendai-half-redis:
      <<: *base
      container_name: backendai-halfstack-redis
      image: redis:6.2-alpine
      restart: unless-stopped
      command: >
         redis-server
         --requirepass develove
         --appendonly yes
      volumes:
         - "${HOME}/.data/backend.ai/redis-data:/data:rw"
      healthcheck:
         test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
         interval: 10s
         timeout: 3s
         retries: 10
      ports:
         - "8110:6379"
      networks:
         - half_stack
      cpu_count: 1
      mem_limit: "2g"

networks:
   half_stack:
```

Execute the following command to start the service container. The project `${USER}` is added for operational convenience.

```
$ cd ${HOME}/halfstack/redis-cluster-default
$ docker compose up -d
$ # -- To terminate the container:
$ # docker compose down
$ # -- To see the container logs:
$ # docker compose logs -f
```

## etcd

Backend.AI makes use of etcd as the distributed configuration store. To launch the service, generate the Docker Compose file located at `$HOME/halfstack/etcd-cluster-default/docker-compose.yaml` and populate it with the appropriate YAML configuration. Volume paths and port settings can be modified as required. For the most [up-to-date configuration](https://github.com/lablup/backend.ai/blob/main/docker-compose.halfstack-main.yml), refer to the symbolic link provided and follow its target filename if necessary.

```
x-base: &base
   logging:
      driver: "json-file"
      options:
         max-file: "5"
         max-size: "10m"

services:
   backendai-half-etcd:
      <<: *base
      container_name: backendai-halfstack-etcd
      image: quay.io/coreos/etcd:v3.4.15
      restart: unless-stopped
      command: >
         /usr/local/bin/etcd
         --name etcd-node01
         --data-dir /etcd-data
         --listen-client-urls http://0.0.0.0:2379
         --advertise-client-urls http://0.0.0.0:8120
         --listen-peer-urls http://0.0.0.0:2380
         --initial-advertise-peer-urls http://0.0.0.0:8320
         --initial-cluster etcd-node01=http://0.0.0.0:8320
         --initial-cluster-token backendai-etcd-token
         --initial-cluster-state new
         --auto-compaction-retention 1
      volumes:
         - "${HOME}/.data/backend.ai/etcd-data:/etcd-data:rw"
      healthcheck:
         test: ["CMD", "etcdctl", "endpoint", "health"]
         interval: 10s
         timeout: 3s
         retries: 10
      ports:
         - "8120:2379"
         # - "8320:2380"  # listen peer (only if required)
      networks:
         - half_stack
      cpu_count: 1
      mem_limit: "1g"

networks:
   half_stack:
```

Execute the following command to start the service container. The project `${USER}` is added for operational convenience.

```
$ cd ${HOME}/halfstack/etcd-cluster-default
$ docker compose up -d
$ # -- To terminate the container:
$ # docker compose down
$ # -- To see the container logs:
$ # docker compose logs -f
```
