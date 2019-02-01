FROM ubuntu:18.04

RUN apt-get update && \
    apt-get install -y nodejs && \
    apt-get install -y npm

ADD entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh && \
    mkdir /serving
COPY . /serving/

RUN cd /serving && \
    npm install -g polymer-cli && \
    npm install && \
    cd /serving/wsproxy && \
    npm install

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
