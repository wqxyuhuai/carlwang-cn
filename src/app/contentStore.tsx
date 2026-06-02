import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  allWork,
  capabilities,
  labItems,
  socials,
  type LabItem,
  type Project,
} from "./data";
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
  saveLabItem: (item: LabItem) => void;
  deleteLabItem: (id: string) => void;
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
  projects: allWork.map((project, index) => ({
    ...project,
    slug: project.slug ?? project.id,
    sortOrder: project.sortOrder ?? index + 1,
  })),
  labItems: labItems.map((item) => ({
    ...item,
    slug: item.slug ?? item.id,
    hidden: item.hidden ?? false,
  })),
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

function normalizeContent(value: Partial<SiteContent> | null): SiteContent {
  return {
    ...defaultContent,
    ...value,
    projects: value?.projects?.length ? value.projects : defaultContent.projects,
    labItems: value?.labItems?.length ? value.labItems : defaultContent.labItems,
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
    if (content.settings.oss?.accessKeySecret) return;
    fetch(`${PUBLISHED_CONTENT_URL}?t=${Date.now()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((published) => {
        if (published) setContent(normalizeContent(published));
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
          const next = {
            ...project,
            id: project.id || uid("project"),
            slug: project.slug || project.id || uid("project"),
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
      saveLabItem(item) {
        setContent((current) => {
          const next = {
            ...item,
            id: item.id || uid("lab"),
            slug: item.slug || item.id || uid("lab"),
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
