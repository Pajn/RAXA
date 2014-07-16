#!/bin/bash

set -e
. "$(dirname $0)/env.sh"

echo '------------------------'
echo '-- TEST: Server Tests --'
echo '------------------------'
$DART --checked $BASE_DIR/test/runner.dart
