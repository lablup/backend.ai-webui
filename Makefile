EP = ./node_modules/electron-packager/bin/electron-packager.js ./build/electron-app --ignore=node_modules/electron-packager --ignore=.git --overwrite --asar --ignore="\.git(ignore|modules)" --out=app
BUILD_DATE := $(shell date +%y%m%d)
BUILD_TIME := $(shell date +%H%m%S)
BUILD_VERSION := $(shell grep version package.json | cut -c 15- | rev | cut -c 3- | rev)
site := $(or $(site),default)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

test_web:
	npm run server:d
test_electron:
	./node_modules/electron/cli.js .
proxy:
	node ./src/wsproxy/local_proxy.js
versiontag:
	sed -i -E 's/window.packageVersion = "\(.*\)"/window.packageVersion = "${BUILD_VERSION}"/g' index.html
	sed -i -E 's/window.buildVersion = "\(.*\)"/window.buildVersion = "${BUILD_DATE}\.${BUILD_TIME}"/g' index.html
	sed -i -E 's/\<small class="sidebar-footer" style="font-size:9px;"\>\(.*\)\<\/small\>/\<small class="sidebar-footer" style="font-size:9px;"\>${BUILD_VERSION}.${BUILD_DATE}\<\/small\>/g' ./src/components/backend-ai-console.ts
compile: versiontag
	npm run build
compile_wsproxy:
	cd ./src/wsproxy; npx webpack --config webpack.config.js
all: dep mac win linux
dep:
	if [ ! -d "./build/rollup/" ];then \
		make compile; \
		make compile_wsproxy; \
	fi
	rm -rf build/electron-app
	mkdir -p build/electron-app
	cp ./package.json ./build/electron-app/package.json
	cp ./main.electron-packager.js ./build/electron-app/main.js
	cp -Rp build/rollup build/electron-app/app
	cp -Rp build/rollup/resources build/electron-app
	cp -Rp build/rollup/manifest build/electron-app
	sed -i -E 's/\.\/dist\/components\/backend-ai-console.js/es6:\/\dist\/components\/backend-ai-console.js/g' build/electron-app/app/index.html
	mkdir -p ./build/electron-app/app/wsproxy
	cp ./src/wsproxy/dist/wsproxy.js ./build/electron-app/app/wsproxy/wsproxy.js
	cp ./preload.js ./build/electron-app/preload.js
	mkdir -p ./build/electron-app/app/wsproxy/config
	cp ./wsproxy-config.js ./build/electron-app/app/wsproxy/config/default.json
web:
	if [ ! -d "./build/rollup/" ];then \
		make compile; \
	fi
	mkdir -p ./deploy/$(site)
	cd deploy/$(site); rm -rf ./*; mkdir console
	cp -Rp build/rollup/* deploy/$(site)/console
	cp ./configs/$(site).toml deploy/$(site)/console/config.toml
	if [ -f "./configs/$(site).css" ];then \
		cp ./configs/$(site).css deploy/$(site)/console/resources/custom.css; \
	fi
mac: dep
	$(EP) --platform=darwin --icon=manifest/backend-ai.icns
	cd app; mv backend.ai-console-darwin-x64 backend.ai-console-macos;
	#cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-macos ./backend.ai-console-macos-$(BUILD_DATE).zip
	./node_modules/electron-installer-dmg/bin/electron-installer-dmg.js ./app/backend.ai-console-macos/backend.ai-console.app ./app/backend.ai-$(BUILD_DATE) --overwrite --icon=manifest/backend-ai.icns --title=Backend.AI
win: dep
	$(EP) --platform=win32 --icon=manifest/backend-ai.ico
	#cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-win32-x64 ./backend.ai-console-win32-x64-$(BUILD_DATE).zip
	cd app; zip ./backend.ai-console-win32-x64-$(BUILD_DATE).zip -r ./backend.ai-console-win32-x64
linux: dep
	$(EP) --platform=linux --icon=manifest/backend-ai.ico
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-linux-x64 ./backend.ai-console-linux-x64-$(BUILD_DATE).zip
build_docker: compile
	docker build -t backend.ai-console:$(BUILD_DATE) .
pack:
	cd app; rm -rf ./backend*.zip
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-linux-x64 ./backend.ai-console-linux-x64-$(BUILD_DATE).zip
	cd app; mv backend.ai-console-darwin-x64 backend.ai-console-macos; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-macos ./backend.ai-console-macos-$(BUILD_DATE).zip
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-win32-x64 ./backend.ai-console-win32-x64-$(BUILD_DATE).zip
clean:
	cd app;	rm -rf ./backend*
	cd build;rm -rf ./unbundle ./bundle ./rollup ./electron-app
