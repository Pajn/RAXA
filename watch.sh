#!/bin/sh

npm run watch &

cd common
npm run watch &
cd ..

cd plugins
for PLUGIN in *; do
  if [ -d "${PLUGIN}" ]; then
    cd "${PLUGIN}"
    npm run watch &
    cd ..
  fi
done
cd ..
