import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  EyeOff,
  Eye,
  Star,
  Upload,
  UploadCloud,
  Link2,
  QrCode,
  Copy,
  Check,
  Save,
  Pin,
  FileText,
  Lock,
  GripVertical,
  Undo2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { Route } from "../App";
import { useContent, type ManagedLink, type SiteSettings } from "../contentStore";
import type { LabItem, Project, RichBlock } from "../data";
import { canUploadToOss, uploadToOss } from "../ossUpload";
import { ProjectBlockEditor } from "./editor/ProjectBlockEditor";

type Tab =
  | "overview"
  | "projects"
  | "lab"
  | "toolbox"
  | "links"
  | "qr"
  | "settings";

export function StudioUnlocked({
  go,
  onLock,
}: {
  go: (r: Route) => void;
  onLock: () => void;
}) {
  const { publishContent } = useContent();
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "lab", label: "Lab Items" },
    { id: "toolbox", label: "Toolbox" },
    { id: "links", label: "Links" },
    { id: "qr", label: "QR Codes" },
    { id: "settings", label: "Site Settings" },
  ];

  return (
    <div className="content-shell py-12 relative max-md:py-8">
      <div className="flex items-end justify-between gap-6 mb-10 max-md:flex-col max-md:items-start max-md:mb-7">
        <div>
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-3">
            Studio - Owner Mode
          </div>
          <h1
            className="display text-[var(--fg)]" style={{ fontSize: "clamp(44px, 10vw, 80px)", lineHeight: 0.96 }}
          >
            Carl <span className="text-[var(--muted)]">Studio</span>
          </h1>
          <p className="text-[var(--muted)] mt-4 max-w-xl leading-relaxed">
            Manage portfolio content, personal projects, links, files, QR
            codes, and basic site information.
          </p>
        </div>
        <div className="flex items-center gap-2 max-md:w-full max-md:flex-wrap">
          <button
            onClick={async () => {
              setPublishing(true);
              try {
                await publishContent();
                showToast("Content published");
              } catch (error) {
                showToast(error instanceof Error ? error.message : "Publish failed");
              } finally {
                setPublishing(false);
              }
            }}
            disabled={publishing}
            className="h-10 px-4 rounded-full bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)] disabled:opacity-50 flex items-center gap-2 max-md:flex-1 max-md:justify-center"
          >
            <UploadCloud className="w-4 h-4" /> {publishing ? "Publishing" : "Publish"}
          </button>
          <button
            onClick={() => {
              onLock();
              go("home");
            }}
            className="h-10 px-4 rounded-full border border-[color:var(--line-strong)] text-[var(--fg-2)] hover:bg-[color:var(--hover)] flex items-center gap-2 max-md:flex-1 max-md:justify-center"
          >
            <Lock className="w-4 h-4" /> Lock Studio
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-y border-[color:var(--line)] py-2 mb-10 overflow-x-auto sticky top-16 frosted-bar z-20 max-md:top-[112px] max-md:mb-7">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-9 px-4 rounded-full text-sm whitespace-nowrap transition-colors ${
              tab === t.id
                ? "bg-[var(--fg)] text-[var(--app-bg)]"
                : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[color:var(--hover)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview setTab={setTab} />}
      {tab === "projects" && <ProjectsTab toast={showToast} />}
      {tab === "lab" && <LabTab toast={showToast} />}
      {tab === "toolbox" && <ToolboxTab toast={showToast} />}
      {tab === "links" && <LinksTab toast={showToast} />}
      {tab === "qr" && <QRTab toast={showToast} />}
      {tab === "settings" && <SettingsTab toast={showToast} />}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[color:var(--surface-2)] border border-[color:var(--line)] text-[var(--fg)] px-5 py-3 rounded-full shadow-2xl text-sm flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-[var(--accent)]" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */

function Overview({ setTab }: { setTab: (t: Tab) => void }) {
  const { content } = useContent();
  const stats = [
    {
      k: "Published Projects",
      v: content.projects.filter((item) => item.status === "Published").length,
    },
    { k: "Lab Items", v: content.labItems.filter((item) => !item.hidden).length },
    { k: "Active Links", v: content.links.filter((item) => item.enabled).length },
    {
      k: "Draft Items",
      v: content.projects.filter((item) => item.status === "Draft").length,
    },
    { k: "Messages", v: content.messages.length },
  ];
  const actions = [
    { label: "Add Project", to: "projects", icon: Plus },
    { label: "Add Lab Item", to: "lab", icon: Plus },
    { label: "Upload File", to: "toolbox", icon: Upload },
    { label: "Create Link", to: "links", icon: Link2 },
    { label: "Generate QR Code", to: "qr", icon: QrCode },
  ];
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-5 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2">
        {stats.map((s) => (
          <div
            key={s.k}
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 max-md:p-4"
          >
            <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase">
              {s.k}
            </div>
            <div
              className="text-[var(--fg)] tracking-tight mt-3"
              style={{ fontSize: "clamp(34px, 9vw, 56px)", fontWeight: 500 }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden">
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-4">
          Quick Actions
        </div>
        <div className="grid grid-cols-5 gap-3">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => setTab(a.to as Tab)}
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-left hover:border-[color:var(--accent)]/40 transition-colors"
            >
              <a.icon className="w-5 h-5 text-[var(--accent)] mb-6" />
              <div className="text-[var(--fg)]">{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-4">
          Contact Messages
        </div>
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] divide-y divide-[color:var(--line-soft)]">
          {(content.messages.length
            ? content.messages
            : [
                {
                  id: "empty",
                  subject: "No messages yet",
                  name: "Contact form submissions will appear here.",
                  email: "",
                  message: "",
                  createdAt: "",
                },
              ]
          )
            .slice(0, 5)
            .map((message) => (
              <div key={message.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--fg)]">{message.subject}</span>
                  <span className="text-[var(--muted-2)] text-sm">
                    {message.email}
                  </span>
                </div>
                <div className="text-[var(--muted)] text-sm mt-1">
                  {message.name}
                  {message.message ? ` 路 ${message.message}` : ""}
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}

/* ---------------- PROJECTS ---------------- */

function ProjectsTab({ toast }: { toast: (m: string) => void }) {
  const { content, saveProject, deleteProject } = useContent();
  const list = content.projects
    .slice()
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .map((p) => ({
      ...p,
      featured: !!p.featured,
      hidden: p.status === "Hidden",
    }));
  const [panel, setPanel] = useState<null | { id?: string }>(null);

  const toggleHidden = (project: Project) =>
    saveProject({
      ...project,
      status: project.status === "Hidden" ? "Published" : "Hidden",
    });
  const toggleFeatured = (project: Project) =>
    saveProject({ ...project, featured: !project.featured });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 max-md:flex-col max-md:items-stretch">
        <div className="text-[var(--fg-2)]">{list.length} projects</div>
        <button
          onClick={() => setPanel({})}
          className="h-10 px-4 rounded-full bg-[var(--accent)] text-[var(--app-bg)] flex items-center justify-center gap-2 hover:bg-[var(--accent)]"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>
      <div className="rounded-2xl border border-[color:var(--line)] overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[color:var(--surface-2)] text-[var(--muted-2)] text-xs tracking-[0.18em] uppercase">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Year</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Featured</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line-soft)]">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-[color:var(--hover)]">
                <td className="px-4 py-4 text-[var(--fg)]">{p.title}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{p.category}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{p.year}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      p.hidden
                        ? "bg-[color:var(--surface-2)] text-[var(--muted)]"
                        : "bg-[color:var(--accent-soft)] text-[var(--accent)]"
                    }`}
                  >
                    {p.hidden ? "Hidden" : "Published"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`w-7 h-7 rounded-full grid place-items-center ${
                      p.featured
                        ? "bg-amber-400/20 text-amber-500"
                        : "border border-[color:var(--line)] text-[var(--muted-2)]"
                    }`}
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={p.featured ? "currentColor" : "none"}
                    />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn
                      onClick={() => setPanel({ id: p.id })}
                      icon={Edit3}
                      label="Edit"
                    />
                    <IconBtn
                      onClick={() => toggleHidden(p)}
                      icon={p.hidden ? Eye : EyeOff}
                      label={p.hidden ? "Show" : "Hide"}
                    />
                    <IconBtn
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"?`)) {
                          deleteProject(p.id);
                          toast("Project deleted");
                        }
                      }}
                      icon={Trash2}
                      label="Delete"
                      danger
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {panel && (
        <SidePanel
          title={panel.id ? "Edit Project" : "Add Project"}
          onClose={() => setPanel(null)}
        >
          <ProjectForm
            initial={list.find((p) => p.id === panel.id)}
            onSave={(project) => {
              saveProject(project);
              setPanel(null);
              toast(panel.id ? "Project updated" : "Project added");
            }}
            onCancel={() => setPanel(null)}
          />
        </SidePanel>
      )}
    </div>
  );
}

