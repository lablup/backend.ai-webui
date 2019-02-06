#!/bin/sh

cd /wsproxy
node ./wsproxy/local_proxy.js &
polymer serve --npm


