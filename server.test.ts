import { strict as assert } from "node:assert";
import { test } from "bun:test";
import { EXPR, LABELS } from "./src/expressions";
import { CRITERIA } from "./server";

// 服务端发给 Jev 的每个选项，前端必须真的有这个表情可渲染（含自定义表情）
test("服务端表情选项、前端姿态与播报词保持一致", () => {
  const serverKeys = Object.keys(CRITERIA).sort();
  assert.deepEqual(serverKeys, Object.keys(EXPR).sort(), "CRITERIA 与 EXPR 的表情 key 不一致");
  assert.deepEqual(serverKeys, Object.keys(LABELS).sort(), "CRITERIA 与 LABELS 的表情 key 不一致");
});
