#!/bin/sh

# wait-for-flask.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until curl -sSf "http://$host:$port" >/dev/null; do
    echo >&2 "Flask is unavailable - sleeping"
    sleep 2
done

echo >&2 "Flask is up - executing command"
exec $cmd
