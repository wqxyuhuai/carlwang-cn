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
      <section className="content-shell pt-24 pb-12 max-md:pt-12 max-md:pb-8">
        <h1
          className="display max-w-4xl text-[var(--fg)]"
          style={{ fontSize: "clamp(46px, 14vw, 132px)", lineHeight: 0.94 }}
        >
          About <span className="text-[var(--muted)]">Carl</span>
        </h1>
      </section>

      <section className="content-shell grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-8 lg:col-span-5 max-md:p-6">
          <div className="mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--accent)] via-[color:var(--accent-soft)] to-[color:var(--surface-2)]" />
          <div className="text-3xl tracking-tight text-[var(--fg)]">
            {settings.name}
          </div>
          <div className="mt-1 text-[var(--muted-2)]">
            {settings.role}
            <br />
            Wuxi / Remote
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <TagPanel title="Focus Areas" items={focus} strong />
          <TagPanel title="Toolbox" items={tools} />
        </div>
      </section>

      <section className="content-shell py-20 max-md:py-12">
        <div className="mb-8 text-xs uppercase tracking-[0.2em] text-[var(--muted-2)]">
          Other Places
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map((s) => {
            const Icon = iconMap[s.icon as string];
            return (
              <a
                key={s.name}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-5 transition-colors hover:border-[color:var(--accent)]/40"
              >
                <div className="flex items-center gap-2">
                  {Icon && (
                    <Icon className="h-4 w-4 text-[var(--muted-2)] transition-colors group-hover:text-[var(--accent)]" />
                  )}
                  <span className="text-[var(--fg)]">{s.name}</span>
                </div>
                <span className="text-[var(--muted-2)]">-&gt;</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="content-shell py-16 max-md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mb-6 text-xs uppercase tracking-[0.2em] text-[var(--muted-2)]">
              Contact
            </div>
            <h2
              className="display text-[var(--fg)]"
              style={{ fontSize: "clamp(34px, 10vw, 52px)", lineHeight: 1.02 }}
            >
              Get in touch
            </h2>
          </div>
          <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-8 lg:col-span-7 max-md:p-5">
            {sent ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[var(--accent)]" />
                <div className="mb-2 text-2xl tracking-tight text-[var(--fg)]">
                  Message sent
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Your message is saved in Studio Overview.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-sm text-[var(--accent)] hover:underline"
                >
                  Send another -&gt;
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitContact(form);
                  setSent(true);
                }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
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
                <div className="sm:col-span-2">
                  <Field
                    label="Subject"
                    value={form.subject}
                    onChange={(v) => setForm({ ...form, subject: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted-2)]">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full rounded-xl border border-[color:var(--line)] bg-[var(--app-bg)] px-4 py-3 text-[var(--fg)] placeholder-[color:var(--muted-3)] focus:border-[color:var(--accent)]/50 focus:outline-none"
                    placeholder="Your message..."
                  />
                </div>
                <div className="flex justify-end sm:col-span-2">
                  <button
                    type="submit"
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-[var(--app-bg)] hover:bg-[var(--accent)] max-md:w-full"
                  >
                    <Send className="h-4 w-4" /> Send Message
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

function TagPanel({
  title,
  items,
  strong = false,
}: {
  title: string;
  items: string[];
  strong?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-8 max-md:p-6">
      <div className="mb-5 text-xs uppercase tracking-[0.2em] text-[var(--muted-2)]">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border border-[color:var(--line)] bg-[color:var(--hover)] px-3 py-1.5 text-sm ${
              strong ? "text-[var(--fg)]" : "text-[var(--fg-2)]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
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
      <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted-2)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-[color:var(--line)] bg-[var(--app-bg)] px-4 text-[var(--fg)] placeholder-[color:var(--muted-3)] focus:border-[color:var(--accent)]/50 focus:outline-none"
      />
    </div>
  );
}
