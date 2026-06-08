import { useEffect, useState } from "react";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";

export function BackToTop({ routeKey }: { routeKey: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const root = document.documentElement;
      const hasLongContent = root.scrollHeight > window.innerHeight + 360;
      setVisible(hasLongContent && window.scrollY > 520);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [routeKey]);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`back-to-top ${visible ? "is-visible" : ""}`}
    >
      <KeyboardArrowUpRounded className="h-5 w-5" />
    </button>
  );
}
