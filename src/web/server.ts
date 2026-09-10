import express from "express";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "../api/router";
import { ensureRuntimeDirectories, runtimePaths } from "../config/runtimePaths";

const port = Number(process.env.PORT ?? 3000);

const main = async () => {
  await ensureRuntimeDirectories();
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/api", apiRouter);
  app.use("/jd", express.static(runtimePaths.jdImageDir));
  app.use("/generated", express.static(runtimePaths.generatedDir));
  app.use("/videos", express.static(runtimePaths.outputDir));

  // Vite 作为 Express 中间件，开发环境只需启动一个 3000 端口。
  const vite = await createViteServer({
    root: process.cwd(),
    appType: "spa",
    server: {
      middlewareMode: true,
      allowedHosts: ["auction.chenziyang.online"],
    },
  });
  app.use(vite.middlewares);

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`拍卖视频工作台已启动：http://0.0.0.0:${port}`);
  });
  server.on("error", (error) => {
    console.error(`端口 ${port} 启动失败：`, error);
  });

  const close = () => {
    server.close();
    void vite.close();
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
};

main().catch((error) => {
  console.error("工作台启动失败：", error);
  process.exitCode = 1;
});
