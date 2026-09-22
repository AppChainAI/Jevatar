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
  poseVars,
  bakePose,
  type Expression,
} from "blobatar/expression";

// 肯定：水平、对称、略收紧的睁眼，避免斜眼读成犹疑或得意。
// index.css 在这份静态姿态上叠加双点头与同步眯眼；减弱动态时仍保留此姿态。
const yes: Expression = {
  p: {
    esx: 1.22,
    esy: 0.72,
    tilt: 0,
    edy: -0.8,
    edx: 0.4,
    esx2: 0, // 对称，不做单眼表情（那是 smug/wink 的地盘）
    esy2: 0,
    tilt2: 0,
    edy2: 0,
    lock: 1,
    heat: 0,
    shake: 0,
    rock: 0,
    bdy: 0,
  },
  vars: poseVars,
  bake: bakePose,
};

// 否定：对称收眼、内侧轻压，表达明确反对；不使用 mad 的红色或颤抖。
// 扁眼的负 tilt 才是内侧向下的方向，保持轻微角度以免读成暴怒。
const no: Expression = {
  p: {
    esx: 1.5,
    esy: 0.38,
    tilt: -14,
    edy: -0.3,
    edx: 0.5,
    esx2: 0,
    esy2: 0,
    tilt2: 0,
    edy2: 0,
    lock: 1,
    heat: 0,
    shake: 0,
    rock: 0,
    bdy: 0,
  },
  vars: poseVars,
  bake: bakePose,
};

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
  yes,
  no,
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
  yes: "点头称是",
  no: "摇头表示不同意",
};
