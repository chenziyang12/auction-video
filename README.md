# auction-video

使用 Remotion 生成 1080×1920 的法拍房源短视频。V1 专注于离线成片质量，并提供可选的京东拍卖列表素材测试。

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
