EP = electron-packager ./build/es6-unbundled --ignore=node_modules/electron-packager --icon=manifest/backend-ai.icns --ignore=.git --overwrite --ignore="\.git(ignore|modules)" --out=app

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))


mac:
	polymer build
	cd build/es6-unbundled; npm install
	\cp ./main.electron-packager.js ./build/es6-unbundled/main.js
	$(EP) --platform=darwin
clean:
	cd app;	rm -rf ./backend*
	cd build;rm -rf ./es6-unbundled
