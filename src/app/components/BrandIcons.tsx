import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ZcoolIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect width="24" height="24" rx="6" fill="#FFD100" />
      <path
        d="M17.7 5.1c.4 2.5-.5 3.7-2.1 4.4 1.4-.1 2.3-.5 3.4-1.2-.2 2-.9 3.8-2.3 5.2-1.6 1.8-3.7 2.8-6.1 2.8-3.2 0-5.5-1.8-5.5-4.4 0-1.9 1.2-3.5 3.3-4.3 1.7-.7 3.8-.5 5.4-1.2 1.4-.6 2.5-1.6 3.9-1.3Z"
        fill="#222"
      />
      <path
        d="M7.4 11.5c1.1.9 2.4 1.1 4.3.6-1 1.1-2.2 1.7-3.5 1.6-.9-.1-1.5-.8-.8-2.2Z"
        fill="#FFD100"
      />
    </svg>
  );
}

export function XiaohongshuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect width="24" height="24" rx="6" fill="#FF2442" />
      <text
        x="12"
        y="15.1"
        textAnchor="middle"
        fill="#fff"
        fontFamily="PingFang SC, Microsoft YaHei, sans-serif"
        fontSize="7.1"
        fontWeight="900"
        letterSpacing="-0.4"
      >
        小红书
      </text>
    </svg>
  );
}

export function BehanceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect width="24" height="24" rx="6" fill="#1769FF" />
      <text
        x="11.8"
        y="15.9"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="10.6"
        fontWeight="900"
      >
        Bē
      </text>
    </svg>
  );
}
