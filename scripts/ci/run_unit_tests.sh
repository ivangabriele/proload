#!/bin/bash

# Exit when any command fails:
set -e

npm i
npm test

# Push tests coverage data to Coveralls:
./node_modules/.bin/coveralls < ./coverage/lcov.info