function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    id: initial?.id ?? "",
    title: initial?.title ?? "",
    category: initial?.category ?? "App / UI",
    year: initial?.year ?? 2026,
    content: initial?.content ?? "",
    richContent: ensureUniqueBlocks(initial?.richContent ?? textToRichBlocks(initial?.content)),
    coverImage: initial?.coverImage ?? "",
    galleryImages: initial?.galleryImages ?? [],
    videoUrl: initial?.videoUrl ?? "",
    externalUrl: initial?.externalUrl ?? "",
    status: initial?.status ?? "Published",
    featured: !!initial?.featured,
    sortOrder: initial?.sortOrder ?? 999,
  });
  const uploadSlug = slugify(f.title || initial?.id || "untitled-project");
  const uploadBase = `work/${uploadSlug}`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const slug = initial?.slug || slugify(f.title);
        onSave({
          ...initial,
          id: f.id || slug,
          slug,
          title: f.title,
          category: f.category,
          year: f.year,
          content: f.content,
          richContent: f.richContent,
          coverImage: f.coverImage,
          galleryImages: f.galleryImages,
          videoUrl: f.videoUrl,
          externalUrl: f.externalUrl,
          status: f.status as Project["status"],
          featured: f.featured,
          sortOrder: f.sortOrder,
        });
      }}
      className="space-y-0"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-[620px] rounded-2xl border border-transparent bg-transparent p-0">
          <ProjectBlockEditor
            blocks={f.richContent}
            uploadPathPrefix={uploadBase}
            onChange={(blocks) => setF({ ...f, richContent: blocks })}
          />
        </section>

        <aside className="space-y-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 lg:sticky lg:top-24 self-start">
          <UploadBox label="Cover image (recommended 1600 x 1200 px)" accept="image/*" pathPrefix={uploadBase} onFiles={(files) => setF({ ...f, coverImage: files[0] ?? "" })} />
          {f.coverImage && (
            <img src={f.coverImage} alt="" className="aspect-[4/3] w-full rounded-lg object-cover border border-[color:var(--line)]" />
          )}
          <Field label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <Field label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} />
            <Field label="Year" value={String(f.year)} onChange={(v) => setF({ ...f, year: Number(v) || 0 })} />
          </div>
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <Select
              label="Status"
              value={f.status}
              options={["Published", "Hidden", "Draft"]}
              onChange={(v) => setF({ ...f, status: v })}
            />
            <Toggle
              label="Featured"
              checked={f.featured}
              onChange={(v) => setF({ ...f, featured: v })}
            />
          </div>
        </aside>
      </div>
      <div className="sticky bottom-0 z-20 -mx-6 mt-5 flex justify-end gap-2 border-t border-[color:var(--line)] bg-[var(--app-bg)]/95 px-6 py-5 backdrop-blur max-md:-mx-4 max-md:px-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-5 rounded-full bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)] flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </form>
  );
}

/* ---------------- LAB TAB ---------------- */

function LabTab({ toast }: { toast: (m: string) => void }) {
  const { content, saveLabItem, deleteLabItem } = useContent();
  const items = content.labItems;
  const [panel, setPanel] = useState<null | { id?: string }>(null);
  const toggleFeatured = (item: LabItem) =>
    saveLabItem({ ...item, featured: !item.featured });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-[var(--fg-2)]">{items.length} lab items</div>
        <button
          onClick={() => setPanel({})}
          className="h-10 px-4 rounded-full bg-[var(--accent)] text-[var(--app-bg)] flex items-center gap-2 hover:bg-[var(--accent)]"
        >
          <Plus className="w-4 h-4" /> Add Lab Item
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {items.map((it) => (
          <div
            key={it.id}
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 flex gap-4 max-md:p-4"
          >
            <div className="w-24 h-24 rounded-lg bg-[color:var(--surface-2)] flex-shrink-0 overflow-hidden">
              {it.coverImage && (
                <img
                  src={it.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[var(--fg)] truncate">{it.title}</span>
                <span className="text-xs text-[var(--muted-2)]">- {it.type}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full text-xs bg-[color:var(--accent-soft)] text-[var(--accent)]">
                  {it.status}
                </span>
                {it.hidden && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[color:var(--surface-2)] text-[var(--muted)]">
                    Hidden
                  </span>
                )}
                {it.featured && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-400/15 text-amber-500">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-[var(--muted)] text-sm line-clamp-2">
                {summaryFromRichContent(it.richContent, it.content)}
              </p>
              <div className="flex gap-1 mt-3">
                <IconBtn
                  onClick={() => toggleFeatured(it)}
                  icon={Star}
                  label={it.featured ? "Unfeature" : "Feature"}
                  active={!!it.featured}
                />
                <IconBtn
                  onClick={() => setPanel({ id: it.id })}
                  icon={Edit3}
                  label="Edit"
                />
                <IconBtn
                  onClick={() => saveLabItem({ ...it, hidden: !it.hidden })}
                  icon={it.hidden ? Eye : EyeOff}
                  label="Hide"
                />
                <IconBtn
                  onClick={() => {
                    if (confirm(`Delete "${it.title}"?`)) {
                      deleteLabItem(it.id);
                      toast("Lab item deleted");
                    }
                  }}
                  icon={Trash2}
                  label="Delete"
                  danger
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {panel && (
        <SidePanel
          title={panel.id ? "Edit Lab Item" : "Add Lab Item"}
          onClose={() => setPanel(null)}
        >
          <LabForm
            initial={items.find((i) => i.id === panel.id)}
            onSave={(item) => {
              saveLabItem(item);
              setPanel(null);
              toast(panel.id ? "Lab item updated" : "Lab item added");
            }}
            onCancel={() => setPanel(null)}
          />
        </SidePanel>
      )}
    </div>
  );
}

function LabForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: LabItem;
  onSave: (item: LabItem) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    id: initial?.id ?? "",
    title: initial?.title ?? "",
    type: initial?.type ?? "Web Tools",
    status: initial?.status ?? "Idea",
    github: initial?.github ?? "",
    demo: initial?.demo ?? "",
    content: initial?.content ?? "",
    richContent: ensureUniqueBlocks(initial?.richContent ?? textToRichBlocks(initial?.content)),
    coverImage: initial?.coverImage ?? "",
    featured: !!initial?.featured,
  });
  const uploadSlug = slugify(f.title || initial?.id || "untitled-lab");
  const uploadBase = `lab/${uploadSlug}`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const slug = initial?.slug || slugify(f.title);
        onSave({
          ...initial,
          id: f.id || slug,
          slug,
          title: f.title,
          type: f.type,
          status: f.status as LabItem["status"],
          github: f.github,
          demo: f.demo,
          content: f.content,
          richContent: f.richContent,
          coverImage: f.coverImage,
          featured: f.featured,
          hidden: initial?.hidden ?? false,
        });
      }}
      className="space-y-0"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-[620px] rounded-2xl border border-transparent bg-transparent p-0">
          <ProjectBlockEditor
            blocks={f.richContent}
            uploadPathPrefix={uploadBase}
            onChange={(blocks) => setF({ ...f, richContent: blocks })}
          />
        </section>

        <aside className="space-y-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 lg:sticky lg:top-24 self-start">
          <UploadBox label="Cover image (recommended 1600 x 1200 px)" accept="image/*" pathPrefix={uploadBase} onFiles={(files) => setF({ ...f, coverImage: files[0] ?? "" })} />
          {f.coverImage && (
            <img src={f.coverImage} alt="" className="aspect-[4/3] w-full rounded-lg object-cover border border-[color:var(--line)]" />
          )}
          <Field label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <Select
              label="Type"
              value={f.type}
              options={["GitHub", "Web Tools", "Mini Program", "Design Experiments", "Notes"]}
              onChange={(v) => setF({ ...f, type: v })}
            />
            <Select
              label="Status"
              value={f.status}
              options={["Live", "Building", "Idea", "Archived"]}
              onChange={(v) => setF({ ...f, status: v })}
            />
          </div>
          <Field label="GitHub URL" value={f.github} onChange={(v) => setF({ ...f, github: v })} />
          <Field label="Demo URL" value={f.demo} onChange={(v) => setF({ ...f, demo: v })} />
          <Toggle label="Featured" checked={f.featured} onChange={(v) => setF({ ...f, featured: v })} />
        </aside>
      </div>
      <div className="sticky bottom-0 z-20 -mx-6 mt-5 flex justify-end gap-2 border-t border-[color:var(--line)] bg-[var(--app-bg)]/95 px-6 py-5 backdrop-blur max-md:-mx-4 max-md:px-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-5 rounded-full bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)] flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </form>
  );
}

