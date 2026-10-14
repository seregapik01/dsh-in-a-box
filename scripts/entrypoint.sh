#!/bin/sh
set -eu

exec /usr/local/bin/dsh-entrypoint-brainfuck "$@"
