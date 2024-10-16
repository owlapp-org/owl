#!/bin/bash

cd owl/webapp
yarn build
cp -r dist/* ../server/app/static
cd -

python owl/server/app/lib/build.py

poetry build -f wheel
