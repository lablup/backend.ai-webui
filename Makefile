EP = electron-packager ./build/electron-app --ignore=node_modules/electron-packager --ignore=.git --overwrite --ignore="\.git(ignore|modules)" --out=app
BUILD_DATE := $(shell date +%y%m%d)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

test:
	polymer build
	mkdir -p build/electron-app/wsproxy
	cp -Rp build/unbundle build/electron-app/app
	rsync -av --progress ./wsproxy/ ./build/electron-app/wsproxy --exclude node_modules
	cp ./wsproxy/package.json build/electron-app/package.json
	cd build/electron-app; npm install --only=prod
	cp ./main.electron-packager.js ./build/electron-app/main.js
test_web:
	node ./node_modules/polymer-cli/bin/polymer.js serve --npm
proxy:
	node ./src/wsproxy/local_proxy.js
compile:
	node ./node_modules/polymer-cli/bin/polymer.js build
	cd ./src/wsproxy; npx webpack --config webpack.config.js
all: dep mac win linux
dep: compile
	mkdir -p build/electron-app
	#rsync -av --progress ./src/wsproxy/ ./build/electron-app/wsproxy --exclude node_modules
	cp ./package.json ./build/electron-app/package.json
	cp ./main.electron-packager.js ./build/electron-app/main.js
	cp -Rp build/bundle build/electron-app/app
	cp ./src/wsproxy/dist/wsproxy.js ./build/electron-app/app/wsproxy.js
deploy: compile
    cd deploy; rm -rf ./*
    cp -Rp build/bundle deploy
mac: dep
	$(EP) --platform=darwin --icon=manifest/backend-ai.icns 
win: dep
	$(EP) --platform=win32 --icon=manifest/backend-ai.ico
linux: dep
	$(EP) --platform=linux --icon=manifest/backend-ai.ico
build_docker: compile
	docker build -t backend.ai-console:$(BUILD_DATE) .
pack:
	cd app; rm -rf ./backend*.zip
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-linux-x64 ./backend.ai-console-linux-x64-$(BUILD_DATE).zip
	cd app; mv backend.ai-console-darwin-x64 backend.ai-console-macos; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-macos ./backend.ai-console-macos-$(BUILD_DATE).zip
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-win32-x64 ./backend.ai-console-win32-x64-$(BUILD_DATE).zip
clean:
	cd app;	rm -rf ./backend*
	cd build;rm -rf ./unbundle ./bundle ./electron-app
