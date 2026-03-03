---
title: 데이터베이스 설치하기
order: 26
---
# 데이터베이스 설치하기

## PostgresSQL

Backend.AI makes use of PostgreSQL as its main database. Launch the service using docker compose by generating the file `$HOME/halfstack/postgres-cluster-default/docker-compose.yaml` and populating it with the following YAML. Feel free to adjust the volume paths and port settings. Please refer [the latest configuration](https://github.com/lablup/backend.ai/blob/main/docker-compose.halfstack-main.yml) (it’s a symbolic link so follow the filename in it) if needed.

```yaml
x-base: &base
   logging:
      driver: "json-file"
      options:
         max-file: "5"
         max-size: "10m"

services:
   backendai-pg-active:
      <<: *base
      image: postgres:15.1-alpine
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

<pre><code>cd ${HOME}/halfstack/postgres-cluster-default
docker compose up -d
# -- To terminate the container:
<strong># docker compose down
</strong># -- To see the container logs:
# docker compose logs -f
</code></pre>

## Redis

Backend.AI makes use of Redis as its main cache service. Launch the service using docker compose by generating the file `$HOME/halfstack/redis-cluster-default/docker-compose.yaml` and populating it with the following YAML. Feel free to adjust the volume paths and port settings. Please refer [the latest configuration](https://github.com/lablup/backend.ai/blob/main/docker-compose.halfstack-main.yml) (it’s a symbolic link so follow the filename in it) if needed.

```yaml
x-base: &base
   logging:
      driver: "json-file"
      options:
         max-file: "5"
         max-size: "10m"

services:
   backendai-halfstack-redis:
      <<: *base
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
cd ${HOME}/halfstack/redis-cluster-default
docker compose up -d
# -- To terminate the container:
# docker compose down
# -- To see the container logs:
# docker compose logs -f
```

## etcd

Backend.AI makes use of Etcd as its main config service. Launch the service using docker compose by generating the file `$HOME/halfstack/etcd-cluster-default/docker-compose.yaml` and populating it with the following YAML. Feel free to adjust the volume paths and port settings. Please refer [the latest configuration](https://github.com/lablup/backend.ai/blob/main/docker-compose.halfstack-main.yml) (it’s a symbolic link so follow the filename in it) if needed.

```yaml
x-base: &base
   logging:
      driver: "json-file"
      options:
         max-file: "5"
         max-size: "10m"

services:
   backendai-halfstack-etcd:
      <<: *base
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
cd ${HOME}/halfstack/etcd-cluster-default
docker compose up -d
# -- To terminate the container:
# docker compose down
# -- To see the container logs:
# docker compose logs -f
```



