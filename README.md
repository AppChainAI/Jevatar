# Jevatar

只用表情与你交流的 blob 伙伴。你打字，[Jev](https://docs.typesafe.ai)（TypeSafe System One）判断它该露出什么表情，[blobatar](https://blobatar.dev) 负责把脸画出来并做过渡动画。没有文字回复，没有聊天记录。

## 配置

在 `.env` 里填入密钥（从 [console.typesafe.ai/keys](https://console.typesafe.ai/keys) 获取）：

```
TYPESAFE_API_KEY=sk-...
```

## 运行

```sh
bun install
bun run dev        # 开发：API 服务 + Vite（代理 /api），打开终端提示的 5173 端口
```

```sh
bun run build      # 产出静态文件到 dist/
bun start          # 生产：单进程托管 dist/ + /api，http://localhost:3000
```

## 结构

- `server.ts` — Bun 单文件服务端：托管 `dist/`，`POST /api/react` 调 Jev 返回表情（低置信度兜底 `unsure`，异常兜底 `sick`）
- `src/App.tsx` — 全部 UI：名称、Blobatar、composer
- `src/expressions.ts` — 表情 key → blobatar 表情值 / 中文播报词
- `server.test.ts` — 校验服务端表情选项与 blobatar/expression 导出无漂移（`bun test`）

密钥只存在于服务端，不下发到浏览器。
