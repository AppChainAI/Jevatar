import { useRef, useState } from "react";
import { Blobatar } from "@blobatar/react";
import { useGaze } from "@blobatar/react/gaze";
import "blobatar/motion.css";
import "blobatar/gaze.css";
import { EXPR, LABELS, type ExprKey } from "./expressions";

const NAME = "Jevatar";
const PULSE_MS = 2000; // 表情保持时长，之后回落 idle

type Turn = { user: string; expression: string };

export default function App() {
  const [expr, setExpr] = useState<ExprKey>("idle");
  const [pending, setPending] = useState(false);
  const [text, setText] = useState("");
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

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = text.trim();
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

  return (
    <main className="stage">
      <h1 className="name">{NAME}</h1>

      <div className="blob" role="img" aria-label={`${NAME}，现在${LABELS[expr]}`}>
        <Blobatar ref={ref} name={NAME} animate="always" expression={EXPR[expr]} title={NAME} />
      </div>
      <p aria-live="polite" className="sr-only">
        {NAME} 现在{LABELS[expr]}
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
    </main>
  );
}
