EP = electron-packager ./build/electron-app --ignore=node_modules/electron-packager --ignore=.git --overwrite --ignore="\.git(ignore|modules)" --out=app

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))


test:
	polymer build
	mkdir -p build/electron-app/wsproxy
	cp -Rp build/es6-unbundled build/electron-app/app
	rsync -av --progress ./wsproxy/ ./build/electron-app/wsproxy --exclude node_modules
	#cp -Rp ./wsproxy build/electron-app/wsproxy
	#rm -rf build/electron-app/wsproxy/node_modules
	cp ./wsproxy/package.json build/electron-app/package.json
	cd build/electron-app; npm install --only=prod
	cp ./main.electron-packager.js ./build/electron-app/main.js
test_web:
	node ./node_modules/polymer-cli/bin/polymer.js serve --npm
proxy:
	node ./wsproxy/local_proxy.js
compile:
	polymer build
all: dep mac win linux
dep: compile
	mkdir -p build/electron-app/wsproxy
	cp -Rp build/es6-unbundled build/electron-app/app
	rsync -av --progress ./wsproxy/ ./build/electron-app/wsproxy --exclude node_modules
	#cp -Rp ./wsproxy build/electron-app/wsproxy
	#rm -rf build/electron-app/wsproxy/node_modules
	cp ./wsproxy/package.json build/electron-app/package.json
	cd build/electron-app; npm install --only=prod
	cp ./main.electron-packager.js ./build/electron-app/main.js
mac: dep
	$(EP) --platform=darwin --icon=manifest/backend-ai.icns 
win: dep
	$(EP) --platform=win32 --icon=manifest/backend-ai.ico
linux: dep
	$(EP) --platform=linux --icon=manifest/backend-ai.ico
clean:
	cd app;	rm -rf ./backend*
	cd build;rm -rf ./es6-unbundled ./electron-app
