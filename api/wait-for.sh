#!/bin/sh
# wait-for.sh host:port -- command to run

set -e

hostport="$1"
shift

echo "Waiting for $hostport..."
while ! nc -z $(echo "$hostport" | cut -d: -f1) $(echo "$hostport" | cut -d: -f2); do
  sleep 1
done

echo "$hostport is available. Starting app..."
exec "$@"