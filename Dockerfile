FROM ubuntu:20.04
MAINTAINER Jeongkyu Shin <jshin@lablup.com>

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get install -y \
        ca-certificates \
        git-core \
        vim-tiny zip unzip \
        python3 python3-pip \
        libssl-dev \
        redis-server \
        mime-support && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/

ENV PYTHONUNBUFFERED=1 \
    PATH=/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    LANG=en_us.UTF-8

RUN git clone https://github.com/lablup/backend.ai-console-server.git /console-server
WORKDIR "/console-server"
RUN python3 -m pip install --no-cache-dir  -U -e . && \
    rm -rf /root/.cache && \
    rm -f /tmp/*.whl
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 2
RUN redis-server --daemonize yes

COPY ./build/rollup /console-server/src/ai/backend/console/static

ENV BACKEND_ENDPOINT_TYPE=api
ENTRYPOINT redis-server --daemonize yes && python3 -m ai.backend.console.server -f /console-server.conf