/* ---------------- TOOLBOX ---------------- */

function ToolboxTab({ toast }: { toast: (m: string) => void }) {
  const [files, setFiles] = useState<
    { id: string; name: string; type: string; isPublic: boolean }[]
  >([]);
  const [notes, setNotes] = useState<
    { id: string; text: string; pinned: boolean }[]
  >([]);
  const [draft, setDraft] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-[color:var(--line)] bg-amber-400/5 border-amber-400/20 px-5 py-3 text-amber-500 text-sm">
        Note: Files here are managed privately. They are not shown as a public
        Resources page.
      </div>

      {/* File Vault */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-1">
              Tool 01
            </div>
            <div className="text-[var(--fg)] text-2xl tracking-tight">File Vault</div>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="h-10 px-4 rounded-full bg-[var(--accent)] text-[var(--app-bg)] flex items-center gap-2 hover:bg-[var(--accent)]"
          >
            <Upload className="w-4 h-4" /> Upload File
          </button>
        </div>
        <div className="rounded-2xl border border-[color:var(--line)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--surface-2)] text-[var(--muted-2)] text-xs tracking-[0.18em] uppercase">
              <tr>
                <th className="text-left px-4 py-3">File</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Visibility</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line-soft)]">
              {files.map((f) => (
                <tr key={f.id} className="hover:bg-[color:var(--hover)]">
                  <td className="px-4 py-4 text-[var(--fg)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--muted-2)]" />
                    {f.name}
                  </td>
                  <td className="px-4 py-4 text-[var(--muted)]">{f.type}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() =>
                        setFiles((arr) =>
                          arr.map((x) =>
                            x.id === f.id ? { ...x, isPublic: !x.isPublic } : x,
                          ),
                        )
                      }
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        f.isPublic
                          ? "bg-[color:var(--accent-soft)] text-[var(--accent)]"
                          : "bg-[color:var(--surface-2)] text-[var(--fg-2)]"
                      }`}
                    >
                      {f.isPublic ? "Public" : "Private"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `https://carlwang.cn/files/${f.id}`,
                          );
                          toast("Share link copied");
                        }}
                        icon={Copy}
                        label="Copy"
                      />
                      <IconBtn
                        onClick={() => {
                          if (confirm(`Delete "${f.name}"?`)) {
                            setFiles((arr) => arr.filter((x) => x.id !== f.id));
                            toast("File deleted");
                          }
                        }}
                        icon={Trash2}
                        label="Delete"
                        danger
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Notes */}
      <div>
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2">
          Tool 02
        </div>
        <div className="text-[var(--fg)] text-2xl tracking-tight mb-5">
          Quick Notes
        </div>
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <div className="flex gap-2 mb-5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Capture a thought..."
              className="flex-1 bg-[var(--app-bg)] border border-[color:var(--line)] rounded-xl px-4 h-11 text-[var(--fg)] placeholder-[color:var(--muted-3)] outline-none focus:border-[color:var(--accent)]/40"
            />
            <button
              onClick={() => {
                if (!draft.trim()) return;
                setNotes([
                  { id: String(Date.now()), text: draft, pinned: false },
                  ...notes,
                ]);
                setDraft("");
                toast("Note saved");
              }}
              className="h-11 px-5 rounded-xl bg-[var(--fg)] text-[var(--app-bg)] hover:opacity-90"
            >
              Save Note
            </button>
          </div>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="flex items-center gap-3 rounded-xl bg-[var(--app-bg)] border border-[color:var(--line-soft)] px-4 py-3"
              >
                <button
                  onClick={() =>
                    setNotes((arr) =>
                      arr.map((x) =>
                        x.id === n.id ? { ...x, pinned: !x.pinned } : x,
                      ),
                    )
                  }
                  className={`w-7 h-7 rounded-full grid place-items-center ${
                    n.pinned
                      ? "bg-amber-400/20 text-amber-500"
                      : "border border-[color:var(--line)] text-[var(--muted-2)]"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <span className="text-[var(--fg)] flex-1">{n.text}</span>
                <IconBtn
                  onClick={() =>
                    setNotes((arr) => arr.filter((x) => x.id !== n.id))
                  }
                  icon={Trash2}
                  label="Delete"
                  danger
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {uploadOpen && (
        <SidePanel title="Upload File" onClose={() => setUploadOpen(false)}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-[color:var(--line-strong)] p-10 text-center">
              <Upload className="w-6 h-6 text-[var(--accent)] mx-auto mb-3" />
              <div className="text-[var(--fg)]">Drop files here</div>
              <div className="text-[var(--muted-2)] text-sm">
                or click to browse - PDF, AEP, PNG, SVG, ZIP up to 50MB
              </div>
            </div>
            <Field label="File name" value="" onChange={() => {}} placeholder="auto from upload" />
            <Select
              label="File type"
              value="PDF"
              options={["PDF", "PNG", "SVG", "AEP", "ZIP", "Other"]}
              onChange={() => {}}
            />
            <Toggle label="Public" checked={false} onChange={() => {}} />
            <div className="flex justify-end gap-2 pt-4 border-t border-[color:var(--line)]">
              <button
                onClick={() => setUploadOpen(false)}
                className="h-10 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUploadOpen(false);
                  toast("File uploaded");
                }}
                className="h-10 px-5 rounded-full bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)]"
              >
                Upload
              </button>
            </div>
          </div>
        </SidePanel>
      )}
    </div>
  );
}

/* ---------------- LINKS ---------------- */

function LinksTab({ toast }: { toast: (m: string) => void }) {
  const { content, saveLink, deleteLink } = useContent();
  const links = content.links;
  const [panel, setPanel] = useState<null | { id?: string }>(null);
  const [qrFor, setQrFor] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-[var(--fg-2)]">{links.length} links</div>
        <button
          onClick={() => setPanel({})}
          className="h-10 px-4 rounded-full bg-[var(--accent)] text-[var(--app-bg)] flex items-center gap-2 hover:bg-[var(--accent)]"
        >
          <Plus className="w-4 h-4" /> Create Link
        </button>
      </div>
      <div className="rounded-2xl border border-[color:var(--line)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--surface-2)] text-[var(--muted-2)] text-xs tracking-[0.18em] uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Destination</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Clicks</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line-soft)]">
            {links.map((l) => (
              <tr key={l.id} className="hover:bg-[color:var(--hover)]">
                <td className="px-4 py-4 text-[var(--fg)]">{l.name}</td>
                <td className="px-4 py-4 text-[var(--fg-2)] font-mono text-xs">
                  {l.slug}
                </td>
                <td className="px-4 py-4 text-[var(--muted)] truncate max-w-[260px]">
                  {l.url}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => saveLink({ ...l, enabled: !l.enabled })}
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      l.enabled
                        ? "bg-[color:var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[color:var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {l.enabled ? "Enabled" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-4 text-[var(--fg-2)]">{l.clicks}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn
                      onClick={() => setPanel({ id: l.id })}
                      icon={Edit3}
                      label="Edit"
                    />
                    <IconBtn
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `https://carlwang.cn${l.slug}`,
                        );
                        toast("Link copied");
                      }}
                      icon={Copy}
                      label="Copy"
                    />
                    <IconBtn
                      onClick={() => setQrFor(l.id)}
                      icon={QrCode}
                      label="QR"
                    />
                    <IconBtn
                      onClick={() => {
                        if (confirm(`Delete "${l.name}"?`)) {
                          deleteLink(l.id);
                          toast("Link deleted");
                        }
                      }}
                      icon={Trash2}
                      label="Delete"
                      danger
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {panel && (
        <SidePanel
          title={panel.id ? "Edit Link" : "Create Link"}
          onClose={() => setPanel(null)}
        >
          <LinkForm
            initial={links.find((l) => l.id === panel.id)}
            onSave={(link) => {
              saveLink(link);
              setPanel(null);
              toast(panel.id ? "Link updated" : "Link created");
            }}
            onCancel={() => setPanel(null)}
          />
        </SidePanel>
      )}

      {qrFor && (
        <Modal onClose={() => setQrFor(null)} title="QR Code">
          <QRPreview
            url={`https://carlwang.cn${
              links.find((l) => l.id === qrFor)?.slug ?? ""
            }`}
            onCopy={() => toast("QR image copied")}
            onDownload={() => toast("QR downloaded")}
          />
        </Modal>
      )}
    </div>
  );
}

function LinkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ManagedLink;
  onSave: (link: ManagedLink) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    id: initial?.id ?? "",
    name: initial?.name ?? "",
    slug: initial?.slug ?? "/go/",
    url: initial?.url ?? "",
    enabled: initial?.enabled ?? true,
    clicks: initial?.clicks ?? 0,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          id: f.id || slugify(f.name),
          name: f.name,
          slug: f.slug.startsWith("/go/") ? f.slug : `/go/${f.slug}`,
          url: f.url,
          enabled: f.enabled,
          clicks: f.clicks,
        });
      }}
      className="space-y-4"
    >
      <Field label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
      <Field label="Slug" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} />
      <Field label="Destination URL" value={f.url} onChange={(v) => setF({ ...f, url: v })} placeholder="https://" />
      <Toggle label="Enabled" checked={f.enabled} onChange={(v) => setF({ ...f, enabled: v })} />
      <div className="flex justify-end gap-2 pt-4 border-t border-[color:var(--line)]">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-5 rounded-full bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)] flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </form>
  );
}

/* ---------------- QR ---------------- */

function QRTab({ toast }: { toast: (m: string) => void }) {
  const { content } = useContent();
  const [url, setUrl] = useState("https://carlwang.cn");
  const [selectedSlug, setSelectedSlug] = useState("Custom URL");
  const presets = content.links.filter((link) => link.enabled).map((link) => link.slug);

  return (
    <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 space-y-4">
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase">
          Source
        </div>
        <Field label="URL" value={url} onChange={setUrl} />
        <Select
          label="Or select an existing link"
          value={selectedSlug}
          options={["Custom URL", ...presets]}
          onChange={(v) => {
            setSelectedSlug(v);
            if (v !== "Custom URL")
              setUrl(`https://carlwang.cn${v}`);
          }}
        />
        <button
          onClick={() => toast("QR generated")}
          className="h-11 w-full rounded-xl bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)] flex items-center justify-center gap-2"
        >
          <QrCode className="w-4 h-4" /> Generate QR Code
        </button>
      </div>
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-4">
          Preview
        </div>
        <QRPreview
          url={url}
          onCopy={() => toast("QR image copied")}
          onDownload={() => toast("QR downloaded")}
        />
      </div>
    </div>
  );
}

function QRPreview({
  url,
  onCopy,
  onDownload,
}: {
  url: string;
  onCopy: () => void;
  onDownload: () => void;
}) {
  // pseudo QR using a 16x16 deterministic grid based on URL
  const cells = [];
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  for (let i = 0; i < 256; i++) {
    h = (h * 1103515245 + 12345) | 0;
    cells.push((h >> 8) & 1);
  }
  return (
    <div>
      <div
        className="aspect-square rounded-2xl bg-[var(--fg)] p-6 grid gap-[2px]"
        style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            className={c ? "bg-[var(--app-bg)]" : "bg-white"}
            style={{ aspectRatio: "1" }}
          />
        ))}
      </div>
      <div className="text-[var(--muted-2)] text-xs mt-3 font-mono truncate">{url}</div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onDownload}
          className="flex-1 h-10 rounded-xl bg-[var(--fg)] text-[var(--app-bg)] hover:opacity-90"
        >
          Download PNG
        </button>
        <button
          onClick={onCopy}
          className="flex-1 h-10 rounded-xl border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Copy Image
        </button>
      </div>
    </div>
  );
}

/* ---------------- SETTINGS ---------------- */

