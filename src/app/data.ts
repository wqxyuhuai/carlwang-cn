export type RichBlock = {
  id: string;
  type: "text" | "image" | "video";
  value: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  width?: "full" | "wide" | "half";
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

export const featuredWork: Project[] = [
  {
    id: "wattdesk",
    title: "WattDesk Cloud Platform",
    category: "Product UI / SaaS",
    year: 2025,
    role: "Product Design, UI System",
    description:
      "Cloud platform for energy monitoring and diagnostics.",
    featured: true,
    status: "Published",
  },
  {
    id: "imaster",
    title: "iMaster Desktop Tool",
    category: "Desktop App / Device Management",
    year: 2025,
    role: "Product Design",
    description:
      "Desktop tool for device configuration and management.",
    featured: true,
    status: "Published",
  },
  {
    id: "energy-marketing",
    title: "Energy Product Marketing System",
    category: "Branding / Marketing",
    year: 2025,
    role: "Visual Direction",
    description:
      "Visual system for product launches and campaigns.",
    featured: true,
    status: "Published",
  },
  {
    id: "motion-series",
    title: "Product Motion Video Series",
    category: "Video / Motion",
    year: 2025,
    role: "Motion Direction",
    description:
      "Video series explaining product features and scenarios.",
    featured: true,
    status: "Published",
  },
];

export const allWork: Project[] = [
  ...featuredWork.map((p) => ({ ...p, category: mapWorkCat(p.title) })),
  {
    id: "wattcision",
    title: "WattCision Business Series Launch",
    category: "Marketing",
    year: 2025,
    role: "Campaign Design",
    description: "Product launch campaign and visual system.",
    status: "Published",
  },
  {
    id: "ess-site",
    title: "Energy Storage Product Website",
    category: "Website",
    year: 2024,
    role: "Web Design",
    description:
      "Product website for commercial energy storage.",
    status: "Published",
  },
  {
    id: "bess-brochure",
    title: "Commercial BESS Brochure System",
    category: "Presentation",
    year: 2025,
    role: "Brochure Design",
    description:
      "Modular brochure system for battery products.",
    status: "Published",
  },
  {
    id: "brand-guideline",
    title: "Brand Visual Guideline",
    category: "Branding",
    year: 2024,
    role: "Visual Identity",
    description:
      "Brand identity system and templates.",
    status: "Hidden",
  },
  {
    id: "expo-pack",
    title: "Exhibition Visual Package",
    category: "Marketing",
    year: 2025,
    role: "Visual Design",
    description:
      "Exhibition booth and marketing materials.",
    status: "Published",
  },
];

function mapWorkCat(title: string) {
  if (title.startsWith("WattDesk")) return "App / UI";
  if (title.startsWith("iMaster")) return "App / UI";
  if (title.includes("Marketing System")) return "Marketing";
  if (title.includes("Motion")) return "Video / Motion";
  return "Other";
}

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
  hidden?: boolean;
};

export const labItems: LabItem[] = [
  {
    id: "gh-calendar",
    title: "GitHub Calendar Project",
    type: "GitHub",
    status: "Live",
    description:
      "Calendar tool for personal schedules.",
    github: "https://github.com",
    demo: "#",
  },
  {
    id: "gradient-gen",
    title: "Random Gradient Generator",
    type: "Web Tools",
    status: "Building",
    description:
      "Gradient and color generator.",
    demo: "#",
  },
  {
    id: "link-toolkit",
    title: "Link Toolkit",
    type: "Web Tools",
    status: "Idea",
    description:
      "Link management with QR codes.",
  },
  {
    id: "ios-tips",
    title: "iOS Tips Collection",
    type: "Notes",
    status: "Live",
    description:
      "iOS efficiency tips.",
  },
  {
    id: "mini-prog",
    title: "Mini Program Experiments",
    type: "Mini Program",
    status: "Idea",
    description: "Personal utilities.",
  },
  {
    id: "design-archive",
    title: "Design Archive",
    type: "Design Experiments",
    status: "Building",
    description:
      "Design ideas and references.",
  },
];

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
