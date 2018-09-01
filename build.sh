#!/bin/sh

export BUILD_DATE=`date +'%C%y-%m-%d'`

if [ $CI_COMMIT_SHA ]; then
  export GIT_HASH="$CI_COMMIT_SHA"
else
  export GIT_HASH=`git show HEAD --pretty=format:"%h" --no-patch`
fi

if [ "$1" = "--arm" ]; then
  docker run -e BUILD_DATE="$BUILD_DATE" -e GIT_HASH="$GIT_HASH" -v "$PWD":/app -w /app node:alpine node dockerfile.js --arm > Dockerfile.gen.arm
  docker build . -f Dockerfile.gen.arm -t raxa:arm
else
  docker run -e BUILD_DATE="$BUILD_DATE" -e GIT_HASH="$GIT_HASH" -v "$PWD":/app -w /app node:alpine node dockerfile.js > Dockerfile.gen
  docker build . -f Dockerfile.gen -t raxa
fi
