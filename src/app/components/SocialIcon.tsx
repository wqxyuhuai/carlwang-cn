import BrushRounded from "@mui/icons-material/BrushRounded";
import EmailRounded from "@mui/icons-material/EmailRounded";
import GitHub from "@mui/icons-material/GitHub";
import LinkedIn from "@mui/icons-material/LinkedIn";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import PaletteRounded from "@mui/icons-material/PaletteRounded";
import type { ComponentType } from "react";
import { BehanceIcon, XiaohongshuIcon, ZcoolIcon } from "./BrandIcons";

type SocialIconComponent = ComponentType<{ className?: string }>;

const iconMap: Record<string, SocialIconComponent> = {
  Mail: EmailRounded,
  Github: GitHub,
  Palette: PaletteRounded,
  BookOpen: MenuBookRounded,
  Brush: BrushRounded,
  Linkedin: LinkedIn,
  Behance: BehanceIcon,
  Xiaohongshu: XiaohongshuIcon,
  ZCOOL: ZcoolIcon,
};

export function SocialIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name];
  return Icon ? <Icon className={className} /> : null;
}
