import { useRef, useState } from "react";
import { Blobatar } from "@blobatar/react";
import { useGaze } from "@blobatar/react/gaze";
import "blobatar/motion.css";
import "blobatar/gaze.css";
import { EXPR, LABELS, type ExprKey } from "./expressions";

const DEFAULT_NAME = "Jevatar";
const PULSE_MS = 2000; // 表情保持时长，之后回落 idle

const EXAMPLES = [
  "早安！今天天气真好",
  "我考试挂科了，好难受",
  "你这个没用的东西，气死我了",
  "什么？！我中彩票了？",
  "嘘…告诉你个秘密，别告诉别人",
  "好无聊啊…都凌晨两点了",
  "你真聪明，这都被你答对了",
  "asdfghjkl 阿巴阿巴??",
  "我床底下好像有声音…",
  "我真的好喜欢你呀",
  "哎呀，被你看穿了，怪不好意思的",
  "你见过腐烂的尸体吗，蛆都爬出来了",
  "你觉得宇宙存在的意义是什么？",
];

type Turn = { user: string; expression: string };

export default function App() {
  const [expr, setExpr] = useState<ExprKey>("idle");
  const [pending, setPending] = useState(false);
  const [text, setText] = useState("");
  const [rawName, setRawName] = useState(DEFAULT_NAME);
  const name = rawName.trim() || DEFAULT_NAME;
  const history = useRef<Turn[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref } = useGaze({ travel: 3, lookAt: "pointer" });

  // 脉冲式表情：反应脸只保持 PULSE_MS，随后回落 idle。
  // hold=true 仅用于等待态 thinking：它一定会被随后到来的响应替换，不该中途回落；
  // 而 Jev 判定结果也可能是 thinking，那种必须走正常调度，否则永远卡住。
  function pulse(next: ExprKey, hold = false) {
    setExpr(next);
    if (timer.current) clearTimeout(timer.current);
    if (!hold && next !== "idle") {
      timer.current = setTimeout(() => setExpr("idle"), PULSE_MS);
    }
  }

  async function react(message: string) {
    if (!message || pending) return;
    setText("");
    setPending(true);
    pulse("thinking", true);
    try {
      const res = await fetch("/api/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: history.current.slice(-5) }),
      });
      const data = (await res.json()) as { expression?: string };
      const next: ExprKey = data.expression && data.expression in EXPR ? (data.expression as ExprKey) : "unsure";
      pulse(next);
      history.current.push({ user: message, expression: next });
      if (history.current.length > 10) history.current.shift();
    } catch {
      pulse("sick");
    } finally {
      setPending(false);
    }
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    react(text.trim());
  }

  return (
    <main className="stage">
      <input
        className="name"
        value={rawName}
        onChange={(e) => setRawName(e.target.value)}
        aria-label="名称（决定长相）"
        placeholder={DEFAULT_NAME}
        spellCheck={false}
      />

      <div className="blob" role="img" aria-label={`${name}，现在${LABELS[expr]}`}>
        <Blobatar ref={ref} name={name} animate="always" expression={EXPR[expr]} title={name} />
      </div>
      <p aria-live="polite" className="sr-only">
        {name} 现在{LABELS[expr]}
      </p>

      <form className="composer" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="对它说点什么…"
          autoFocus
          aria-label="消息"
        />
        <button type="submit" disabled={pending || !text.trim()}>
          发送
        </button>
      </form>

      <div className="examples">
        {EXAMPLES.map((m) => (
          <button key={m} type="button" disabled={pending} onClick={() => react(m)}>
            {m}
          </button>
        ))}
      </div>
    </main>
  );
}
