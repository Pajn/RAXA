#!/bin/sh

(
  cd packages/common
  exec "$@"
)

(
  cd packages/raxa
  exec "$@"
)

(
  cd packages/web
  exec "$@"
)

(
  cd packages
  for PLUGIN in plugin-*; do
    if [ -d "${PLUGIN}" ]; then
      (
        cd "${PLUGIN}"
        exec "$@"
      )
    fi
  done
)
