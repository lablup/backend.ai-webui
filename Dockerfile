# You should build the console for web first
# via `make compile`
FROM ubuntu:18.04

RUN apt-get update && \
    apt-get install -y nodejs && \
    apt-get install -y npm

ADD entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh && \
    mkdir /serving && \
    mkdir /wsproxy

COPY ./build/es6-unbundled /serving/
COPY ./wsproxy /wsproxy/

RUN cd /wsproxy && \
    npm install --only=prod

EXPOSE 8081 5050

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
