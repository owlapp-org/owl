#!/bin/bash

cd owl/webapp
yarn build
cp -r dist/* ../server/app/static
cd -

poetry build -f wheel
