# syntax=docker/dockerfile:1
# DeepSeek Harness (dsh) in container.
# Native run on Apple Silicon (linux/arm64).

ARG NODE_VERSION=24
ARG DSH_VERSION=0.2.0-rc.2

FROM node:${NODE_VERSION}-bookworm-slim

# socat — bridge via loopback-server dsh and net container.
# git/curl/ca-certificates
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        socat \
        git \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*


RUN npm install -g "@deepseek-ai/dsh@${DSH_VERSION}" \
    && npm cache clean --force

# DSH_HOME — settings, profile, API-key and session (mount volume).
# /workspace — work dir agent (mount for swap files).
ENV DSH_HOME=/data/dsh \
    NODE_ENV=production

RUN mkdir -p /data/dsh /workspace

WORKDIR /workspace

COPY scripts/entrypoint.sh /usr/local/bin/dsh-entrypoint
RUN chmod +x /usr/local/bin/dsh-entrypoint

# dsh listen 127.0.0.1:3080; entrypoint bridge 0.0.0.0:3080.
EXPOSE 3080

ENTRYPOINT ["dsh-entrypoint"]
CMD []