import { useState } from "react";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import { useContent } from "../contentStore";
import { SocialIcon } from "./SocialIcon";

const focus = [
  "Product Design",
  "UI / UX",
  "Visual Design",
  "Motion Design",
  "Creative Tools",
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
      <section className="content-shell grid grid-cols-1 gap-10 pt-40 pb-16 lg:grid-cols-12 max-md:pt-28 max-md:pb-10">
        <div className="lg:col-span-8">
          <div className="mb-5 inline-flex rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
            Wuxi / Remote
          </div>
          <h1
            className="display max-w-4xl text-[var(--fg)]"
            style={{ fontSize: "clamp(48px, 11vw, 104px)", lineHeight: 0.96 }}
          >
            {settings.name}
          </h1>
          <p className="mt-6 max-w-3xl text-2xl leading-snug tracking-tight text-[var(--fg-2)] max-md:text-xl">
            {settings.role}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            {settings.bio}
          </p>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
            <div className="mb-5 h-20 w-20 rounded-full bg-[var(--accent)]" />
            <div className="text-sm uppercase tracking-normal text-[var(--muted-2)]">
              Focus
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {focus.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-sm text-[var(--fg-2)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-shell py-10 max-md:py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["Product systems", "Interfaces, workflows, dashboards"],
            ["Visual direction", "Brand, campaign, presentation"],
            ["Creative build", "Motion, experiments, small tools"],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6"
            >
              <div className="text-xl tracking-tight text-[var(--fg)]">
                {title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-shell py-14 max-md:py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl tracking-tight text-[var(--fg)]">
            Elsewhere
          </h2>
          <div className="hidden text-sm text-[var(--muted)] md:block">
            Selected profiles and contact paths
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map((s) => {
            return (
              <a
                key={s.name}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="group flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-5 transition-colors hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--hover)]"
              >
                <div className="flex items-center gap-2">
                  <SocialIcon name={s.icon} className="social-icon h-4 w-4" />
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
            <h2
              className="display text-[var(--fg)]"
              style={{ fontSize: "clamp(34px, 10vw, 52px)", lineHeight: 1.02 }}
            >
              Get in touch
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              For product, interface, brand, and visual system work.
            </p>
          </div>
          <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-8 lg:col-span-7 max-md:p-5">
            {sent ? (
              <div className="py-16 text-center">
                <CheckCircleRounded className="mx-auto mb-4 h-12 w-12 text-[var(--accent)]" />
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
                  <label className="mb-2 block text-xs uppercase tracking-normal text-[var(--muted-2)]">
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
                    <SendRounded className="h-4 w-4" /> Send Message
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
      <label className="mb-2 block text-xs uppercase tracking-normal text-[var(--muted-2)]">
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
