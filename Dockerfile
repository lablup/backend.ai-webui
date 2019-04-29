# Use `make build_docker` to build this docker file.
# Building without Makefile will produce broken images.
FROM ubuntu:18.04

RUN apt-get update && \
  apt-get install -y nginx
#RUN apt-get update && \
#    apt-get install -y nodejs && \
#    apt-get install -y npm
ADD entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh && \
    mkdir /console
#RUN mkdir /wsproxy
RUN rm /etc/nginx/sites-enabled/default
COPY ./docker_build/nginx-site.conf /etc/nginx/sites-enabled/default
COPY ./build/bundle /console/
COPY ./config.js /console/config.js
#COPY ./src/wsproxy/dist/wsproxy.js /wsproxy/wsproxy.js
RUN service nginx restart
EXPOSE 80

STOPSIGNAL SIGTERM
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
