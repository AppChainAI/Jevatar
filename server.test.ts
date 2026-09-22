import { strict as assert } from "node:assert";
import * as poses from "blobatar/expression";
import { CRITERIA } from "./server";

// 服务端发给 Jev 的每个选项，前端必须真的有这个表情可渲染
for (const key of Object.keys(CRITERIA)) {
  assert.ok(key in poses, `CRITERIA key "${key}" has no matching export in blobatar/expression`);
}
assert.equal(Object.keys(CRITERIA).length, 14, "blobatar v1 ships exactly 14 expressions");

console.log("ok — all CRITERIA keys match blobatar/expression");
