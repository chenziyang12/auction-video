# auction-video

使用 Remotion 生成 1080×1920 的法拍拍卖标的短视频。V1 专注于离线成片质量，并提供可选的京东拍卖列表素材测试。

## 环境与运行

- Node.js 22
- npm

```bash
npm install
npm run typecheck
npm run dev
npm run render
```

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
