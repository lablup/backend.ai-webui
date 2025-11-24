#!/bin/bash
CURRENT_DIR="$(echo $PWD)"
cd "$(dirname "$0")"

../../node_modules/typescript/bin/tsc --target ES2017  --moduleResolution node backend.ai-client-node.ts
grep -v "Exclude for ES6" ./backend.ai-client-node.js > ./backend.ai-client-node-to-es6.js
# ../../node_modules/browserify/bin/cmd.js -p tinyify -s ai -o backend.ai-client-es6.js ./backend.ai-client-node-to-es6.js
#../../node_modules/browserify/bin/cmd.js -s ai -o backend.ai-client-ingen-es6.js ./backend.ai-client-ingen.js
rm ./backend.ai-client-node-to-es6.js

../../node_modules/typescript/bin/tsc --target ES2017 --moduleResolution node json_to_csv.ts
grep -v "Exclude for ES6" ./json_to_csv.js > ./json_to_csv-to-es6.js
rm ./json_to_csv-to-es6.js

cd $CURRENT_DIR
