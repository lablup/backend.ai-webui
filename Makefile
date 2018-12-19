EP = electron-packager ./build/es6-unbundled --ignore=node_modules/electron-packager --icon=manifest/backend-ai.icns --ignore=.git --overwrite --ignore="\.git(ignore|modules)" --out=app

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))


mac:
	\cp ./main.electron-packager.js ./build/es6-unbundled/main.js
	cd build/es6-unbundled; npm install
	$(EP) --platform=darwin
clean:
	cd app
	\rm -rf ./backend*
