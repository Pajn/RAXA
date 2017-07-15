#!/bin/sh

yarn

lerna bootstrap

(
  cd packages/common
  yarn link
)

(
  cd packages/raxa
  yarn link raxa-common
)

(
  cd packages/web
  yarn link raxa-common
)

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
