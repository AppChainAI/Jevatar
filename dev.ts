// 单命令开发：同时拉起 API 服务和 Vite
const procs = [
  Bun.spawn(["bun", "--watch", "run", "server.ts"], { stdout: "inherit", stderr: "inherit" }),
  Bun.spawn(["bunx", "vite"], { stdout: "inherit", stderr: "inherit" }),
];

process.on("SIGINT", () => {
  for (const p of procs) p.kill();
  process.exit(0);
});

await Promise.all(procs.map((p) => p.exited));

export {};
