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
    <footer className="mt-24 max-md:mt-12">
      <div className="content-shell py-14 grid grid-cols-12 gap-8 max-md:py-10 max-md:gap-10">
        <div className="col-span-12 md:col-span-6">
          <div className="display text-[var(--fg)] text-4xl leading-tight max-md:text-3xl">
            {settings.name}
            <br />
            <span className="text-[var(--muted-2)]">Personal Hub</span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {settings.footer}
          </p>
        </div>
        <div className="col-span-12 md:col-span-6 md:justify-self-end">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 max-sm:grid-cols-1">
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
      </div>
    </footer>
  );
}
