export type RichBlock = {
  id: string;
  type: "text" | "image" | "video";
  value: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  width?: "full" | "wide" | "half";
  color?: string;
  fontFamily?: string;
  weight?: "normal" | "medium" | "bold";
  italic?: boolean;
  underline?: boolean;
};

export type Project = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  year: number;
  role: string;
  description: string;
  content?: string;
  richContent?: RichBlock[];
  coverImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  externalUrl?: string;
  status?: "Published" | "Hidden" | "Draft";
  featured?: boolean;
  sortOrder?: number;
};

export const featuredWork: Project[] = [];

export const allWork: Project[] = [];

export const workCategories = [
  "All",
  "Website",
  "App / UI",
  "Video / Motion",
  "Branding",
  "Marketing",
  "Presentation",
];

export type LabItem = {
  id: string;
  slug?: string;
  title: string;
  type: string;
  status: "Live" | "Building" | "Idea" | "Archived";
  description: string;
  coverImage?: string;
  github?: string;
  demo?: string;
  techStack?: string;
  content?: string;
  richContent?: RichBlock[];
  galleryImages?: string[];
  videoUrl?: string;
  externalUrl?: string;
  featured?: boolean;
  hidden?: boolean;
};

export const labItems: LabItem[] = [];

export const labCategories = [
  "All",
  "GitHub",
  "Web Tools",
  "Mini Program",
  "Design Experiments",
  "Notes",
];

export const capabilities = [
  {
    title: "Product & UI",
    body: "Cloud platforms, device tools, B2B workflows.",
  },
  {
    title: "Visual & Brand",
    body: "Brand systems, campaigns, marketing materials.",
  },
  {
    title: "Motion & Video",
    body: "Product videos and launch content.",
  },
  {
    title: "Tools & Experiments",
    body: "Personal tools and design experiments.",
  },
];

export const socials = [
  { name: "Email", href: "mailto:wqxyuhuai@163.com", icon: "Mail" },
  { name: "GitHub", href: "https://github.com/wqxyuhuai", icon: "Github" },
  { name: "Behance", href: "https://www.behance.net/carl_wang", icon: "Palette" },
  {
    name: "Xiaohongshu",
    href: "https://www.xiaohongshu.com/user/profile/63d27072000000002702a47e",
    icon: "BookOpen",
  },
  { name: "ZCOOL", href: "https://www.zcool.com.cn/u/16294196", icon: "Brush" },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.cn/incareer/in/carl-wang-840656167/",
    icon: "Linkedin",
  },
];
