#!/bin/sh
set -eu

PUBLIC_PORT="${DSH_PORT:-3080}"
INTERNAL_PORT="${DSH_INTERNAL_PORT:-3081}"

socat "TCP-LISTEN:${PUBLIC_PORT},fork,reuseaddr" "TCP:127.0.0.1:${INTERNAL_PORT}" &

exec dsh web --no-open --port "${INTERNAL_PORT}" "$@"