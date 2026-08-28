# auction-video

使用 Remotion 生成 1080×1920 的法拍拍卖标的短视频。V1 专注于离线成片质量，并提供可选的京东拍卖列表素材测试。

## 环境与运行

- Node.js 22
- npm

```bash
npm install
npm run typecheck
npm run dev
```

打开 `http://localhost:3000`，即可在工作台中拉取京东拍卖数据、选择标的与模板、生成并下载 MP4。

如需单独打开 Remotion Studio：

```bash
npx remotion studio src/remotion/index.ts
```

离线演示视频仍可通过 `npm run render` 生成。

离线演示输出为 `out/demo.mp4`，不访问网络。`src/data/demo.ts` 中的数据均标记为 DEMO。

## 京东素材测试

```bash
npx playwright install chromium
npm run fetch:jd
npm run render:jd
```

抓取脚本仅监听列表页 XHR/Fetch，不进入详情页，也不会处理或绕过安全验证。真实数据与图片分别写入 `src/data/jd-demo.json` 和 `public/jd/`，两者均被 Git 忽略。真实视频输出为 `out/jd-demo.mp4`。

信息仅供演示，具体内容以拍卖平台公告为准。

## 语音与字幕视频

语音使用 `@andresaya/edge-tts`，默认普通话男声 `zh-CN-YunyangNeural`、语速 `+5%`。TTS 准备阶段需要互联网；生成完成后，Remotion 渲染只读取本地音频和时间轴。

```bash
npm run voice:demo
npm run render:voice

npm run voice:jd
npm run render:jd:voice
```

输出分别为 `out/demo-voice.mp4` 和 `out/jd-voice.mp4`。音频缓存在 `public/generated/tts/`，时间轴写入 `.tmp/narration/`；缓存键包含声音、语速、音量、音高和旁白文本，这些生成文件不会提交 Git。

配置可通过环境变量覆盖，不需要 `.env`：

```text
TTS_VOICE=zh-CN-XiaoxiaoNeural
TTS_RATE=+3%
TTS_VOLUME=+0%
TTS_PITCH=+0Hz
```

无语音的 `npm run render` 仍可完全离线运行。

## 绿联 DXP4800 Plus Docker 部署

当前 Docker 方案面向 Intel x86_64 的绿联 DXP4800 Plus，使用 CPU 渲染 H.264，不包含 QSV、VAAPI、CUDA 或 NVIDIA 加速。

### 首次部署

1. 在 NAS 上创建应用目录，并进入该目录。
2. 克隆仓库并进入项目：

```bash
git clone https://github.com/chenziyang12/auction-video.git
cd auction-video
mkdir -p storage output
```

3. 构建并启动：

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
```

4. 浏览器访问：

```text
http://NAS_IP:3000
```

容器内 Web 服务监听 `0.0.0.0:3000`。镜像使用 Debian Bookworm 的系统 Chromium，供 Playwright 抓取和 Remotion 渲染共同使用，并安装 `fonts-noto-cjk` 保证中文显示。

### 持久化目录

Compose 只挂载两个宿主机目录：

- `./storage:/app/storage`
  - `storage/jd-items.json`：最近一次京东抓取数据
  - `storage/jd/`：京东下载图片
  - `storage/generated/tts/`：TTS 音频与元数据缓存
  - `storage/tmp/`：timeline、props 和渲染清单等运行数据
- `./output:/app/output`
  - Web 工作台和命令行生成的 MP4

容器首次启动会自动创建所需子目录，不需要执行 `chmod 777`。如 NAS 提示挂载目录无写入权限，请在绿联文件管理或容器管理界面给 Docker 服务账号授予 `storage`、`output` 的读写权限。

### 更新与停止

更新代码并重建：

```bash
git pull
docker compose build
docker compose up -d
```

停止服务：

```bash
docker compose down
```

当前工作台没有登录鉴权，不建议把 3000 端口直接暴露到公网。当前版本也没有 GPU/QSV 加速，性能以 NAS 上的 CPU 实测为准。
