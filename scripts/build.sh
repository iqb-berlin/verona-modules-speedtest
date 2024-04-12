#!/bin/bash

if [ $# -lt 2 ]; then
    echo 'Not enough parameters! Pass editor/player and the version.'
    exit 1
fi

#rm -rf .angular/cache

### Build Angular project ###
cd $1
ng build --output-hashing=none
cd ..

# Pack JS and CSS
node node_modules/iqb-dev-components/src/js_css_packer.js $1/dist $1 $1/dist

# Use prepared HTML
cp $1/index-prod.html $1/dist/index.html

# Set correct version to JSON description
sed -i -e 's/version-placeholder/'${2}'/g' $1/dist/index.html

# Pack dist
node scripts/distpacker.js $1/dist iqb-$1-speedtest-$2.html $1

cp $1/dist/iqb-$1-speedtest-$2.html dist/
