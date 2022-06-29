BUILD_DATE := $(shell date +%y%m%d)
BUILD_TIME := $(shell date +%H%m%S)
BUILD_VERSION := $(shell grep version package.json | head -1 | cut -c 15- | rev | cut -c 3- | rev)
REVISION_INDEX := $(shell git --no-pager log --pretty=format:%h -n 1)
site := $(or $(site),main)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

KEYCHAIN_NAME := bai-build-$(shell uuidgen).keychain
BAI_APP_SIGN_KEYCHAIN_FILE := $(shell mktemp -d)/keychain.p12
BAI_APP_SIGN_KEYCHAIN =

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
	sed -i -E 's/\<small class="sidebar-footer" style="font-size:9px;"\>\(.*\)\<\/small\>/\<small class="sidebar-footer" style="font-size:9px;"\>${BUILD_VERSION}.${BUILD_DATE}\<\/small\>/g' ./src/components/backend-ai-webui.ts
compile_keepversion:
	npm run build
compile: versiontag
	npm run build
compile_wsproxy:
	cd ./src/wsproxy; npx webpack --config webpack.config.js
	#cd ./src/wsproxy; rollup -c rollup.config.ts
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
	cp -Rp build/rollup build/electron-app/app
	cp -Rp build/rollup/resources build/electron-app
	cp -Rp build/rollup/manifest build/electron-app
	sed -i -E 's/\.\/dist\/components\/backend-ai-webui.js/es6:\/\dist\/components\/backend-ai-webui.js/g' build/electron-app/app/index.html
	mkdir -p ./build/electron-app/app/wsproxy
	cp ./src/wsproxy/dist/wsproxy.js ./build/electron-app/app/wsproxy/wsproxy.js
	mkdir -p ./build/electron-app/node_modules/markty
	mkdir -p ./build/electron-app/node_modules/markty-toml
	cp -Rp ./node_modules/markty ./build/electron-app/node_modules
	cp -Rp ./node_modules/markty-toml ./build/electron-app/node_modules
	cp ./preload.js ./build/electron-app/preload.js
