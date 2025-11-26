BUILD_DATE := $(shell date +%y%m%d)
BUILD_TIME := $(shell date +%H%m%S)
BUILD_VERSION := $(shell grep version package.json | head -1 | cut -c 15- | rev | cut -c 3- | rev)
BUILD_NUMBER := $(shell git rev-list --count $(shell git rev-parse --abbrev-ref HEAD))
REVISION_INDEX := $(shell git --no-pager log --pretty=format:%h -n 1)
site := $(or $(site),main)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

KEYCHAIN_NAME := bai-build-$(shell openssl rand -hex 16 | sed -E 's/(.{8})(.{4})(.{4})(.{4})(.{12})/\1-\2-\3-\4-\5/').keychain
BAI_APP_SIGN_KEYCHAIN_FILE := $(shell mktemp -d)/keychain.p12
BAI_APP_SIGN_KEYCHAIN =

RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[1;34m
MAGENTA := \033[1;35m
CYAN := \033[1;36m
WHITE := \033[1;37m
BBLUE := \033[38;5;123m
BWHITE := \033[38;5;231m
BRED := \033[0;91m
BGREEN := \033[0;92m
BYELLOW := \033[1;93m
NC := \033[0m

test_web:
	@pnpm run server:d
test_electron: dep
	@pnpm run electron:d
test_electron_hmr: dep # For development with HMR, you have to run build:d and server:d first
	@pnpm run electron:d:hmr
proxy:
	@node ./src/wsproxy/local_proxy.js
run_tests:
	@pnpm dlx testcafe chrome tests
versiontag:
	@printf "$(GREEN)Tagging version number / index...$(NC)\n"
	@echo '{ "package": "${BUILD_VERSION}", "buildNumber": "${BUILD_NUMBER}", "buildDate": "${BUILD_DATE}.${BUILD_TIME}", "revision": "${REVISION_INDEX}" }' > version.json
	@sed -i -E 's/globalThis.packageVersion = "\([^"]*\)"/globalThis.packageVersion = "${BUILD_VERSION}"/g' index.html
	@sed -i -E 's/"version": "\([^"]*\)"/"version": "${BUILD_VERSION}"/g' manifest.json
	@sed -i -E 's/"version": "\([^"]*\)"/"version": "${BUILD_VERSION}"/g' react/package.json
	@sed -i -E 's/"version": "\([^"]*\)"/"version": "${BUILD_VERSION}"/g' packages/backend.ai-ui/package.json
	@sed -i -E 's/"version": "\([^"]*\)"/"version": "${BUILD_VERSION}"/g' electron-app/package.json
	@sed -i -E 's/globalThis.buildNumber = "\([^"]*\)"/globalThis.buildNumber = "${BUILD_NUMBER}"/g' index.html
	@sed -i -E 's/\<small class="sidebar-footer" style="font-size:9px;"\>\([^"]*\)\<\/small\>/\<small class="sidebar-footer" style="font-size:9px;"\>${BUILD_VERSION}.${BUILD_NUMBER}\<\/small\>/g' ./src/components/backend-ai-webui.ts
	@printf "$(YELLOW)Finished$(NC)\n"
compile_keepversion:
	@pnpm run build
compile: versiontag
	@if [ ! -f "./config.toml" ]; then \
		cp config.toml.sample config.toml; \
	fi
	@pnpm run build
compile_wsproxy:
	@cd ./src/wsproxy; pnpm dlx webpack-cli --config webpack.config.js
	#cd ./src/wsproxy; rollup -c rollup.config.ts
all: dep
	@make mac_x64
	@make mac_arm64
	@make win_x64
	@make win_arm64
	@make linux_x64
	@make linux_arm64
	@make bundle
dep:
	@if [ ! -f "./config.toml" ]; then \
		cp config.toml.sample config.toml; \
	fi
	@if [ ! -d "./build/rollup/" ] || ! grep -q 'es6://static/js/main' react/build/index.html; then \
		make compile; \
		make compile_wsproxy; \
		rm -rf build/electron-app; \
		mkdir -p build/electron-app; \
		cp -r electron-app/* build/electron-app/;\
		cp electron-app/.npmrc build/electron-app/;\
		pnpm i --prefix ./build/electron-app --ignore-workspace;\
		cp -Rp build/rollup build/electron-app/app; \
		cp -Rp build/rollup/resources build/electron-app; \
		cp -Rp build/rollup/manifest build/electron-app; \
		BUILD_TARGET=electron pnpm run build:react-only; \
		cp -Rp react/build/* build/electron-app/app/; \
		sed -i -E 's/\.\/dist\/components\/backend-ai-webui.js/es6:\/\/dist\/components\/backend-ai-webui.js/g' build/electron-app/app/index.html; \
		mkdir -p ./build/electron-app/app/wsproxy; \
		cp ./src/wsproxy/dist/wsproxy.js ./build/electron-app/app/wsproxy/wsproxy.js; \
		cp ./preload.js ./build/electron-app/preload.js; \
	fi
web:
	@if [ ! -d "./build/rollup/" ];then \
		make compile; \
	fi
	@mkdir -p ./deploy/$(site)
	@cd deploy/$(site); rm -rf ./*; mkdir webui
	@cp -Rp build/rollup/* deploy/$(site)/webui
	@cp ./configs/$(site).toml deploy/$(site)/webui/config.toml
	@if [ -f "./configs/$(site).css" ];then \
		cp ./configs/$(site).css deploy/$(site)/webui/resources/custom.css; \
	fi
mac_load_keychain:
ifeq ($(BAI_APP_SIGN_KEYCHAIN),)
ifdef BAI_APP_SIGN_KEYCHAIN_B64
ifndef BAI_APP_SIGN_KEYCHAIN_PASSWORD
	$(error BAI_APP_SIGN_KEYCHAIN_PASSWORD is not defined)
endif  # BAI_APP_SIGN_KEYCHAIN_PASSWORD
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
endif  # BAI_APP_SIGN_KEYCHAIN_B64
endif  # BAI_APP_SIGN_KEYCHAIN
compile_localproxy:
	@rm -rf ./app/backend.ai-local-proxy-$(BUILD_VERSION)-$(os)-$(arch)$(local_proxy_postfix)
	@pnpm exec pkg ./src/wsproxy/local_proxy.js --targets node18-$(os)-$(arch) --output ./app/backend.ai-local-proxy-$(BUILD_VERSION)-$(os)-$(arch)$(local_proxy_postfix) --compress Brotli
	@rm -rf ./app/backend.ai-local-proxy$(local_proxy_postfix); cp ./app/backend.ai-local-proxy-$(BUILD_VERSION)-$(os)-$(arch)$(local_proxy_postfix) ./app/backend.ai-local-proxy$(local_proxy_postfix)
	@cd app; zip -r -9 ./backend.ai-local-proxy-$(BUILD_VERSION)-$(os)-$(arch).zip "./backend.ai-local-proxy$(local_proxy_postfix)"
	@rm -rf ./app/backend.ai-local-proxy$(local_proxy_postfix)
package_zip:
	@printf "$(GREEN)Packaging as ZIP archive...$(NC)"
	@cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	@node ./app-packager.js $(os) $(arch)
	@cd app; zip -r -9 ./backend.ai-desktop-$(os)-$(arch)-$(BUILD_DATE).zip "./Backend.AI Desktop-$(os_api)-$(arch)"
ifeq ($(site),main)
	@mv ./app/backend.ai-desktop-$(os)-$(arch)-$(BUILD_DATE).zip ./app/backend.ai-desktop-$(BUILD_VERSION)-$(os)-$(arch).zip
else
	@mv ./app/backend.ai-desktop-$(os)-$(arch)-$(BUILD_DATE).zip ./app/backend.ai-desktop-$(os)-$(arch)-$(BUILD_VERSION)-$(site).zip
endif
	@printf "$(YELLOW)Finished$(NC)\n"
package_dmg:
	@printf "$(GREEN)Packaging as DMG file...$(NC)"
	@cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	@BAI_APP_SIGN_KEYCHAIN="${BAI_APP_SIGN_KEYCHAIN}" node ./app-packager.js darwin $(arch)
ifdef BAI_APP_SIGN_KEYCHAIN
	@security default-keychain -s login.keychain
endif
	@rm -rf ./app/backend.ai-desktop-$(os)-$(arch)
	@cd app; mv "Backend.AI Desktop-darwin-$(arch)" backend.ai-desktop-$(os)-$(arch);
	@npx electron-installer-dmg './app/backend.ai-desktop-$(os)-$(arch)/Backend.AI Desktop.app' ./app/backend.ai-desktop-$(arch)-$(BUILD_DATE) --overwrite --icon=manifest/backend-ai.icns --title=Backend.AI
ifeq ($(site),main)
	@mv ./app/backend.ai-desktop-$(arch)-$(BUILD_DATE).dmg ./app/backend.ai-desktop-$(BUILD_VERSION)-$(os)-$(arch).dmg
else
	@mv ./app/backend.ai-desktop-$(arch)-$(BUILD_DATE).dmg ./app/backend.ai-desktop-$(BUILD_VERSION)-$(site)-$(os)-$(arch).dmg
endif
	@printf "$(YELLOW)Finished$(NC)\n"
bundle: dep
	@printf "$(GREEN)Bundling...$(NC)"
	@cd build/rollup; zip -r -9 ../../app/backend.ai-webui-bundle-$(BUILD_DATE).zip . > /dev/null
	@mv ./app/backend.ai-webui-bundle-$(BUILD_DATE).zip ./app/backend.ai-webui-bundle-$(BUILD_VERSION).zip
	@printf "$(YELLOW)Finished$(NC)\n"
mac: dep
	@make mac_x64
	@make mac_arm64
mac_x64: os := macos
mac_x64: arch := x64
mac_x64: local_proxy_postfix :=
mac_x64: dep mac_load_keychain compile_localproxy package_dmg
	@printf "$(GREEN)Build finished$(NC): macOS x64\n"
mac_arm64: os := macos
mac_arm64: arch := arm64
mac_arm64: local_proxy_postfix :=
mac_arm64: dep mac_load_keychain compile_localproxy package_dmg
	@printf "$(GREEN)Build finished$(NC): macOS arm64\n"
win: dep
	@make win_x64
	@make win_arm64
win_x64: os := win
win_x64: os_api := win32
win_x64: arch := x64
win_x64: local_proxy_postfix := .exe
win_x64: dep compile_localproxy package_zip
	@printf "$(GREEN)Build finished$(NC): Windows x64\n"
win_arm64: os := win
win_arm64: os_api := win32
win_arm64: arch := arm64
win_arm64: local_proxy_postfix := .exe
win_arm64: dep compile_localproxy package_zip
	@printf "$(GREEN)Build finished$(NC): Windows arm64\n"
linux: dep
	@make linux_x64
	@make linux_arm64
linux_x64: os := linux
linux_x64: os_api := linux
linux_x64: arch := x64
linux_x64: local_proxy_postfix :=
linux_x64: dep compile_localproxy package_zip
	@printf "$(GREEN)Build finished$(NC): Linux x64\n"
linux_arm64: os := linux
linux_arm64: os_api := linux
linux_arm64: arch := arm64
linux_arm64: local_proxy_postfix :=
linux_arm64: dep compile_localproxy package_zip
	@printf "$(GREEN)Build finished$(NC): Linux arm64\n"
build_docker: compile
	docker build -t backend.ai-webui:$(BUILD_DATE) .
i18n:
	@pnpm exec i18next-scanner --config ./i18n.config.js
clean:
	@rm -rf ./app/backend*; rm -rf ./app/Backend*
	@rm -rf ./build/unbundle ./build/bundle ./build/rollup ./build/electron-app
	@rm -rf ./react/build