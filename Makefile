EP = ./node_modules/electron-packager/bin/electron-packager.js ./build/electron-app --ignore=node_modules/electron-packager --ignore=.git --overwrite --ignore="\.git(ignore|modules)" --out=app
BUILD_DATE := $(shell date +%y%m%d)
BUILD_TIME := $(shell date +%H%m%S)
BUILD_VERSION := $(shell grep version package.json | head -1 | cut -c 15- | rev | cut -c 3- | rev)
REVISION_INDEX := $(shell git --no-pager log --pretty=format:%h -n 1)
site := $(or $(site),master)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

test_web:
	npm run server:d
test_electron:
	./node_modules/electron/cli.js . --dev
proxy:
	node ./src/wsproxy/local_proxy.js
run_tests:
	node ./node_modules/testcafe/bin/testcafe.js chrome tests
versiontag:
	echo '{ "package": "${BUILD_VERSION}", "build": "${BUILD_DATE}.${BUILD_TIME}", "revision": "${REVISION_INDEX}" }' > version.json
	sed -i -E 's/globalThis.packageVersion = "\(.*\)"/globalThis.packageVersion = "${BUILD_VERSION}"/g' index.html
	sed -i -E 's/"version": "\(.*\)"/"version": "${BUILD_VERSION}"/g' manifest.json
	sed -i -E 's/globalThis.buildVersion = "\(.*\)"/globalThis.buildVersion = "${BUILD_DATE}\.${BUILD_TIME}"/g' index.html
	sed -i -E 's/\<small class="sidebar-footer" style="font-size:9px;"\>\(.*\)\<\/small\>/\<small class="sidebar-footer" style="font-size:9px;"\>${BUILD_VERSION}.${BUILD_DATE}\<\/small\>/g' ./src/components/backend-ai-console.ts
compile_keepversion:
	npm run build
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
	cp ./main.js ./build/electron-app/main.js
	#cp ./main.electron-packager.js ./build/electron-app/main.js
	cp -Rp build/rollup build/electron-app/app
	cp -Rp build/rollup/resources build/electron-app
	cp -Rp build/rollup/manifest build/electron-app
	sed -i -E 's/\.\/dist\/components\/backend-ai-console.js/es6:\/\dist\/components\/backend-ai-console.js/g' build/electron-app/app/index.html
	mkdir -p ./build/electron-app/app/wsproxy
	cp ./src/wsproxy/dist/wsproxy.js ./build/electron-app/app/wsproxy/wsproxy.js
	mkdir -p ./build/electron-app/node_modules/markty
	mkdir -p ./build/electron-app/node_modules/markty-toml
	cp -Rp ./node_modules/markty ./build/electron-app/node_modules
	cp -Rp ./node_modules/markty-toml ./build/electron-app/node_modules
	#rm ./build/electron-app/node_modules/markty-toml/dist/marktytoml.js
	#cp ./node_modules/markty-toml/dist/marktytoml.es.js ./build/electron-app/node_modules/markty-toml/dist/marktytoml.js
	cp ./preload.js ./build/electron-app/preload.js
	#mkdir -p ./build/electron-app/app/wsproxy/config
	#cp ./wsproxy-config.js ./build/electron-app/app/wsproxy/config/default.json
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
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	$(EP) --platform=darwin --icon=manifest/backend-ai.icns
	rm -rf ./app/backend.ai-console-macos
	cd app; mv backend.ai-console-darwin-x64 backend.ai-console-macos;
	#cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-macos ./backend.ai-console-macos-$(BUILD_DATE).zip
	mv ./app/backend.ai-console-macos/backend.ai-console.app './app/backend.ai-console-macos/Backend.AI Console.app'
	./node_modules/electron-installer-dmg/bin/electron-installer-dmg.js './app/backend.ai-console-macos/Backend.AI Console.app' ./app/backend.ai-console-$(BUILD_DATE) --overwrite --icon=manifest/backend-ai.icns --title=Backend.AI
	mv ./app/backend.ai-console-$(BUILD_DATE).dmg ./app/backend.ai-console-$(BUILD_VERSION)-$(site).dmg
win: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	$(EP) --platform=win32 --icon=manifest/backend-ai.ico
	cd app; zip ./backend.ai-console-win32-x64-$(BUILD_DATE).zip -r ./backend.ai-console-win32-x64
	mv ./app/backend.ai-console-win32-x64-$(BUILD_DATE).zip ./app/backend.ai-console-x64-$(BUILD_VERSION)-$(site).zip
linux: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	$(EP) --platform=linux --icon=manifest/backend-ai.ico
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-linux-x64 ./backend.ai-console-linux-x64-$(BUILD_DATE).zip
	mv ./app/backend.ai-console-linux-x64-$(BUILD_DATE).zip ./app/backend.ai-console-linux-x64-$(BUILD_DATE)-$(site).zip
build_docker: compile
	docker build -t backend.ai-console:$(BUILD_DATE) .
pack:
	cd app; rm -rf ./backend*.zip
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-linux-x64 ./backend.ai-console-linux-x64-$(BUILD_DATE).zip
	cd app; mv backend.ai-console-darwin-x64 backend.ai-console-macos; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-macos ./backend.ai-console-macos-$(BUILD_DATE).zip
	cd app; ditto -c -k --sequesterRsrc --keepParent ./backend.ai-console-win32-x64 ./backend.ai-console-win32-x64-$(BUILD_DATE).zip
i18n:
	 ./node_modules/i18next-scanner/bin/cli.js --config ./i18n.config.js
clean:
	cd app;	rm -rf ./backend*
	cd build;rm -rf ./unbundle ./bundle ./rollup ./electron-app
