import express from 'express';
import path from 'node:path';
import {createServer as createViteServer} from 'vite';
import {apiRouter} from '../api/router';

const port = Number(process.env.PORT ?? 3333);

const main = async () => {
  const app = express();
  app.use(express.json({limit: '2mb'}));
  app.use('/api', apiRouter);
  app.use('/videos', express.static(path.resolve('out')));

  // Vite 作为 Express 中间件，开发环境只需启动一个 3000 端口。
  const vite = await createViteServer({
    root: process.cwd(),
    appType: 'spa',
    server: {middlewareMode: true},
  });
  app.use(vite.middlewares);

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`拍卖视频工作台已启动：http://localhost:${port}`);
  });
  server.on('error', (error) => {
    console.error(`端口 ${port} 启动失败：`, error);
  });

  const close = () => {
    server.close();
    void vite.close();
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
};

main().catch((error) => {
  console.error('工作台启动失败：', error);
  process.exitCode = 1;
});
