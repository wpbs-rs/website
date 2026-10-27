#!/usr/bin/env bash
set -euo pipefail

ZOLA_VERSION=0.23.6

curl -sLJO "https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz"
tar -xf zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz

if [[ "${WORKERS_CI_BRANCH:-}" == "main" ]]; then
    ./zola build
else
    ./zola build --base-url /
fi