function SettingsTab({ toast }: { toast: (m: string) => void }) {
  const { content, saveSettings } = useContent();
  const [s, setS] = useState<SiteSettings>(content.settings);
  const [testingOss, setTestingOss] = useState(false);
  const oss = s.oss ?? {
    enabled: false,
    bucket: "",
    endpoint: "",
    directory: "uploads",
    accessKeyId: "",
    accessKeySecret: "",
    publicBaseUrl: "",
  };
  const setSettings = (next: SiteSettings) => {
    setS(next);
    saveSettings(next);
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveSettings(s);
        toast("Site settings saved");
      }}
      className="grid grid-cols-2 gap-6 max-lg:grid-cols-1"
    >
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 space-y-4">
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase">
          Identity
        </div>
        <Field label="Display name" value={s.name} onChange={(v) => setS({ ...s, name: v })} />
        <Field label="Role line" value={s.role} onChange={(v) => setS({ ...s, role: v })} />
        <Field label="Hero slogan" value={s.slogan} onChange={(v) => setS({ ...s, slogan: v })} />
        <Textarea label="Short bio" value={s.bio} onChange={(v) => setS({ ...s, bio: v })} />
      </div>
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 space-y-4">
        <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase">
          Contact & Profiles
        </div>
        <Field label="Email" value={s.email} onChange={(v) => setS({ ...s, email: v })} />
        <Field label="GitHub URL" value={s.github} onChange={(v) => setS({ ...s, github: v })} />
        <Field label="Xiaohongshu URL" value={s.xhs} onChange={(v) => setS({ ...s, xhs: v })} />
        <Field label="ZCOOL URL" value={s.zcool} onChange={(v) => setS({ ...s, zcool: v })} />
        <Field label="Behance URL" value={s.behance} onChange={(v) => setS({ ...s, behance: v })} />
        <Field label="LinkedIn URL" value={s.linkedin} onChange={(v) => setS({ ...s, linkedin: v })} />
      </div>
      <div className="col-span-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 max-lg:col-span-1 max-md:p-4">
        <Field label="Footer text" value={s.footer} onChange={(v) => setS({ ...s, footer: v })} />
      </div>
      <div className="col-span-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 space-y-4 max-lg:col-span-1 max-md:p-4">
        <div className="flex items-center justify-between">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase">
            Aliyun OSS Storage
          </div>
          <Toggle
            label="Enable"
            checked={oss.enabled}
            onChange={(enabled) => setSettings({ ...s, oss: { ...oss, enabled } })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <Field label="Bucket" value={oss.bucket} onChange={(v) => setS({ ...s, oss: { ...oss, bucket: v } })} placeholder="your-bucket-name" />
          <Field label="Endpoint" value={oss.endpoint} onChange={(v) => setS({ ...s, oss: { ...oss, endpoint: v } })} placeholder="oss-cn-shanghai.aliyuncs.com" />
          <Field label="Base directory" value={oss.directory} onChange={(v) => setS({ ...s, oss: { ...oss, directory: v } })} placeholder="uploads" />
          <Field label="Public base URL" value={oss.publicBaseUrl} onChange={(v) => setS({ ...s, oss: { ...oss, publicBaseUrl: v } })} placeholder="optional custom domain" />
          <Field label="AccessKey ID" value={oss.accessKeyId} onChange={(v) => setS({ ...s, oss: { ...oss, accessKeyId: v } })} />
          <Field label="AccessKey Secret" type="password" value={oss.accessKeySecret} onChange={(v) => setS({ ...s, oss: { ...oss, accessKeySecret: v } })} />
        </div>
        <div className="flex items-center justify-between border-t border-[color:var(--line)] pt-4">
          <div className="text-[var(--muted)] text-sm">
            Test upload writes a small file to your OSS bucket.
          </div>
          <button
            type="button"
            disabled={testingOss}
            onClick={async () => {
              setTestingOss(true);
              saveSettings(s);
              try {
                const file = new File(
                  [`ok ${new Date().toISOString()}`],
                  "oss-test.txt",
                  { type: "text/plain" },
                );
                await uploadToOss(file, oss, "test", "oss-test.txt");
                toast("OSS test upload succeeded");
              } catch (error) {
                toast(error instanceof Error ? error.message : "OSS test failed");
              } finally {
                setTestingOss(false);
              }
            }}
            className="h-10 px-4 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)] disabled:opacity-50"
          >
            {testingOss ? "Testing..." : "Test OSS Upload"}
          </button>
        </div>
      </div>
      <div className="col-span-2 flex justify-end">
        <button
          type="submit"
          className="h-12 px-6 rounded-full bg-[var(--accent)] text-[var(--app-bg)] hover:bg-[var(--accent)] flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </form>
  );
}

/* ---------------- SHARED CONTROLS ---------------- */

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "untitled"
  );
}

