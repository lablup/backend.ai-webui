FROM ubuntu:20.04
LABEL maintainer="jshin@lablup.com" 

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get install -y \
        ca-certificates \
        git-core \
        vim-tiny zip unzip \
        python3.9 python3-pip \
        libssl-dev \
        redis-server \
        mime-support && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/

ENV PYTHONUNBUFFERED=1 \
    PATH=/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    LANG=en_us.UTF-8

RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 2
RUN git clone https://github.com/lablup/backend.ai-webserver.git /webserver
WORKDIR "/webserver"
RUN python3 -m pip install --no-cache-dir  -U -e . && \
    rm -rf /root/.cache && \
    rm -f /tmp/*.whl
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 2
RUN redis-server --daemonize yes

COPY ./build/web /webserver/src/ai/backend/web/static

ENV BACKEND_ENDPOINT_TYPE=api
ENTRYPOINT redis-server --daemonize yes && python3 -m ai.backend.web.server -f /webserver.conf
