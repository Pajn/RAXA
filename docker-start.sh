#!/bin/sh

if [ ! -f "/config/.defaults-installed" ]; then
  if [ -f "/config/db.json" ]; then
    echo "WARNING: Defaults missing but db.json found"
    echo "skipping installation of default interfaces and plugins"
  elif [ -f "/config/package.json" ]; then
    echo "WARNING: Defaults missing but package.json found"
    echo "skipping installation of default interfaces and plugins"
  else
    echo "Installing default interfaces and plugins"
    cp -a /default-config/* /config
    touch /config/.defaults-installed
  fi
fi

node raxa/build/index.js
