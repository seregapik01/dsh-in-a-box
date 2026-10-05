#!/bin/sh
set -eu

PORT="${DSH_PORT:-3080}"

# dsh web listen only loopback -> 0.0.0.0 not work ( not safety).
# socat bridge 0.0.0.0:PORT -> 127.0.0.1:PORT, for use port Web UI.
socat "TCP-LISTEN:${PORT},fork,reuseaddr" "TCP:127.0.0.1:${PORT}" &

exec dsh web --no-open --port "${PORT}" "$@"