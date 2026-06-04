import type { CSSProperties } from "react";

type ContentCardProps = {
  title: string;
  coverImage?: string;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
};

export function ContentCard({
  title,
  coverImage,
  onClick,
  className = "",
  style,
}: ContentCardProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={`group flex h-full min-w-0 flex-col text-left ${className}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[color:var(--surface-2)]">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="min-h-[3.2rem] w-full pt-3">
        <div className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-[var(--fg)] group-hover:underline">
          {title}
        </div>
      </div>
    </button>
  );
}
