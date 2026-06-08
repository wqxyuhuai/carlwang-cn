import { useContent } from "../contentStore";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  const { content } = useContent();
  const { socials, settings } = content;

  return (
    <footer className="mt-auto pt-24 max-md:pt-12">
      <div className="content-shell grid grid-cols-1 gap-8 py-14 md:grid-cols-12 max-md:py-10 max-md:gap-10">
        <div className="md:col-span-6">
          <div className="display text-[var(--fg)] text-4xl leading-tight max-md:text-3xl">
            {settings.name}
            <br />
            <span className="text-[var(--muted-2)]">Personal Hub</span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {settings.footer}
          </p>
        </div>
        <div className="md:col-span-6 md:justify-self-end">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 max-sm:grid-cols-1">
            {socials.map((s) => {
              return (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className="text-[var(--fg-2)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                  >
                    <SocialIcon name={s.icon} className="social-icon w-4 h-4" />
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
