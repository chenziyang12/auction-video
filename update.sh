#!/bin/bash

set -e

echo "===== 拉取最新代码 ====="
git pull

echo "===== 重新部署 Docker ====="
docker compose up -d --build

echo "===== 当前状态 ====="
docker compose ps

echo "===== 完成 ====="