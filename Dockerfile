FROM docker.m.daocloud.io/library/node:22-bookworm-slim

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    dumb-init \
    fonts-noto-cjk \
    tzdata \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

RUN mkdir -p /app/storage/jd /app/storage/generated /app/storage/tmp /app/output \
  && rm -rf /app/public/jd /app/public/generated \
  && ln -s /app/storage/jd /app/public/jd \
  && ln -s /app/storage/generated /app/public/generated

ENV NODE_ENV=production \
  PORT=3000 \
  TZ=Asia/Shanghai \
  DOCKER=true \
  STORAGE_DIR=/app/storage \
  OUTPUT_DIR=/app/output \
  BROWSER_EXECUTABLE=/usr/bin/chromium \
  PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium \
  REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
