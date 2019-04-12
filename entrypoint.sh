#!/bin/sh

cd /wsproxy
node ./wsproxy.js &
cd /console
polymer serve --npm


