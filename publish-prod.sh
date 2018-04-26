#!/bin/sh

set -e

./build.sh
./build.sh --arm
docker tag raxa pieorpaj/raxa
docker tag raxa:arm pieorpaj/raxa:arm
docker push pieorpaj/raxa
docker push pieorpaj/raxa:arm

