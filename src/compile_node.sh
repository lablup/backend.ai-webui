#!/bin/bash
grep -v "Exclude for ES6" ./backend.ai-client-node.js > ./backend.ai-client-node-to-es6.js
browserify -s ai -o backend.ai-client-es6.js ./backend.ai-client-node-to-es6.js
browserify -s ai -o backend.ai-client-ingen-es6.js ./backend.ai-client-ingen.js
