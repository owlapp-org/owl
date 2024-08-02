#!/usr/bin/env bash

cd owl
PYTHONPATH=server alembic upgrade head
cd -
