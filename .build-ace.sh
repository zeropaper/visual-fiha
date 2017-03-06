#!/bin/bash
cp ./node_modules/ace-builds/src/worker-javascript.js ./
cp ./node_modules/ace-builds/src/worker-css.js ./
echo "" > ./ace-build.js
cat ./node_modules/ace-builds/src/ace.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-beautify.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-error_marker.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-language_tools.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-searchbox.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-settings_menu.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-split.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-statusbar.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/ext-whitespace.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/mode-css.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/mode-javascript.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/mode-svg.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/mode-yaml.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/snippets/text.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/snippets/css.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/snippets/javascript.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/snippets/yaml.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/theme-github.js >> ./ace-build.js
cat ./node_modules/ace-builds/src/theme-monokai.js >> ./ace-build.js