#!/bin/sh

npm install

cd common
npm install
npm link
cd ..

npm link raxa-common

cd plugins
for PLUGIN in *; do
  if [ -d "${PLUGIN}" ]; then
    cd "${PLUGIN}"
    npm link
    cd ../..
    npm link "raxa-plugin-${PLUGIN}"
    cd plugins
  fi
done
cd ..
