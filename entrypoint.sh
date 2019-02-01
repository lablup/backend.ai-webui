#!/bin/sh

cd /serving
node ./wsproxy/local_proxy.js &
polymer serve --npm


