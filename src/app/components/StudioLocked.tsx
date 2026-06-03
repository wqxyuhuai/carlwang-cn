import { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import type { Route } from "../App";

const STUDIO_PASSWORD_SHA256 =
  "7cf26448d9b796ae60f2252a05742657fc601115b4eebe30d58e48ba3a48fe82";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function StudioLocked({
  go,
  onUnlock,
}: {
  go: (r: Route) => void;
  onUnlock: () => void;
}) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="content-shell min-h-[calc(100vh-64px)] grid place-items-center py-24 relative overflow-hidden max-md:py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface-2)] backdrop-blur p-10 max-md:p-6">
          <div className="w-12 h-12 rounded-full bg-[color:var(--hover)] border border-[color:var(--line)] grid place-items-center mb-6">
            <Lock className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2">
            Private
          </div>
          <h2
            className="display text-[var(--fg)]"
            style={{ fontSize: "clamp(34px, 10vw, 44px)", lineHeight: 1.02 }}
          >
            Studio <span className="text-[var(--muted)]">Locked</span>
          </h2>
          <p className="text-[var(--muted)] mt-4 leading-relaxed">
            Owner-only space for managing projects, lab items, links, files,
            and site settings.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (pw.length === 0) {
                setError("Password is required.");
                return;
              }
              if ((await sha256(pw)) !== STUDIO_PASSWORD_SHA256) {
                setError("Incorrect password.");
                return;
              }
              setPw("");
              setError("");
              onUnlock();
            }}
            className="mt-8 space-y-3"
          >
            <div
              className={`flex items-center gap-2 bg-[var(--app-bg)] border rounded-xl px-4 h-12 ${
                error
                  ? "border-rose-500/60"
                  : "border-[color:var(--line)] focus-within:border-[color:var(--accent)]/40"
              }`}
            >
              <KeyRound className="w-4 h-4 text-[var(--muted-2)]" />
              <input
                type="password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                className="bg-transparent flex-1 outline-none text-[var(--fg)] placeholder-[color:var(--muted-3)]"
                autoFocus
              />
            </div>
            {error && <div className="text-rose-500 text-sm">{error}</div>}
            <div className="flex gap-2 pt-2 max-md:flex-col">
              <button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)]"
              >
                Unlock Studio
              </button>
              <button
                type="button"
                onClick={() => go("home")}
                className="h-12 px-5 rounded-xl border border-[color:var(--line-strong)] text-[var(--fg-2)] hover:bg-[color:var(--hover)]"
              >
                Cancel
              </button>
            </div>
          </form>
          <div className="text-[var(--muted-3)] text-xs mt-6">
            This area is private. Visitors can browse the rest of the site
            without unlocking.
          </div>
        </div>
      </div>
    </div>
  );
}
