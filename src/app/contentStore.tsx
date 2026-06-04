import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  capabilities,
  socials,
  type LabItem,
  type Project,
} from "./data";
import { withDefaultSortOrder } from "./contentOrdering";
import { uploadToOss } from "./ossUpload";

export type SocialLink = {
  name: string;
  href: string;
  icon: string;
};

export type ManagedLink = {
  id: string;
  name: string;
  slug: string;
  url: string;
  enabled: boolean;
  clicks: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type SiteSettings = {
  name: string;
  role: string;
  slogan: string;
  bio: string;
  email: string;
  github: string;
  xhs: string;
  zcool: string;
  behance: string;
  linkedin: string;
  footer: string;
  oss?: OssSettings;
};

export type OssSettings = {
  enabled: boolean;
  bucket: string;
  endpoint: string;
  directory: string;
  accessKeyId: string;
  accessKeySecret: string;
  publicBaseUrl: string;
};

export type SiteContent = {
  projects: Project[];
  labItems: LabItem[];
  socials: SocialLink[];
  capabilities: typeof capabilities;
  links: ManagedLink[];
  messages: ContactMessage[];
  settings: SiteSettings;
};

type ContentContextValue = {
  content: SiteContent;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (ids: string[]) => void;
  saveLabItem: (item: LabItem) => void;
  deleteLabItem: (id: string) => void;
  reorderLabItems: (ids: string[]) => void;
  saveLink: (link: ManagedLink) => void;
  deleteLink: (id: string) => void;
  submitContact: (message: Omit<ContactMessage, "id" | "createdAt">) => void;
  saveSettings: (settings: SiteSettings) => void;
  publishContent: () => Promise<string>;
  resetContent: () => void;
};

const STORAGE_KEY = "cw-personal-hub-content-v1";
const PUBLISHED_CONTENT_URL =
  ((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_CONTENT_URL ||
    "https://carlwang-cn.oss-cn-shanghai.aliyuncs.com/uploads/site-content.json");

const defaultSettings: SiteSettings = {
  name: "Carl Wang",
  role: "Designer / Product Thinker / Creative Builder",
  slogan: "Designing clarity for complex systems.",
  bio: "I design product interfaces, visual systems, motion content, and small creative tools that make complex ideas easier to use and understand.",
  email: "wqxyuhuai@163.com",
  github: "https://github.com/wqxyuhuai",
  xhs: "https://www.xiaohongshu.com/user/profile/63d27072000000002702a47e",
  zcool: "https://www.zcool.com.cn/u/16294196",
  behance: "https://www.behance.net/carl_wang",
  linkedin: "https://www.linkedin.cn/incareer/in/carl-wang-840656167/",
  footer: "© 2026 Carl Wang. Built with care.",
  oss: {
    enabled: false,
    bucket: "",
    endpoint: "",
    directory: "uploads",
    accessKeyId: "",
    accessKeySecret: "",
    publicBaseUrl: "",
  },
};

const defaultLinks: ManagedLink[] = [
  {
    id: "github",
    name: "GitHub",
    slug: "/go/github",
    url: "https://github.com/wqxyuhuai",
    enabled: true,
    clicks: 0,
  },
  {
    id: "xiaohongshu",
    name: "Xiaohongshu",
    slug: "/go/xiaohongshu",
    url: "https://www.xiaohongshu.com/user/profile/63d27072000000002702a47e",
    enabled: true,
    clicks: 0,
  },
  {
    id: "zcool",
    name: "ZCOOL",
    slug: "/go/zcool",
    url: "https://www.zcool.com.cn/u/16294196",
    enabled: true,
    clicks: 0,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    slug: "/go/portfolio",
    url: "https://carlwang.cn/work",
    enabled: true,
    clicks: 0,
  },
  {
    id: "calendar",
    name: "Calendar Project",
    slug: "/go/calendar",
    url: "https://github.com/carlwang/calendar",
    enabled: false,
    clicks: 0,
  },
];

export const defaultContent: SiteContent = {
  projects: [],
  labItems: [],
  socials,
  capabilities,
  links: defaultLinks,
  messages: [],
  settings: defaultSettings,
};

const ContentContext = createContext<ContentContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function normalizeItemId(item: { id?: string; slug?: string; title?: string }, prefix: string) {
  if (item.id && item.id !== "notion-3736cfcdf85b") return item.id;
  const source = item.slug || item.title || prefix;
  return `${prefix}-${source
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || Date.now().toString(36)}`;
}

function normalizeContent(value: Partial<SiteContent> | null): SiteContent {
  const projects = withDefaultSortOrder(
    (value?.projects?.length ? value.projects : defaultContent.projects).map(
      (project) => {
      const { description: _description, role: _role, ...rest } = project as Project & {
        description?: string;
        role?: string;
      };
      return {
        ...rest,
        id: normalizeItemId(project, "work"),
        slug: project.slug || normalizeItemId(project, "work"),
      };
    },
    ),
  );
  const currentYear = new Date().getFullYear();
  const lab = withDefaultSortOrder((value?.labItems?.length ? value.labItems : defaultContent.labItems).map((item) => {
    const { description: _description, techStack: _techStack, ...rest } = item as LabItem & {
      description?: string;
      techStack?: string;
    };
    return {
      ...rest,
      id: normalizeItemId(item, "lab"),
      slug: item.slug || normalizeItemId(item, "lab"),
      year: item.year ?? currentYear,
      hidden: item.hidden ?? false,
      featured: !!item.featured,
    };
  }));

  return {
    ...defaultContent,
    ...value,
    projects,
    labItems: lab,
    socials: defaultContent.socials,
    capabilities: value?.capabilities?.length
      ? value.capabilities
      : defaultContent.capabilities,
    links: defaultContent.links,
    messages: value?.messages ?? defaultContent.messages,
    settings: {
      ...defaultSettings,
      ...(value?.settings ?? {}),
      oss: {
        ...defaultSettings.oss,
        ...((value?.settings as SiteSettings | undefined)?.oss ?? {}),
      },
    },
  };
}

function publicContent(value: SiteContent): SiteContent {
  const { oss: _oss, ...settings } = value.settings;
  return {
    ...value,
    messages: [],
    settings,
  };
}

function mergePublishedContent(current: SiteContent, published: Partial<SiteContent>) {
  const next = normalizeContent(published);
  return {
    ...next,
    messages: current.messages,
    settings: {
      ...next.settings,
      oss: current.settings.oss,
    },
  };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return normalizeContent(saved ? JSON.parse(saved) : null);
    } catch {
      return defaultContent;
    }
  });

  useEffect(() => {
    fetch(`${PUBLISHED_CONTENT_URL}?t=${Date.now()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((published) => {
        if (published) {
          setContent((current) => mergePublishedContent(current, published));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {}
  }, [content]);

  const value = useMemo<ContentContextValue>(
    () => ({
      content,
      saveProject(project) {
        setContent((current) => {
          const { description: _description, role: _role, ...cleanProject } = project as Project & {
            description?: string;
            role?: string;
          };
          const next = {
            ...cleanProject,
            id: cleanProject.id || uid("project"),
            slug: cleanProject.slug || cleanProject.id || uid("project"),
          };
          const exists = current.projects.some((item) => item.id === next.id);
          return {
            ...current,
            projects: exists
              ? current.projects.map((item) =>
                  item.id === next.id ? next : item,
                )
              : [...current.projects, next],
          };
        });
      },
      deleteProject(id) {
        setContent((current) => ({
          ...current,
          projects: current.projects.filter((item) => item.id !== id),
        }));
      },
      reorderProjects(ids) {
        const order = new Map(ids.map((id, index) => [id, index + 1]));
        setContent((current) => ({
          ...current,
          projects: current.projects.map((item) => ({
            ...item,
            sortOrder: order.get(item.id) ?? item.sortOrder ?? ids.length + 1,
          })),
        }));
      },
      saveLabItem(item) {
        setContent((current) => {
          const { description: _description, techStack: _techStack, ...cleanItem } = item as LabItem & {
            description?: string;
            techStack?: string;
          };
          const next = {
            ...cleanItem,
            id: cleanItem.id || uid("lab"),
            slug: cleanItem.slug || cleanItem.id || uid("lab"),
          };
          const exists = current.labItems.some((entry) => entry.id === next.id);
          return {
            ...current,
            labItems: exists
              ? current.labItems.map((entry) =>
                  entry.id === next.id ? next : entry,
                )
              : [...current.labItems, next],
          };
        });
      },
      deleteLabItem(id) {
        setContent((current) => ({
          ...current,
          labItems: current.labItems.filter((item) => item.id !== id),
        }));
      },
      reorderLabItems(ids) {
        const order = new Map(ids.map((id, index) => [id, index + 1]));
        setContent((current) => ({
          ...current,
          labItems: current.labItems.map((item) => ({
            ...item,
            sortOrder: order.get(item.id) ?? item.sortOrder ?? ids.length + 1,
          })),
        }));
      },
      saveLink(link) {
        setContent((current) => {
          const next = { ...link, id: link.id || uid("link") };
          const exists = current.links.some((item) => item.id === next.id);
          return {
            ...current,
            links: exists
              ? current.links.map((item) =>
                  item.id === next.id ? next : item,
                )
              : [...current.links, next],
          };
        });
      },
      deleteLink(id) {
        setContent((current) => ({
          ...current,
          links: current.links.filter((item) => item.id !== id),
        }));
      },
      submitContact(message) {
        setContent((current) => ({
          ...current,
          messages: [
            {
              ...message,
              id: uid("message"),
              createdAt: new Date().toISOString(),
            },
            ...current.messages,
          ],
        }));
      },
      saveSettings(settings) {
        setContent((current) => ({ ...current, settings }));
      },
      async publishContent() {
        const file = new File(
          [JSON.stringify(publicContent(content), null, 2)],
          "site-content.json",
          { type: "application/json" },
        );
        return uploadToOss(file, content.settings.oss, "", "site-content.json");
      },
      resetContent() {
        setContent(defaultContent);
      },
    }),
    [content],
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used inside ContentProvider");
  }
  return context;
}
