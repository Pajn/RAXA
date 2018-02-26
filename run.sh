#!/bin/sh

(
  cd packages/common
  echo ""
  echo "common"
  exec "$@"
)

(
  cd packages/raxa
  echo ""
  echo "raxa"
  exec "$@"
)

(
  cd packages/web
  echo ""
  echo "web"
  exec "$@"
)

(
  cd packages
  for PLUGIN in plugin-*; do
    if [ -d "${PLUGIN}" ]; then
      (
        cd "${PLUGIN}"
        echo ""
        echo "${PLUGIN}"
        exec "$@"
      )
    fi
  done
)
