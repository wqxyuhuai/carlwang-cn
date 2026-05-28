export function CoverArt({ index }: { index: number }) {
  const variants = [
    { dot: "var(--accent)" },
    { dot: "rgba(255,255,255,0.85)" },
    { dot: "rgba(245,222,160,0.9)" },
    { dot: "rgba(180,210,230,0.9)" },
    { dot: "var(--accent)" },
    { dot: "rgba(255,255,255,0.6)" },
    { dot: "rgba(220,180,160,0.9)" },
    { dot: "var(--accent)" },
  ];
  const v = variants[index % variants.length];
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(180deg, var(--surface-2), var(--app-bg-2))",
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 75%)",
        }}
      />
      <div className="absolute inset-7 flex flex-col justify-end">
        <div className="space-y-1.5">
          <div
            className="h-[3px] rounded-full"
            style={{ width: "26%", background: v.dot }}
          />
          <div
            className="h-[3px] rounded-full"
            style={{ width: "62%", background: "var(--line-strong)" }}
          />
          <div
            className="h-[3px] rounded-full"
            style={{ width: "48%", background: "var(--line)" }}
          />
        </div>
      </div>
    </div>
  );
}
