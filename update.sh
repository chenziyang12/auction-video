#!/bin/bash

set -e

PROJECT_DIR=$(cd "$(dirname "$0")"; pwd)
RUNNING_FILE="$PROJECT_DIR/.update-running"

cleanup() {
  rm -f "$RUNNING_FILE"
}
trap cleanup EXIT

cd "$PROJECT_DIR"
touch "$RUNNING_FILE"

echo "===== 1/4 拉取代码 ====="
BEFORE_COMMIT=$(git rev-parse HEAD)
git pull

echo "===== 2/4 检查依赖 ====="
if git diff --name-only "$BEFORE_COMMIT" HEAD -- package.json package-lock.json | grep -q .; then
  echo "package.json 或 package-lock.json 已变化，安装依赖"
  npm install
else
  echo "依赖文件未变化，跳过安装"
fi

echo "===== 3/4 构建项目 ====="
npm run build

echo "===== 4/4 重启 Docker 服务 ====="
docker compose up -d --build

echo "===== 服务状态 ====="
docker compose ps

echo "===== 更新完成 ====="
