#!/bin/sh

export GIT_HASH=`git show HEAD --pretty=format:"%h" --no-patch`
export BUILD_DATE=`date +'%C%y-%m-%d'`

if [ "$1" = "--arm" ]; then
  node dockerfile.js --arm > Dockerfile.gen.arm
  docker build . -f Dockerfile.gen.arm -t raxa:arm
else
  node dockerfile.js > Dockerfile.gen
  docker build . -f Dockerfile.gen -t raxa
fi
