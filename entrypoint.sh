#!/bin/sh

cd /wsproxy
node ./wsproxy.js &
cd /console
python -m http.server

