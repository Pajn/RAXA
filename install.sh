#!/bin/sh

yarn

./node_modules/.bin/lerna bootstrap -- "$@"

(
  cd packages/common
  yarn link
)

(
  cd packages/raxa
  yarn link raxa-common
)

if [ "$SKIP_WEB" = "" ]
then
  (
    cd packages/web
    yarn link raxa-common
  )
fi

(
  cd packages
  for PLUGIN in plugin-*; do
    if [ -d "${PLUGIN}" ]; then
      (
        cd "${PLUGIN}"
        yarn link
        yarn link raxa-common
        cd ../raxa
        yarn link "raxa-${PLUGIN}"
      )
    fi
  done
)

(
  cd packages/plugin-nexa
  yarn link raxa-plugin-raxa-tellsticknet
)