function createRichBlock(type: RichBlock["type"]): RichBlock {
  const newId = () =>
    `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  if (type === "column_list") {
    return {
      id: newId(),
      type,
      value: "",
      width: "wide",
      children: [
        {
          id: newId(),
          type: "column",
          value: "",
          children: [createRichBlock("paragraph")],
        },
        {
          id: newId(),
          type: "column",
          value: "",
          children: [createRichBlock("paragraph")],
        },
      ],
    };
  }
  if (type === "column") {
    return {
      id: newId(),
      type,
      value: "",
      children: [createRichBlock("paragraph")],
    };
  }
  const isText = isTextType(type);
  return {
    id: newId(),
    type,
    value: "",
    align: "left",
    size: "md",
    width: isText ? "wide" : "full",
  };
}

function ensureUniqueBlocks(blocks?: RichBlock[]) {
  const source = blocks?.length ? blocks : [createRichBlock("paragraph")];
  const seen = new Set<string>();
  return source.map((block, index) => {
    const id =
      block.id && !seen.has(block.id)
        ? block.id
        : `${block.id || "block"}-${index}`;
    seen.add(id);
    return { ...block, id };
  });
}

function textToRichBlocks(value?: string): RichBlock[] {
  if (!value?.trim()) return [createRichBlock("paragraph")];
  return value
    .split(/\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      id: `legacy-${index}`,
      type: "paragraph",
      value: paragraph,
      align: "left",
      size: "md",
      width: "wide",
    }));
}

function isTextType(type: RichBlock["type"]) {
  return [
    "text",
    "paragraph",
    "heading_1",
    "heading_2",
    "heading_3",
    "bulleted_list_item",
    "numbered_list_item",
    "quote",
    "callout",
    "code",
  ].includes(type);
}

function isEditableTextBlock(block: RichBlock) {
  return isTextType(block.type);
}

function blockLabel(type: RichBlock["type"]) {
  const labels: Partial<Record<RichBlock["type"], string>> = {
    text: "Paragraph",
    paragraph: "Paragraph",
    heading_1: "Heading 1",
    heading_2: "Heading 2",
    heading_3: "Heading 3",
    bulleted_list_item: "Bulleted list",
    numbered_list_item: "Numbered list",
    quote: "Quote",
    callout: "Callout",
    code: "Code",
    divider: "Divider",
    bookmark: "Bookmark",
    embed: "Embed",
    image: "Image",
    video: "Video",
    column_list: "Two columns",
    column: "Column",
  };
  return labels[type] || type;
}

function textBlockDefaultSize(type: RichBlock["type"]): RichBlock["size"] {
  if (type === "heading_1") return "xl";
  if (type === "heading_2") return "lg";
  if (type === "heading_3") return "md";
  return "md";
}

function RichContentEditor({
  label,
  blocks,
  uploadPathPrefix,
  onChange,
}: {
  label: string;
  blocks: RichBlock[];
  uploadPathPrefix: string;
  onChange: (blocks: RichBlock[]) => void;
}) {
  const safeBlocks = ensureUniqueBlocks(blocks);
  const [history, setHistory] = useState<RichBlock[][]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [plusMenuIndex, setPlusMenuIndex] = useState<number | null>(null);
  const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
  const commitChange = (next: RichBlock[]) => {
    setHistory((items) => [...items.slice(-19), safeBlocks]);
    onChange(next);
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    onChange(previous);
  };
  const updateBlock = (id: string, patch: Partial<RichBlock>) =>
    commitChange(safeBlocks.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  const insertBlockAfter = (index: number, type: RichBlock["type"]) => {
    const next = [...safeBlocks];
    next.splice(index + 1, 0, createRichBlock(type));
    setPlusMenuIndex(null);
    setSlashMenuIndex(null);
    commitChange(next);
  };
  const replaceBlock = (index: number, type: RichBlock["type"]) => {
    const next = [...safeBlocks];
    next[index] = {
      ...createRichBlock(type),
      id: safeBlocks[index].id,
    };
    setPlusMenuIndex(null);
    setSlashMenuIndex(null);
    commitChange(next);
  };
  const removeBlock = (id: string) =>
    commitChange(safeBlocks.length > 1 ? safeBlocks.filter((block) => block.id !== id) : safeBlocks);
  const updateColumnChild = (
    blockId: string,
    columnId: string,
    childId: string,
    patch: Partial<RichBlock>,
  ) =>
    commitChange(
      safeBlocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              children: (block.children || []).map((column) =>
                column.id !== columnId
                  ? column
                  : {
                      ...column,
                      children: (column.children || []).map((child) =>
                        child.id === childId ? { ...child, ...patch } : child,
                      ),
                    },
              ),
            },
      ),
    );
  const insertColumnChildAfter = (
    blockId: string,
    columnId: string,
    childIndex: number,
    type: RichBlock["type"] = "paragraph",
  ) =>
    commitChange(
      safeBlocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              children: (block.children || []).map((column) => {
                if (column.id !== columnId) return column;
                const nextChildren = [...(column.children || [])];
                nextChildren.splice(childIndex + 1, 0, createRichBlock(type));
                return { ...column, children: nextChildren };
              }),
            },
      ),
    );
  const removeColumnChild = (blockId: string, columnId: string, childId: string) =>
    commitChange(
      safeBlocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              children: (block.children || []).map((column) => {
                if (column.id !== columnId) return column;
                const nextChildren = (column.children || []).filter((child) => child.id !== childId);
                return {
                  ...column,
                  children: nextChildren.length ? nextChildren : [createRichBlock("paragraph")],
                };
              }),
            },
      ),
    );
  const moveBlock = (from: number, to: number) => {
    if (from === to || to < 0 || to >= safeBlocks.length) return;
    const next = [...safeBlocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commitChange(next);
  };
  const readClipboardImage = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  const commandItems = [
    { type: "paragraph" as const, title: "Text", body: "Plain paragraph" },
    { type: "heading_1" as const, title: "Heading 1", body: "Large section heading" },
    { type: "heading_2" as const, title: "Heading 2", body: "Medium section heading" },
    { type: "heading_3" as const, title: "Heading 3", body: "Small section heading" },
    { type: "bulleted_list_item" as const, title: "Bulleted list", body: "Simple list item" },
    { type: "numbered_list_item" as const, title: "Numbered list", body: "Numbered list item" },
    { type: "quote" as const, title: "Quote", body: "Indented quote block" },
    { type: "callout" as const, title: "Callout", body: "Highlighted note" },
    { type: "code" as const, title: "Code", body: "Code block" },
    { type: "image" as const, title: "Image", body: "Upload or paste image" },
    { type: "video" as const, title: "Video", body: "Upload video" },
    { type: "divider" as const, title: "Divider", body: "Horizontal rule" },
    { type: "column_list" as const, title: "Two columns", body: "Side-by-side layout" },
  ];

  return (
    <div
      onPaste={async (event) => {
        const files = Array.from(event.clipboardData.files).filter((file) =>
          file.type.startsWith("image/"),
        );
        if (!files.length) return;
        event.preventDefault();
        const images = await Promise.all(files.map(readClipboardImage));
        commitChange([
          ...safeBlocks,
          ...images.map((value) => ({
            ...createRichBlock("image"),
            value,
            width: "full" as const,
          })),
        ]);
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <label className="text-[var(--fg)] font-semibold block">{label}</label>
          <p className="mt-1 text-sm text-[var(--muted-2)]">
            Type directly, press Enter for a new block, or type / for commands.
          </p>
        </div>
        <button
          type="button"
          onClick={undo}
          disabled={!history.length}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--line)] bg-[var(--app-bg)] px-3 text-sm text-[var(--fg)] hover:bg-[color:var(--hover)] disabled:opacity-40 disabled:hover:bg-[var(--app-bg)]"
        >
          <Undo2 className="w-4 h-4" /> Undo
        </button>
      </div>
      <div className="rounded-2xl border border-[color:var(--line)] bg-[var(--app-bg)] px-8 py-7">
        {safeBlocks.map((block, index) => (
          <div
            key={block.id}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverIndex(index);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(event) => {
              event.preventDefault();
              const from = Number(event.dataTransfer.getData("text/plain"));
              setDragOverIndex(null);
              moveBlock(from, index);
            }}
            className={`group relative -mx-5 grid grid-cols-[36px_minmax(0,1fr)] gap-2 rounded-xl px-2 py-1 transition-colors ${
              dragOverIndex === index
                ? "bg-[color:var(--accent-soft)]"
                : "hover:bg-[color:var(--hover)]"
            }`}
          >
            <div className="relative flex items-start justify-center gap-1 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setPlusMenuIndex(plusMenuIndex === index ? null : index)}
                className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[var(--fg)]"
                title="Add block"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", String(index));
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragOverIndex(null)}
                className="flex cursor-grab items-center gap-1 text-[var(--muted)] active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              {plusMenuIndex === index && (
                <CommandMenu
                  items={commandItems}
                  onPick={(type) => insertBlockAfter(index, type)}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs text-[var(--muted-2)]">{blockLabel(block.type)}</span>
                <BlockToolbar
                  block={block}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  onDelete={() => removeBlock(block.id)}
                  onMoveUp={() => moveBlock(index, index - 1)}
                  onMoveDown={() => moveBlock(index, index + 1)}
                  canMoveUp={index > 0}
                  canMoveDown={index < safeBlocks.length - 1}
                />
              </div>

            {isEditableTextBlock(block) && (
              <EditableTextBlock
                block={block}
                className={richBlockClass(block)}
                style={richBlockStyle(block)}
                onSlash={(open) => setSlashMenuIndex(open ? index : null)}
                onChange={(value) => updateBlock(block.id, { value })}
                onEnter={() => insertBlockAfter(index, "paragraph")}
                onEmptyBackspace={() => removeBlock(block.id)}
                onEscape={() => {
                  setSlashMenuIndex(null);
                  setPlusMenuIndex(null);
                }}
              >
                {slashMenuIndex === index && (
                  <CommandMenu
                    items={commandItems}
                    align="content"
                    onPick={(type) => replaceBlock(index, type)}
                  />
                )}
              </EditableTextBlock>
            )}

            {block.type === "column_list" && (
              <ColumnListEditor
                block={block}
                uploadPathPrefix={uploadPathPrefix}
                onChangeChild={(columnId, childId, patch) =>
                  updateColumnChild(block.id, columnId, childId, patch)
                }
                onEnterChild={(columnId, childIndex) =>
                  insertColumnChildAfter(block.id, columnId, childIndex)
                }
                onRemoveChild={(columnId, childId) =>
                  removeColumnChild(block.id, columnId, childId)
                }
              />
            )}

            {block.type === "divider" && (
              <div className="px-3 py-8">
                <hr className="border-[color:var(--line)]" />
              </div>
            )}

            {(block.type === "bookmark" || block.type === "embed") && (
              <input
                value={block.value}
                onChange={(event) => updateBlock(block.id, { value: event.target.value, url: event.target.value })}
                className="h-11 w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-sm text-[var(--fg)] outline-none focus:border-[color:var(--accent)]/60"
                placeholder="Paste a URL"
              />
            )}

            {block.type === "image" && (
              <div className={`${richBlockClass(block)} px-0`} style={richBlockStyle(block)}>
                {block.value && (
                  <img src={block.value} alt="" className="w-full rounded-xl object-cover" />
                )}
                {!block.value && (
                  <UploadBox
                    label=""
                    accept="image/*"
                    pathPrefix={uploadPathPrefix}
                    onFiles={(files) => updateBlock(block.id, { value: files[0] ?? block.value })}
                  />
                )}
              </div>
            )}

            {block.type === "video" && (
              <div className={`${richBlockClass(block)} px-0`} style={richBlockStyle(block)}>
                {block.value && (
                  <video src={block.value} controls className="aspect-video w-full rounded-xl object-cover" />
                )}
                {!block.value && (
                  <UploadBox
                    label=""
                    accept="video/*"
                    pathPrefix={uploadPathPrefix}
                    onFiles={(files) => updateBlock(block.id, { value: files[0] ?? block.value })}
                  />
                )}
              </div>
            )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableTextBlock({
  block,
  className,
  style,
  children,
  onSlash,
  onChange,
  onEnter,
  onEmptyBackspace,
  onEscape,
}: {
  block: RichBlock;
  className: string;
  style: CSSProperties;
  children?: ReactNode;
  onSlash?: (open: boolean) => void;
  onChange: (value: string) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onEscape?: () => void;
}) {
  return (
    <div className="relative">
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Type '/' for commands"
        className={`${className} notion-editable min-h-[36px] cursor-text whitespace-pre-wrap break-words px-0 py-1 outline-none empty:before:text-[var(--muted-3)] empty:before:content-[attr(data-placeholder)]`}
        style={style}
        onInput={(event) => {
          const value = event.currentTarget.textContent || "";
          onSlash?.(value.trim() === "/");
        }}
        onBlur={(event) => onChange(event.currentTarget.textContent || "")}
        onKeyDown={(event) => {
          const value = event.currentTarget.textContent || "";
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onChange(value);
            onEnter();
          }
          if (event.key === "Backspace" && !value && block.value === "") {
            event.preventDefault();
            onEmptyBackspace();
          }
          if (event.key === "/" && !value) onSlash?.(true);
          if (event.key === "Escape") onEscape?.();
        }}
      >
        {block.value}
      </div>
      {children}
    </div>
  );
}

function ColumnListEditor({
  block,
  uploadPathPrefix,
  onChangeChild,
  onEnterChild,
  onRemoveChild,
}: {
  block: RichBlock;
  uploadPathPrefix: string;
  onChangeChild: (columnId: string, childId: string, patch: Partial<RichBlock>) => void;
  onEnterChild: (columnId: string, childIndex: number) => void;
  onRemoveChild: (columnId: string, childId: string) => void;
}) {
  const columns = block.children?.length ? block.children : createRichBlock("column_list").children || [];
  return (
    <div className="my-4 grid gap-5 md:grid-cols-2">
      {columns.slice(0, 2).map((column) => (
        <div
          key={column.id}
          className="min-w-0 rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3"
        >
          {(column.children || []).map((child, childIndex) => {
            if (isEditableTextBlock(child)) {
              return (
                <EditableTextBlock
                  key={child.id}
                  block={child}
                  className={richBlockClass(child)}
                  style={richBlockStyle(child)}
                  onChange={(value) => onChangeChild(column.id, child.id, { value })}
                  onEnter={() => onEnterChild(column.id, childIndex)}
                  onEmptyBackspace={() => onRemoveChild(column.id, child.id)}
                />
              );
            }
            if (child.type === "image") {
              return (
                <div key={child.id} className="my-3">
                  {child.value ? (
                    <img src={child.value} alt="" className="w-full rounded-xl object-cover" />
                  ) : (
                    <UploadBox
                      label=""
                      accept="image/*"
                      pathPrefix={uploadPathPrefix}
                      onFiles={(files) =>
                        onChangeChild(column.id, child.id, { value: files[0] ?? child.value })
                      }
                    />
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}

function CommandMenu({
  items,
  onPick,
  align = "gutter",
}: {
  items: Array<{ type: RichBlock["type"]; title: string; body: string }>;
  onPick: (type: RichBlock["type"]) => void;
  align?: "gutter" | "content";
}) {
  return (
    <div
      className={`absolute z-30 w-[280px] overflow-hidden rounded-xl border border-[color:var(--line)] bg-[var(--surface)] py-1 shadow-xl backdrop-blur ${
        align === "content" ? "left-0 top-10" : "left-8 top-8"
      }`}
    >
      {items.map((item) => (
        <button
          key={item.type}
          type="button"
          onClick={() => onPick(item.type)}
          className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-[color:var(--hover)]"
        >
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--surface-2)] text-xs text-[var(--fg)]">
            {blockMenuIcon(item.type)}
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-[var(--fg)]">{item.title}</span>
            <span className="block text-xs text-[var(--muted-2)]">{item.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function blockMenuIcon(type: RichBlock["type"]) {
  if (type === "heading_1") return "H1";
  if (type === "heading_2") return "H2";
  if (type === "heading_3") return "H3";
  if (type === "bulleted_list_item") return "-";
  if (type === "numbered_list_item") return "1";
  if (type === "quote") return "\"";
  if (type === "callout") return "i";
  if (type === "code") return "</>";
  if (type === "image") return "img";
  if (type === "video") return "vid";
  if (type === "divider") return "--";
  return "T";
}

function BlockToolbar({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: RichBlock;
  onChange: (patch: Partial<RichBlock>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const selectClass =
    "h-8 rounded-lg border border-[color:var(--line)] bg-[var(--app-bg)] px-2 text-xs text-[var(--fg)] outline-none focus:border-[color:var(--accent)]/60";
  const buttonClass =
    "h-8 min-w-8 rounded-lg border border-[color:var(--line)] bg-[var(--app-bg)] px-2 text-xs text-[var(--fg)] hover:bg-[color:var(--hover)] disabled:opacity-35 disabled:hover:bg-[var(--app-bg)]";
  return (
    <div className="flex flex-wrap items-center justify-end gap-1 rounded-xl border border-[color:var(--line)] bg-[var(--surface)] p-1 shadow-sm">
      <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className={buttonClass} title="Move up">
        <ArrowUp className="w-4 h-4" />
      </button>
      <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className={buttonClass} title="Move down">
        <ArrowDown className="w-4 h-4" />
      </button>
      {isEditableTextBlock(block) && (
        <>
          <select
            value={block.type === "text" ? "paragraph" : block.type}
            onChange={(event) =>
              onChange({
                type: event.target.value as RichBlock["type"],
                size: textBlockDefaultSize(event.target.value as RichBlock["type"]),
                weight: event.target.value.startsWith("heading") ? "bold" : "normal",
              })
            }
            className={`${selectClass} w-[132px]`}
          >
            <option value="paragraph">Paragraph</option>
            <option value="heading_1">Heading 1</option>
            <option value="heading_2">Heading 2</option>
            <option value="heading_3">Heading 3</option>
            <option value="bulleted_list_item">Bulleted list</option>
            <option value="numbered_list_item">Numbered list</option>
            <option value="quote">Quote</option>
            <option value="callout">Callout</option>
            <option value="code">Code</option>
          </select>
          <select value={block.fontFamily ?? "Inter"} onChange={(event) => onChange({ fontFamily: event.target.value })} className={`${selectClass} hidden xl:block`}>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
          </select>
          <input type="color" value={block.color ?? "#111111"} onChange={(event) => onChange({ color: event.target.value })} className="hidden h-8 w-9 rounded-lg border border-[color:var(--line)] bg-[var(--app-bg)] p-1 xl:block" title="Text color" />
          <button type="button" onClick={() => onChange({ weight: block.weight === "bold" ? "normal" : "bold" })} className={`${buttonClass} font-bold`}>B</button>
          <button type="button" onClick={() => onChange({ italic: !block.italic })} className={`${buttonClass} italic`}>I</button>
          <button type="button" onClick={() => onChange({ underline: !block.underline })} className={`${buttonClass} underline`}>U</button>
          <select value={block.align ?? "left"} onChange={(event) => onChange({ align: event.target.value as RichBlock["align"] })} className={`${selectClass} hidden 2xl:block`}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <select value={block.width ?? "full"} onChange={(event) => onChange({ width: event.target.value as RichBlock["width"] })} className={`${selectClass} hidden 2xl:block`}>
            <option value="full">Full</option>
            <option value="wide">Wide</option>
            <option value="half">Half</option>
          </select>
        </>
      )}
      <button type="button" onClick={onDelete} className={`${buttonClass} text-rose-500`}>x</button>
    </div>
  );
}

function richBlockClass(block: RichBlock) {
  const align = block.align === "center" ? "text-center mx-auto" : block.align === "right" ? "text-right ml-auto" : "text-left";
  const width = block.width === "half" ? "max-w-[520px]" : block.width === "wide" ? "max-w-[860px]" : "w-full";
  if (block.type === "heading_1") return `${width} ${align} text-4xl font-semibold leading-tight`;
  if (block.type === "heading_2") return `${width} ${align} text-3xl font-semibold leading-tight`;
  if (block.type === "heading_3") return `${width} ${align} text-2xl font-semibold leading-snug`;
  if (block.type === "quote") return `${width} ${align} border-l-2 border-[color:var(--fg)] pl-4 text-xl leading-8`;
  if (block.type === "callout") return `${width} ${align} rounded-xl bg-[color:var(--surface-2)] px-4 text-base leading-8`;
  if (block.type === "code") return `${width} ${align} rounded-xl bg-[#111] px-4 font-mono text-sm leading-7 text-white`;
  if (block.type === "bulleted_list_item") return `${width} ${align} pl-6 text-base leading-8 before:content-['-'] before:-ml-5 before:mr-3 before:text-[var(--muted)]`;
  if (block.type === "numbered_list_item") return `${width} ${align} pl-6 text-base leading-8`;
  const size =
    block.size === "xl"
      ? "text-3xl"
      : block.size === "lg"
        ? "text-2xl"
        : block.size === "sm"
          ? "text-sm"
          : "text-base";
  return `${width} ${align} ${size}`;
}

function richBlockStyle(block: RichBlock): CSSProperties {
  return {
    color: block.color,
    fontFamily: block.fontFamily,
    fontWeight: block.weight === "bold" ? 700 : block.weight === "medium" ? 500 : 400,
    fontStyle: block.italic ? "italic" : undefined,
    textDecoration: block.underline ? "underline" : undefined,
    lineHeight: 1.75,
  };
}

function IconBtn({
  onClick,
  icon: Icon,
  label,
  danger,
  active,
}: {
  onClick: () => void;
  icon: any;
  label: string;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-8 rounded-lg grid place-items-center transition-colors ${
        active
          ? "bg-amber-400/20 text-amber-500"
          : danger
          ? "text-rose-500 hover:bg-rose-500/10"
          : "text-[var(--muted)] hover:bg-[color:var(--hover)] hover:text-[var(--fg)]"
      }`}
    >
      <Icon className="w-4 h-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}

function summaryFromRichContent(blocks?: RichBlock[], fallback?: string) {
  const text =
    blocks?.find((block) => block.type === "text" && block.value.trim())?.value ||
    fallback ||
    "";
  return text.replace(/\s+/g, " ").trim();
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--app-bg)] border border-[color:var(--line)] rounded-xl px-4 h-11 text-[var(--fg)] placeholder-[color:var(--muted-3)] outline-none focus:border-[color:var(--accent)]/40"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2 block">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--app-bg)] border border-[color:var(--line)] rounded-xl px-4 py-3 text-[var(--fg)] placeholder-[color:var(--muted-3)] outline-none focus:border-[color:var(--accent)]/40"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--app-bg)] border border-[color:var(--line)] rounded-xl px-4 h-11 text-[var(--fg)] outline-none focus:border-[color:var(--accent)]/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[color:var(--line)] px-4 h-11 bg-[var(--app-bg)]">
      <span className="text-[var(--fg-2)] text-sm">{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`grid h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-[var(--accent)]" : "bg-[color:var(--surface-2)]"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-[var(--fg)] transition-all ${
            checked ? "ml-auto" : "ml-0"
          }`}
        />
      </button>
    </div>
  );
}

export function UploadBox({
  label,
  accept,
  multiple,
  pathPrefix,
  onFiles,
}: {
  label: string;
  accept?: string;
  multiple?: boolean;
  pathPrefix?: string;
  onFiles?: (files: string[]) => void;
}) {
  const [status, setStatus] = useState("");
  const { content } = useContent();

  const readFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    setStatus("Uploading...");
    try {
      const oss = content.settings.oss;
      let dataUrls: string[];
      if (oss?.enabled) {
        if (!canUploadToOss(oss)) {
          throw new Error("OSS is enabled but incomplete. Save bucket, endpoint, AccessKey ID and Secret.");
        }
        dataUrls = await Promise.all(
          files.map((file) => uploadToOss(file, oss, pathPrefix)),
        );
      } else {
        dataUrls = await Promise.all(
          files.map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
              }),
          ),
        );
      }
      setStatus(`${files.length} file${files.length > 1 ? "s" : ""} attached`);
      onFiles?.(dataUrls);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <div>
      {label && (
        <label className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-2 block">
          {label}
        </label>
      )}
      <label className="block rounded-xl border border-dashed border-[color:var(--line-strong)] px-4 py-6 text-center text-[var(--muted-2)] text-sm hover:bg-[color:var(--hover)] cursor-pointer">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => readFiles(event.target.files)}
        />
        {status || "Click to upload"}
      </label>
    </div>
  );
}

function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[color:var(--app-bg)]/88 backdrop-blur-3xl px-4 max-md:px-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1320px] max-h-[88vh] bg-[var(--app-bg)] border border-[color:var(--line)] rounded-3xl overflow-y-auto shadow-2xl max-md:h-dvh max-md:max-h-dvh max-md:rounded-none max-md:border-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[color:var(--line)] flex items-center justify-between sticky top-0 bg-[color:var(--app-bg)]/95 backdrop-blur max-md:px-4 max-md:py-4">
          <div className="text-[var(--fg)] text-xl tracking-tight">{title}</div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--fg)]"
          >
            x
          </button>
        </div>
        <div className="p-6 max-md:p-4">{children}</div>
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[color:var(--app-bg)]/88 backdrop-blur-3xl"
      onClick={onClose}
    >
      <div
        className="w-[420px] bg-[var(--app-bg)] border border-[color:var(--line)] rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[color:var(--line)] flex items-center justify-between">
          <div className="text-[var(--fg)] tracking-tight">{title}</div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--fg)]">
            x
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
