import { serve } from "bun";
import { join, normalize } from "node:path";

// 14 个内置表情 + 自定义 yes / no；与前端 EXPR 保持一致。
export const CRITERIA = {
  idle: "Neutral default, nothing in particular to react to",
  happy: "Pleased, amused, greeted warmly, good news",
  sad: "Sympathy, disappointment, farewells, something unfortunate",
  mad: "Insulted, provoked, or hearing something outrageous",
  surprised: "Unexpected news, shock, astonishment",
  wink: "Jokes, playful teasing, a shared secret",
  sleepy: "Bored by the topic, or told it is late / time to rest",
  smug: "Praised for something, or proven right",
  unsure: "Confused, ambiguous input, does not understand",
  scared: "Creepy, threatening or alarming content",
  love: "Affection, warmth, tenderness directed at it",
  shy: "Embarrassed or flustered by attention or compliments",
  sick: "Disgusting or nauseating topic",
  thinking: "A hard question it needs to ponder",
  yes: "Agreement, approval, going along with what the user said",
  no: "Clear disagreement, refusal, or correcting a claim or proposal the companion rejects; a firm no rather than confusion or angry outrage",
} as const;

export type ExprKey = keyof typeof CRITERIA;

const LOW_CONFIDENCE: ExprKey = "unsure";
const ERROR_FACE: ExprKey = "sick";
const CONFIDENCE_FLOOR = 0.4;

interface ReactRequest {
  message: string;
  history?: { user: string; expression: string }[];
}

async function askJev({ message, history = [] }: ReactRequest): Promise<{ expression: ExprKey; confidence: number }> {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) throw new Error("TYPESAFE_API_KEY is not set");

  const res = await fetch("https://api.typesafe.ai/v1/systemone", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      model: "jev-latest",
      state: {
        companion: "Jevatar, a small blob creature. It cannot speak or write; it only reacts with its face.",
        recent: history.slice(-5),
        message,
      },
      questions: {
        expression: {
          type: "choice",
          instructions:
            "The user just said something to a creature that can only respond with a facial expression. Which expression should it show right now?",
          criteria: CRITERIA,
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`typesafe ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as {
    answers: { expression: { choice: ExprKey; confidence: number } };
  };
  const { choice, confidence } = data.answers.expression;
  return { expression: confidence < CONFIDENCE_FLOOR ? LOW_CONFIDENCE : choice, confidence };
}

const DIST = new URL("./dist/", import.meta.url).pathname;

async function staticFile(pathname: string): Promise<Response> {
  const rel = pathname === "/" ? "index.html" : pathname.slice(1);
  const full = normalize(join(DIST, rel));
  if (!full.startsWith(DIST)) return new Response("forbidden", { status: 403 });
  const file = Bun.file(full);
  if (await file.exists()) return new Response(file);
  // SPA fallback：非 /api 的 GET 一律回 index.html
  const index = Bun.file(join(DIST, "index.html"));
  if (await index.exists()) return new Response(index);
  return new Response("dist/ not found — run `bun run build` first", { status: 404 });
}

if (import.meta.main) {
  serve({
    port: Number(process.env.PORT ?? 3000),
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/api/react") {
        if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
        try {
          const result = await askJev(await req.json());
          return Response.json(result);
        } catch (e) {
          console.error(e);
          return Response.json({ expression: ERROR_FACE, confidence: 0, error: String(e) });
        }
      }
      if (req.method === "GET") return staticFile(url.pathname);
      return new Response("method not allowed", { status: 405 });
    },
  });
  console.log("Jevatar on http://localhost:" + (process.env.PORT ?? 3000));
}
