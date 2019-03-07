#!/bin/bash
browserify -s ai -o backend.ai-client-es6.js ./backend.ai-client-node.js
browserify -s ai -o backend.ai-client-ingen-es6.js ./backend.ai-client-ingen.js
