import { BookOpen, Brush, Github, Linkedin, Mail, Palette } from "lucide-react";
import { useContent } from "../contentStore";

const iconMap: Record<string, any> = {
  Github,
  Mail,
  Palette,
  BookOpen,
  Brush,
  Linkedin,
};

export function Footer() {
  const { content } = useContent();
  const { socials, settings } = content;

  return (
    <footer className="border-t border-[color:var(--line-soft)] mt-24 max-md:mt-12">
      <div className="content-shell py-14 grid grid-cols-12 gap-8 max-md:py-10 max-md:gap-10">
        <div className="col-span-12 md:col-span-5">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-4">
            Based in Wuxi
          </div>
          <div className="display text-[var(--fg)] text-4xl leading-tight max-md:text-3xl">
            {settings.name}
            <br />
            <span className="text-[var(--muted-2)]">Personal Hub</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-4">
            Elsewhere
          </div>
          <ul className="space-y-2">
            {socials.map((s) => {
              const Icon = iconMap[s.icon as string];
              return (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={s.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="text-[var(--fg-2)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {s.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-4">
            Colophon
          </div>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            {settings.footer}
          </p>
        </div>
      </div>
      <div className="content-shell py-6 flex items-center justify-between gap-3 border-t border-[color:var(--line-soft)] text-[var(--muted-2)] text-xs max-md:flex-col max-md:items-start">
        <span>{settings.name} Studio - Wuxi / Remote</span>
        <span>configurable prototype</span>
      </div>
    </footer>
  );
}
