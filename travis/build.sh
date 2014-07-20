#!/bin/bash

set -e
. "$(dirname $0)/env.sh"

echo '-----------------------------'
echo '-- TEST: Server Unit Tests --'
echo '-----------------------------'
$DART --checked $BASE_DIR/test/unit_runner.dart

echo '----------------------------'
echo '-- TEST: Server E2E Tests --'
echo '----------------------------'
$DART --checked $BASE_DIR/test/e2e_runner.dart