web:
	if [ ! -d "./build/rollup/" ];then \
		make compile; \
	fi
	mkdir -p ./deploy/$(site)
	cd deploy/$(site); rm -rf ./*; mkdir webui
	cp -Rp build/rollup/* deploy/$(site)/webui
	cp ./configs/$(site).toml deploy/$(site)/webui/config.toml
	if [ -f "./configs/$(site).css" ];then \
		cp ./configs/$(site).css deploy/$(site)/webui/resources/custom.css; \
	fi
mac_load_keychain:
ifdef BAI_APP_SIGN_KEYCHAIN_B64
ifndef BAI_APP_SIGN_KEYCHAIN_PASSWORD
	$(error BAI_APP_SIGN_KEYCHAIN_PASSWORD is not defined)
endif
	security create-keychain -p "" "${KEYCHAIN_NAME}"
	security set-keychain-settings -lut 21600 "${KEYCHAIN_NAME}"
	security unlock-keychain -p "" "${KEYCHAIN_NAME}"
	$(shell echo "${BAI_APP_SIGN_KEYCHAIN_B64}" | base64 -d -o "${BAI_APP_SIGN_KEYCHAIN_FILE}")
	security import "${BAI_APP_SIGN_KEYCHAIN_FILE}" -A -P "${BAI_APP_SIGN_KEYCHAIN_PASSWORD}" -k "${KEYCHAIN_NAME}"
	security list-keychain -d user -s login.keychain
	security list-keychain -d user -s "${KEYCHAIN_NAME}"
	security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "" "${KEYCHAIN_NAME}"
	$(eval BAI_APP_SIGN_KEYCHAIN := ${KEYCHAIN_NAME}) 
	echo Keychain ${KEYCHAIN_NAME} created for build
endif
mac: mac_intel mac_apple
mac_intel: dep mac_load_keychain
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	BAI_APP_SIGN_KEYCHAIN="${BAI_APP_SIGN_KEYCHAIN}" node ./app-packager.js darwin x64
ifdef BAI_APP_SIGN_KEYCHAIN
	security default-keychain -s login.keychain
endif
	rm -rf ./app/backend.ai-desktop-macos-intel
	cd app; mv "Backend.AI Desktop-darwin-x64" backend.ai-desktop-macos-intel;
	./node_modules/electron-installer-dmg/bin/electron-installer-dmg.js './app/backend.ai-desktop-macos-intel/Backend.AI Desktop.app' ./app/backend.ai-desktop-intel-$(BUILD_DATE) --overwrite --icon=manifest/backend-ai.icns --title=Backend.AI
ifeq ($(site),main)
	mv ./app/backend.ai-desktop-intel-$(BUILD_DATE).dmg ./app/backend.ai-desktop-$(BUILD_VERSION)-macos-intel.dmg
else
	mv ./app/backend.ai-desktop-intel-$(BUILD_DATE).dmg ./app/backend.ai-desktop-$(BUILD_VERSION)-$(site)-macos-intel.dmg
endif
mac_apple: dep mac_load_keychain
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	BAI_APP_SIGN_KEYCHAIN="${BAI_APP_SIGN_KEYCHAIN}" node ./app-packager.js darwin arm64
ifdef BAI_APP_SIGN_KEYCHAIN
	security default-keychain -s login.keychain
endif
	rm -rf ./app/backend.ai-desktop-macos-apple
	cd app; mv "Backend.AI Desktop-darwin-arm64" backend.ai-desktop-macos-apple;
	./node_modules/electron-installer-dmg/bin/electron-installer-dmg.js './app/backend.ai-desktop-macos-apple/Backend.AI Desktop.app' ./app/backend.ai-desktop-apple-$(BUILD_DATE) --overwrite --icon=manifest/backend-ai.icns --title=Backend.AI
ifeq ($(site),main)
	mv ./app/backend.ai-desktop-apple-$(BUILD_DATE).dmg ./app/backend.ai-desktop-$(BUILD_VERSION)-macos-apple.dmg
else
	mv ./app/backend.ai-desktop-apple-$(BUILD_DATE).dmg ./app/backend.ai-desktop-$(BUILD_VERSION)-$(site)-macos-apple.dmg
endif
win: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	node ./app-packager.js win x64
	cd app; zip ./backend.ai-desktop-win32-x64-$(BUILD_DATE).zip -r "./Backend.AI Desktop-win32-x64"
ifeq ($(site),main)
	mv ./app/backend.ai-desktop-win32-x64-$(BUILD_DATE).zip ./app/backend.ai-desktop-$(BUILD_VERSION)-win32-x64.zip
else
	mv ./app/backend.ai-desktop-win32-x64-$(BUILD_DATE).zip ./app/backend.ai-desktop-x64-$(BUILD_VERSION)-$(site).zip
endif
linux: linux_intel linux_arm64
linux_arm64: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	node ./app-packager.js linux arm64
	cd app; zip -r -9 ./backend.ai-desktop-linux-arm64-$(BUILD_DATE).zip "./Backend.AI Desktop-linux-arm64"
ifeq ($(site),main)
	mv ./app/backend.ai-desktop-linux-arm64-$(BUILD_DATE).zip ./app/backend.ai-desktop-$(BUILD_VERSION)-linux-arm64.zip
else
	mv ./app/backend.ai-desktop-linux-arm64-$(BUILD_DATE).zip ./app/backend.ai-desktop-linux-arm64-$(BUILD_VERSION)-$(site).zip
endif
linux_intel: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	node ./app-packager.js linux x64
	cd app; zip -r -9 ./backend.ai-desktop-linux-x64-$(BUILD_DATE).zip "./Backend.AI Desktop-linux-x64"
ifeq ($(site),main)
	mv ./app/backend.ai-desktop-linux-x64-$(BUILD_DATE).zip ./app/backend.ai-desktop-$(BUILD_VERSION)-linux-x64.zip
else
	mv ./app/backend.ai-desktop-linux-x64-$(BUILD_DATE).zip ./app/backend.ai-desktop-linux-x64-$(BUILD_VERSION)-$(site).zip
endif
build_docker: compile
	docker build -t backend.ai-webui:$(BUILD_DATE) .
pack:
	cd app; rm -rf ./backend*.zip
	cd app; ditto -c -k --sequesterRsrc --keepParent "./Backend.AI Desktop-linux-x64" ./backend.ai-desktop-linux-x64-$(BUILD_DATE).zip
	cd app; mv backend.ai-desktop-darwin-x64 backend.ai-desktop-macos; ditto -c -k --sequesterRsrc --keepParent "./Backend.AI Desktop-macos" ./backend.ai-desktop-macos-$(BUILD_DATE).zip
	cd app; ditto -c -k --sequesterRsrc --keepParent "./"./Backend.AI Desktop-win32-x64" ./backend.ai-desktop-win32-x64-$(BUILD_DATE).zip
i18n:
	 ./node_modules/i18next-scanner/bin/cli.js --config ./i18n.config.js
clean:
	cd app;	rm -rf ./backend*; rm -rf ./Backend*
	cd build;rm -rf ./unbundle ./bundle ./rollup ./electron-app
