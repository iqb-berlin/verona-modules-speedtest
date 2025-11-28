#!/bin/bash

if [ $# -lt 2 ]; then
    echo 'Not enough parameters! Pass editor/player and the version.'
    exit 1
fi

#rm -rf .angular/cache

### Build Angular project ###
ng build --project $1 --output-hashing=none

# Pack JS and CSS
node node_modules/iqb-dev-components/src/js_css_packer.js dist $1 dist/$1

# Use prepared HTML
cp projects/$1/src/index-prod.html dist/$1/index.html

# Set correct version to JSON description
sed -i -e 's/version-placeholder/'${2}'/g' dist/$1/index.html

# Pack dist
node scripts/distpacker.js dist/$1 iqb-$1-speedtest-$2.html
#
mv dist/$1/iqb-$1-speedtest-$2.html dist/
