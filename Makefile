EP = electron-packager ./build/electron-app --ignore=node_modules/electron-packager --ignore=.git --overwrite --ignore="\.git(ignore|modules)" --out=app

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))


test:
	polymer build
	mkdir build/electron-app
	cp -Rp build/es6-unbundled build/electron-app/app
	cp -Rp ./wsproxy build/electron-app/wsproxy
	rm -rf build/electron-app/wsproxy/node_modules
	cp ./wsproxy/package.json build/electron-app/package.json
	cd build/electron-app; npm install --only=prod
	cp ./main.electron-packager.js ./build/electron-app/main.js
all: dep mac
dep:
	polymer build
	mkdir build/electron-app
	cp -Rp build/es6-unbundled build/electron-app/app
	cp -Rp ./wsproxy build/electron-app/wsproxy
	rm -rf build/electron-app/wsproxy/node_modules
	cp ./wsproxy/package.json build/electron-app/package.json
	cd build/electron-app; npm install --only=prod
	cp ./main.electron-packager.js ./build/electron-app/main.js
mac: dep
	$(EP) --platform=darwin --icon=manifest/backend-ai.icns 
win: dep
	$(EP) --platform=win32 --icon=manifest/backend-ai.ico
clean:
	cd app;	rm -rf ./backend*
	cd build;rm -rf ./es6-unbundled ./electron-app
