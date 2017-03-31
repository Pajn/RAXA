#!/bin/sh

yarn

cd common
yarn
yarn link
cd ..

yarn link raxa-common

cd plugins
for PLUGIN in *; do
  if [ -d "${PLUGIN}" ]; then
    cd "${PLUGIN}"
    yarn link
    cd ../..
    yarn link "raxa-plugin-${PLUGIN}"
    cd plugins
  fi
done
cd ..
