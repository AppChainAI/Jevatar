import {
  idle,
  happy,
  sad,
  mad,
  surprised,
  wink,
  sleepy,
  smug,
  unsure,
  scared,
  love,
  shy,
  sick,
  thinking,
} from "blobatar/expression";

// key 与服务端 CRITERIA 一一对应（server.test.ts 有漂移检查）
export const EXPR = {
  idle,
  happy,
  sad,
  mad,
  surprised,
  wink,
  sleepy,
  smug,
  unsure,
  scared,
  love,
  shy,
  sick,
  thinking,
} as const;

export type ExprKey = keyof typeof EXPR;

// aria-live 播报用（表情不进无障碍树，需自行宣告）
export const LABELS: Record<ExprKey, string> = {
  idle: "平静",
  happy: "开心",
  sad: "难过",
  mad: "生气",
  surprised: "惊讶",
  wink: "俏皮地眨眼",
  sleepy: "困倦",
  smug: "得意",
  unsure: "困惑",
  scared: "害怕",
  love: "满怀爱意",
  shy: "害羞",
  sick: "不舒服",
  thinking: "思考中",
};
