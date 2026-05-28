import { useState } from "react";
import {
  BookOpen,
  Brush,
  CheckCircle2,
  Github,
  Linkedin,
  Mail,
  Palette,
  Send,
} from "lucide-react";
import { useContent } from "../contentStore";

const iconMap: Record<string, any> = {
  Mail,
  Github,
  Palette,
  BookOpen,
  Brush,
  Linkedin,
};

const focus = [
  "Product Design",
  "UI / UX",
  "Visual Design",
  "Motion Design",
  "Creative Tools",
];

const tools = [
  "Figma",
  "Adobe Illustrator",
  "Photoshop",
  "After Effects",
  "Blender",
  "GitHub",
  "AI Tools",
];

export function About() {
  const { content, submitContact } = useContent();
  const { socials, settings } = content;
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  return (
    <div>
      <section className="mx-auto max-w-[1440px] px-10 pt-24 pb-12">
        <h1
          className="display text-[var(--fg)]"
          style={{ fontSize: 132, lineHeight: 0.94 }}
        >
          About <span className="text-[var(--muted)]">Carl</span>
        </h1>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 grid grid-cols-12 gap-6">
        <div className="col-span-5 rounded-3xl border border-[color:var(--line)] p-8 bg-[color:var(--surface)]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] via-[color:var(--accent-soft)] to-[color:var(--surface-2)] mb-6" />
          <div className="text-[var(--fg)] text-3xl tracking-tight">
            {settings.name}
          </div>
          <div className="text-[var(--muted-2)] mt-1">
            {settings.role}
            <br />
            Wuxi / Remote
          </div>
        </div>

        <div className="col-span-7 space-y-6">
          <div className="rounded-3xl border border-[color:var(--line)] p-8 bg-[color:var(--surface)]">
            <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-5">
              Focus Areas
            </div>
            <div className="flex flex-wrap gap-2">
              {focus.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-full bg-[color:var(--hover)] border border-[color:var(--line)] text-[var(--fg)] text-sm"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[color:var(--line)] p-8 bg-[color:var(--surface)]">
            <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-5">
              Toolbox
            </div>
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full bg-[color:var(--hover)] border border-[color:var(--line)] text-[var(--fg-2)] text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-20">
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-8">
          Other Places
        </div>
        <div className="grid grid-cols-3 gap-3">
          {socials.map((s) => {
            const Icon = iconMap[s.icon as string];
            return (
              <a
                key={s.name}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-5 hover:border-[color:var(--accent)]/40 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  {Icon && (
                    <Icon className="w-4 h-4 text-[var(--muted-2)] group-hover:text-[var(--accent)] transition-colors" />
                  )}
                  <span className="text-[var(--fg)]">{s.name}</span>
                </div>
                <span className="text-[var(--muted-2)]">↗</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-16">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-5">
            <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-6">
              Contact
            </div>
            <h2
              className="display text-[var(--fg)]"
              style={{ fontSize: 52, lineHeight: 1.02 }}
            >
              Get in touch
            </h2>
          </div>
          <div className="col-span-7 rounded-3xl border border-[color:var(--line)] p-8 bg-[color:var(--surface)]">
            {sent ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                <div className="text-[var(--fg)] text-2xl tracking-tight mb-2">
                  Message sent
                </div>
                <p className="text-[var(--muted)] text-sm">
                  Your message is saved in Studio Overview.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-[var(--accent)] hover:underline text-sm"
                >
                  Send another ↗
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitContact(form);
                  setSent(true);
                }}
                className="grid grid-cols-2 gap-4"
              >
                <Field
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
                <div className="col-span-2">
                  <Field
                    label="Subject"
                    value={form.subject}
                    onChange={(v) => setForm({ ...form, subject: v })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2 block">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full bg-[var(--app-bg)] border border-[color:var(--line)] rounded-xl px-4 py-3 text-[var(--fg)] placeholder-[color:var(--muted-3)] focus:outline-none focus:border-[color:var(--accent)]/50"
                    placeholder="Your message..."
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="h-12 px-6 rounded-full bg-[var(--accent)] text-[var(--app-bg)] flex items-center gap-2 hover:bg-[var(--accent)]"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--app-bg)] border border-[color:var(--line)] rounded-xl px-4 h-11 text-[var(--fg)] placeholder-[color:var(--muted-3)] focus:outline-none focus:border-[color:var(--accent)]/50"
      />
    </div>
  );
}
