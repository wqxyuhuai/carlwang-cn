import { useEffect, useState } from "react";

const greetings = [
  { text: "Hello", lang: "en" },
  { text: "Bonjour", lang: "fr" },
  { text: "Hola", lang: "es" },
  { text: "Hallo", lang: "de" },
  { text: "Ciao", lang: "it" },
];

export function Loader({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const step = 220;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      if (n >= greetings.length) {
        window.clearInterval(id);
        setLeaving(true);
        window.setTimeout(onDone, 700);
        return;
      }
      setI(n);
    }, step);
    return () => window.clearInterval(id);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-[var(--app-bg)] transition-opacity duration-700 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative h-[140px] min-w-[360px] flex items-center justify-center">
        {greetings.map((g, idx) => (
          <span
            key={g.lang}
            className="display absolute text-[var(--fg)] whitespace-nowrap"
            style={{
              fontSize: 96,
              lineHeight: 1,
              opacity: idx === i ? 1 : 0,
              filter: idx === i ? "blur(0)" : "blur(18px)",
              transform: idx === i ? "translateY(0)" : "translateY(12px)",
              transition:
                "opacity 360ms ease, filter 360ms ease, transform 360ms ease",
            }}
          >
            {g.text}
          </span>
        ))}
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-2 text-[var(--muted-2)] text-xs tracking-[0.3em] uppercase">
        Carl Wang Studio
      </div>
    </div>
  );
}
