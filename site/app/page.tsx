"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ViewName = "创作" | "项目" | "灵感" | "导出";
type ThemeMode = "light" | "dark";
type AvatarMode = "default" | "camera" | "inspiration";
type CreationReference = {
  id: string;
  title: string;
  tone: string;
  source: "默认" | "相册" | "灵感";
  previewUrl?: string;
};
type ConceptSketch = {
  id: string;
  title: string;
  caption: string;
  form: "fold" | "cylinder" | "arch" | "module" | "sphere";
  palette: "orange" | "blue" | "green" | "rose" | "sand" | "violet";
  createdAt: string;
};
type EditableTextBlock = {
  id: string;
  text: string;
  fontSize: number;
  width: number;
  height: number;
};
type GenerationResult = {
  understanding: string;
  directions: string[];
  tags: string[];
  concept: Omit<ConceptSketch, "id" | "createdAt">;
};
type DeckResult = {
  title: string;
  subtitle: string;
  slides: Array<{ title: string; body: string; bullets: string[] }>;
};
type Project = {
  name: string;
  meta: string;
  versions: number;
  tone: string;
  status: string;
  pattern: number;
  aiUnderstanding: string;
  aiTags: string[];
  sketches: ConceptSketch[];
  textBlocks: EditableTextBlock[];
};

type VoiceMode = "audio" | "text";
type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const seedSketch = (id: string, title: string, caption: string, form: ConceptSketch["form"], palette: ConceptSketch["palette"]): ConceptSketch => ({
  id, title, caption, form, palette, createdAt: "早期方案",
});
const emptyProjectFields = { aiUnderstanding: "尚未生成 AI 需求理解", aiTags: [] as string[], sketches: [] as ConceptSketch[], textBlocks: [] as EditableTextBlock[] };
const allProjects: Project[] = [
  { name: "模块化通勤灯", meta: "更新于 5 分钟前", versions: 8, tone: "orange", status: "进行中", pattern: 1, ...emptyProjectFields },
  { name: "桌面空气净化器", meta: "更新于昨天", versions: 4, tone: "blue", status: "进行中", pattern: 2, ...emptyProjectFields },
  { name: "便携咖啡研磨器", meta: "更新于 3 天前", versions: 12, tone: "green", status: "已完成", pattern: 3, aiUnderstanding: "面向轻量户外与家庭使用，强调单手操作、低残粉和可拆洗结构。", aiTags: ["便携", "单手操作", "易清洁"], sketches: [seedSketch("coffee-1", "环抱式研磨仓", "圆柱主仓与环形握持区形成稳定、紧凑的使用姿态。", "cylinder", "green")], textBlocks: [] },
  { name: "陪伴型香氛音箱", meta: "更新于 7 月 12 日", versions: 6, tone: "rose", status: "进行中", pattern: 4, ...emptyProjectFields },
  { name: "折叠户外水壶", meta: "更新于 7 月 8 日", versions: 9, tone: "sand", status: "已完成", pattern: 5, aiUnderstanding: "通过可压缩折叠结构降低收纳体积，同时保留可靠握持与饮水体验。", aiTags: ["折叠", "户外", "轻量"], sketches: [seedSketch("bottle-1", "折线式壶身", "连续折面引导压缩方向，并用顶部硬环保持饮水口稳定。", "fold", "sand")], textBlocks: [] },
  { name: "无障碍厨房计时器", meta: "更新于 6 月 26 日", versions: 5, tone: "violet", status: "已归档", pattern: 6, ...emptyProjectFields },
];

const inspirationPosts = [
  { title: "单一转轴的折叠语言", author: "Mori Studio", tag: "结构", tone: "lime", height: "tall", categories: ["产品"] },
  { title: "柔和边界与家庭感", author: "Note Design", tag: "CMF", tone: "clay", height: "medium", categories: ["产品", "配色"] },
  { title: "半透明材料的光影层次", author: "Aperture Lab", tag: "材质", tone: "glass", height: "short", categories: ["材质"] },
  { title: "为小空间保留呼吸感", author: "Nook Journal", tag: "空间", tone: "blue", height: "tall", categories: ["空间"] },
  { title: "克制的按钮反馈", author: "Everyday Objects", tag: "交互", tone: "ink", height: "medium", categories: ["交互"] },
  { title: "便携产品的握持曲线", author: "Forma", tag: "人体工学", tone: "sage", height: "short", categories: ["产品"] },
  { title: "将功能收进一条线", author: "Minimal Archive", tag: "形态", tone: "paper", height: "tall", categories: ["产品"] },
  { title: "暖灰色的安静表达", author: "Soft Goods", tag: "配色", tone: "stone", height: "medium", categories: ["配色", "材质"] },
  { title: "机械细节也可以很温柔", author: "Index Works", tag: "细节", tone: "orange", height: "short", categories: ["产品", "交互"] },
  { title: "在桌面上创造微型地景", author: "Field Notes", tag: "概念", tone: "violet", height: "tall", categories: ["空间"] },
];

function renderInspirationReference(tone: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  const palette: Record<string, [string, string, string]> = {
    lime: ["#edf1d7", "#a9bf64", "#33462c"], clay: ["#efe2d8", "#bd8872", "#4b342f"],
    glass: ["#e4eff0", "#86aeb4", "#33494d"], blue: ["#e1ebf2", "#6d96b4", "#273d4d"],
    ink: ["#dedfdc", "#59605c", "#1f2823"], sage: ["#e4eadf", "#7d9a77", "#30422f"],
    paper: ["#f2eee3", "#c6ae82", "#493f31"], stone: ["#e8e5df", "#9a948a", "#3e3b37"],
    orange: ["#f4e3d6", "#da8a50", "#4f3526"], violet: ["#e9e3f0", "#917ca9", "#3b3047"],
  };
  const [light, accent, dark] = palette[tone] || palette.sage;
  const gradient = context.createLinearGradient(0, 0, 960, 720);
  gradient.addColorStop(0, light);
  gradient.addColorStop(1, "#faf8f2");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 960, 720);
  context.strokeStyle = `${dark}35`;
  context.lineWidth = 1;
  for (let x = 0; x < 960; x += 60) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 720); context.stroke(); }
  for (let y = 0; y < 720; y += 60) { context.beginPath(); context.moveTo(0, y); context.lineTo(960, y); context.stroke(); }
  context.save();
  context.translate(480, 350);
  context.rotate(-0.12);
  context.fillStyle = accent;
  context.strokeStyle = dark;
  context.lineWidth = 9;
  context.beginPath();
  context.roundRect(-180, -155, 360, 310, 84);
  context.fill();
  context.stroke();
  context.fillStyle = light;
  context.beginPath();
  context.ellipse(0, -95, 112, 38, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = dark;
  context.beginPath();
  context.arc(0, 30, 47, 0, Math.PI * 2);
  context.fill();
  context.restore();
  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewName>("创作");
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["桌面空气净化器"]);
  const [projects, setProjects] = useState(allProjects);
  const [savedPosts, setSavedPosts] = useState<string[]>(["单一转轴的折叠语言"]);
  const [likedPosts, setLikedPosts] = useState<string[]>(["柔和边界与家庭感"]);
  const [projectFilter, setProjectFilter] = useState("全部");
  const [inspirationFilter, setInspirationFilter] = useState("为你推荐");
  const [highlightedProject, setHighlightedProject] = useState("");
  const [styleReferences, setStyleReferences] = useState<(typeof inspirationPosts)[number][]>([]);
  const [creationReferences, setCreationReferences] = useState<CreationReference[]>([
    { id: "starter-reference", title: "折叠灯参考", tone: "orange", source: "默认" },
  ]);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("default");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [publishedProjectNames, setPublishedProjectNames] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem("sketchflow-theme");
      const nextTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light";
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [profileOpen]);

  const promptCount = useMemo(() => prompt.trim().length, [prompt]);
  const visibleProjects = projectFilter === "全部"
    ? projects
    : projects.filter((project) => project.status === projectFilter);
  const visibleRecentProjects = projects.filter((project) => project.status !== "已归档").slice(0, 8);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const switchView = (view: ViewName) => {
    setEditingProjectName("");
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generate = async (features: string[]) => {
    if (!prompt.trim()) {
      notify("请先描述你的设计想法");
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "create",
          prompt: prompt.trim(),
          features,
          references: creationReferences.filter((item) => item.previewUrl?.startsWith("data:image/")).slice(0, 3).map((item) => item.previewUrl),
        }),
      });
      const payload = await response.json() as GenerationResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "生成失败");
      setGenerationResult(payload);
      notify("Kimi 已完成需求理解与概念草图方案");
    } catch (error) {
      notify(error instanceof Error ? error.message : "生成失败，请稍后重试");
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  const toggleSavedPost = (title: string) => {
    setSavedPosts((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  };

  const toggleLikedPost = (title: string) => {
    setLikedPosts((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  };

  const showProject = (name: string) => {
    setProjectFilter("全部");
    setHighlightedProject(name);
    switchView("项目");
    notify(`已定位到「${name}」`);
    window.setTimeout(() => setHighlightedProject(""), 2400);
  };

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("sketchflow-theme", nextTheme);
  };

  const addInspirationToCreation = (post: (typeof inspirationPosts)[number]) => {
    setCreationReferences((current) =>
      current.some((item) => item.title === post.title)
        ? current
        : [...current, { id: `inspiration-${post.title}`, title: post.title, tone: post.tone, source: "灵感", previewUrl: renderInspirationReference(post.tone) }],
    );
    switchView("创作");
    notify(`已将「${post.title}」添加到创作内容参考`);
  };

  const addStyleReference = (post: (typeof inspirationPosts)[number]) => {
    setStyleReferences((current) =>
      current.some((item) => item.title === post.title) ? current : [...current, post],
    );
    notify(`已将「${post.title}」添加为导出风格参考`);
  };

  const addAlbumReference = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCreationReferences((current) => [
        ...current,
        { id: `album-${Date.now()}`, title: file.name, tone: "album", source: "相册", previewUrl: String(reader.result) },
      ]);
      notify("已从相册添加创作参考");
    };
    reader.readAsDataURL(file);
  };

  const removeCreationReference = (id: string) => {
    setCreationReferences((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const updateAvatarFromFile = (file: File) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarMode("default");
    notify("头像已从相册更新");
  };

  const archiveProject = (name: string) => {
    setProjects((current) => current.map((project) =>
      project.name === name ? { ...project, status: "已归档" } : project,
    ));
    notify(`「${name}」已移入归档`);
  };

  const restoreProject = (name: string) => {
    setProjects((current) => current.map((project) =>
      project.name === name ? { ...project, status: "进行中" } : project,
    ));
    notify(`「${name}」已恢复到进行中项目`);
  };

  const deleteProject = (name: string) => {
    setProjects((current) => current.filter((project) => project.name !== name));
    setFavorites((current) => current.filter((item) => item !== name));
    notify(`「${name}」已彻底删除`);
  };

  const createProject = ({ name, tone, pattern }: { name: string; tone: string; pattern: number }) => {
    if (projects.some((project) => project.name === name)) {
      notify("已存在同名项目，请更换项目名称");
      return false;
    }
    setProjects((current) => [
      { name, tone, pattern, versions: 0, status: "进行中", meta: "刚刚创建", ...emptyProjectFields },
      ...current,
    ]);
    setNewProjectOpen(false);
    notify(`新项目「${name}」已创建`);
    return true;
  };

  const saveGeneration = (projectName: string) => {
    if (!generationResult) return;
    const sketch: ConceptSketch = {
      ...generationResult.concept,
      id: `sketch-${Date.now()}`,
      createdAt: "刚刚生成",
    };
    setProjects((current) => current.map((project) => project.name === projectName ? {
      ...project,
      aiUnderstanding: generationResult.understanding,
      aiTags: generationResult.tags,
      sketches: [sketch, ...project.sketches],
      versions: project.versions + 1,
      meta: "刚刚更新",
    } : project));
    setGenerationResult(null);
    notify(`结果已保存到「${projectName}」`);
  };

  const updateProject = (updated: Project) => {
    setProjects((current) => current.map((project) => project.name === updated.name ? updated : project));
  };

  return (
    <main className="app-page">
      <section className="app-shell">
        <aside className="rail">
          <div className="brand" aria-label="灵图 SketchFlow">
            <span className="brand-mark" aria-hidden="true"><span className="brand-mark-accent" /></span>
            <span className="brand-copy"><b>灵图</b><small>SketchFlow</small></span>
          </div>

          <nav className="primary-nav" aria-label="主导航">
            {([["创作", "✦"], ["项目", "▦"], ["灵感", "◉"], ["导出", "↗"]] as [ViewName, string][]).map(([label, icon]) => (
              <button
                className={activeView === label ? "nav-item active" : "nav-item"}
                key={label}
                onClick={() => switchView(label)}
                aria-current={activeView === label ? "page" : undefined}
              >
                <span>{icon}</span>{label}
              </button>
            ))}
          </nav>

          <button
            className="profile"
            onClick={() => setProfileOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
          >
            <AvatarVisual className="avatar" mode={avatarMode} previewUrl={avatarPreview} />
            <span><b>{isLoggedIn ? "用户名称" : "登录"}</b><small>{isLoggedIn ? "个人中心" : "未登录"}</small></span>
            <span className="profile-more">•••</span>
          </button>
        </aside>

        <div className="workspace">
          {editingProjectName ? (
            <ProjectEditor
              project={projects.find((item) => item.name === editingProjectName) ?? projects[0]}
              onBack={() => setEditingProjectName("")}
              onUpdate={updateProject}
              notify={notify}
            />
          ) : activeView === "创作" ? (
            <CreatorView
              prompt={prompt}
              setPrompt={setPrompt}
              promptCount={promptCount}
              generating={generating}
              generate={generate}
              notify={notify}
              onShowProjects={() => switchView("项目")}
              onShowProject={showProject}
              references={creationReferences}
              onRemoveReference={removeCreationReference}
              onAddAlbumReference={addAlbumReference}
              onOpenInspiration={() => {
                switchView("灵感");
                notify("点击灵感卡片底部的＋，添加为创作内容参考");
              }}
              recentItems={visibleRecentProjects}
              onNewProject={() => setNewProjectOpen(true)}
              result={generationResult}
            />
          ) : activeView === "项目" ? (
            <ProjectsView
              projects={visibleProjects}
              filter={projectFilter}
              setFilter={setProjectFilter}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              highlightedProject={highlightedProject}
              onArchive={archiveProject}
              onRestore={restoreProject}
              onDelete={deleteProject}
              onNewProject={() => setNewProjectOpen(true)}
              notify={notify}
              onEdit={setEditingProjectName}
            />
          ) : activeView === "灵感" ? (
            <InspirationView
              filter={inspirationFilter}
              setFilter={setInspirationFilter}
              savedPosts={savedPosts}
              likedPosts={likedPosts}
              toggleSavedPost={toggleSavedPost}
              toggleLikedPost={toggleLikedPost}
              onAddToCreator={addInspirationToCreation}
              onAddToStyleReference={addStyleReference}
              notify={notify}
              projects={projects.filter((project) => project.status !== "已归档")}
              publishedProjectNames={publishedProjectNames}
              onUploadProject={(name) => {
                setPublishedProjectNames((current) => current.includes(name) ? current : [name, ...current]);
                notify(`「${name}」已上传到灵感广场`);
              }}
            />
          ) : (
            <ExportView
              completedProjects={projects.filter((project) => project.status === "已完成")}
              styleReferences={styleReferences}
              onRemoveStyleReference={(title) =>
                setStyleReferences((current) => current.filter((item) => item.title !== title))
              }
              onOpenInspiration={() => switchView("灵感")}
              notify={notify}
            />
          )}
        </div>

        <nav className="mobile-nav" aria-label="移动端导航">
          {([["创作", "✦"], ["项目", "▦"], ["灵感", "◌"], ["导出", "↗"]] as [ViewName, string][]).map(([label, icon]) => (
            <button key={label} className={activeView === label ? "active" : ""} onClick={() => switchView(label)}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <button onClick={() => setProfileOpen(true)} aria-label="打开个人中心">
            <span>●</span>我的
          </button>
        </nav>

        <ProfileCenter
          open={profileOpen}
          theme={theme}
          avatarMode={avatarMode}
          avatarPreview={avatarPreview}
          isLoggedIn={isLoggedIn}
          onClose={() => setProfileOpen(false)}
          onThemeChange={changeTheme}
          onAvatarModeChange={(mode) => {
            setAvatarPreview("");
            setAvatarMode(mode);
          }}
          onAvatarFile={updateAvatarFromFile}
          onLogin={() => setIsLoggedIn(true)}
          onLogout={() => setIsLoggedIn(false)}
          notify={notify}
        />
        <NewProjectDialog
          open={newProjectOpen}
          onClose={() => setNewProjectOpen(false)}
          onCreate={createProject}
        />
        {generationResult && (
          <SaveGenerationDialog
            result={generationResult}
            projects={projects.filter((project) => project.status !== "已归档")}
            onClose={() => setGenerationResult(null)}
            onSave={saveGeneration}
          />
        )}
      </section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function AvatarVisual({
  className,
  mode,
  previewUrl,
}: {
  className: string;
  mode: AvatarMode;
  previewUrl: string;
}) {
  return (
    <span
      className={`${className} avatar-visual ${mode} ${previewUrl ? "has-photo" : ""}`}
      style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}
      aria-hidden="true"
    >
      <i />
    </span>
  );
}

const projectTones = [
  { id: "orange", label: "暖橙" },
  { id: "blue", label: "雾蓝" },
  { id: "green", label: "鼠尾草" },
  { id: "rose", label: "柔粉" },
  { id: "sand", label: "沙金" },
  { id: "violet", label: "浅紫" },
];

function NewProjectDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (project: { name: string; tone: string; pattern: number }) => boolean;
}) {
  const [name, setName] = useState("");
  const [tone, setTone] = useState("green");
  const [pattern, setPattern] = useState(1);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="new-project-backdrop">
      <section className="new-project-dialog" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
        <header><div><span>NEW PROJECT</span><h2 id="new-project-title">创建新项目</h2></div><button onClick={onClose} aria-label="关闭创建项目">×</button></header>
        <label className="project-name-field"><span>项目名称</span><input autoFocus value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="例如：便携阅读灯" /></label>
        <fieldset className="pattern-picker"><legend>预设图案</legend><div>{[1, 2, 3, 4, 5, 6].map((item) => <button type="button" key={item} className={pattern === item ? `active ${tone}` : tone} onClick={() => setPattern(item)} aria-label={`选择预设图案 ${item}`}><span className={`concept-object concept-${item}`} /><i>{String(item).padStart(2, "0")}</i></button>)}</div></fieldset>
        <fieldset className="color-picker"><legend>项目颜色</legend><div>{projectTones.map((item) => <button type="button" key={item.id} className={tone === item.id ? `active ${item.id}` : item.id} onClick={() => setTone(item.id)}><span />{item.label}</button>)}</div></fieldset>
        <div className="new-project-actions"><button className="new-project-cancel" onClick={onClose}>取消</button><button className="new-project-submit" disabled={!name.trim()} onClick={() => { if (onCreate({ name: name.trim(), tone, pattern })) { setName(""); setTone("green"); setPattern(1); } }}>创建项目 <span>→</span></button></div>
      </section>
    </div>
  );
}

function CameraCaptureDialog({ onClose, onCapture }: { onClose: () => void; onCapture: (file: File) => void }) {
  return (
    <div className="capture-backdrop">
      <section className="camera-capture" role="dialog" aria-modal="true" aria-label="相机拍摄">
        <header><button onClick={onClose}>← 返回</button><b>拍摄参考图片</b><span /></header>
        <div className="camera-viewport"><span className="camera-focus" /><div><b>准备拍摄</b><small>移动端将调用后置相机</small></div></div>
        <footer><span>参考图只保留图片本身</span><label className="camera-shutter" aria-label="打开手机相机"><i /><input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) onCapture(file); event.target.value = ""; }} /></label><span>保持画面清晰</span></footer>
      </section>
    </div>
  );
}

function VoiceCaptureDialog({
  mode,
  onClose,
  onAudio,
  onText,
  notify,
}: {
  mode: VoiceMode;
  onClose: () => void;
  onAudio: (url: string) => void;
  onText: (text: string) => void;
  notify: (message: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  useEffect(() => () => {
    cancelledRef.current = true;
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const start = async () => {
    cancelledRef.current = false;
    if (mode === "text") {
      const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Recognition) {
        notify("当前浏览器暂不支持语音转文字，请使用最新版浏览器");
        return;
      }
      const recognition = new Recognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const text = Array.from(event.results).map((result) => result[0].transcript).join("");
        if (text && !cancelledRef.current) onText(text);
      };
      recognition.onerror = () => { setRecording(false); notify("没有识别到语音，请重试"); };
      recognition.onend = () => setRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size > 0 && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (!cancelledRef.current && chunksRef.current.length) onAudio(URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })));
        setRecording(false);
      };
      recorder.start();
      setRecording(true);
    } catch {
      notify("无法使用麦克风，请检查浏览器权限");
    }
  };

  const stop = () => {
    if (mode === "text") recognitionRef.current?.stop();
    else if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const close = () => {
    cancelledRef.current = true;
    stop();
    onClose();
  };

  return (
    <div className="capture-backdrop">
      <section className="voice-capture-dialog" role="dialog" aria-modal="true" aria-label={mode === "audio" ? "纯语音录制" : "语音转文字"}>
        <button className="capture-close" onClick={close}>×</button><span className={recording ? "voice-orb recording" : "voice-orb"}>🎙︎</span><h2>{mode === "audio" ? "纯语音" : "语音转文字"}</h2><p>{recording ? "正在聆听，请开始说话…" : mode === "audio" ? "录音会作为语音内容保留在创作输入框下方。" : "说话结束后，识别结果会写入内容输入框。"}</p><button className={recording ? "voice-record-button recording" : "voice-record-button"} onClick={recording ? stop : start}>{recording ? "结束" : "开始"}</button>
      </section>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
      {action}
    </header>
  );
}

function CreatorView({
  prompt,
  setPrompt,
  promptCount,
  generating,
  generate,
  notify,
  onShowProjects,
  onShowProject,
  references,
  onRemoveReference,
  onAddAlbumReference,
  onOpenInspiration,
  recentItems,
  onNewProject,
  result,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  promptCount: number;
  generating: boolean;
  generate: (features: string[]) => void;
  notify: (message: string) => void;
  onShowProjects: () => void;
  onShowProject: (name: string) => void;
  references: CreationReference[];
  onRemoveReference: (id: string) => void;
  onAddAlbumReference: (file: File) => void;
  onOpenInspiration: () => void;
  recentItems: Project[];
  onNewProject: () => void;
  result: GenerationResult | null;
}) {
  const [features, setFeatures] = useState(["圆形旋钮", "折叠结构"]);
  const [referenceMenuOpen, setReferenceMenuOpen] = useState(false);
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [audioReferenceUrl, setAudioReferenceUrl] = useState("");
  const referenceMenuRef = useRef<HTMLDivElement>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!referenceMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!referenceMenuRef.current?.contains(event.target as Node)) setReferenceMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [referenceMenuOpen]);

  useEffect(() => {
    if (!voiceMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!voiceMenuRef.current?.contains(event.target as Node)) setVoiceMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [voiceMenuOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const closePanel = (event: PointerEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("pointerdown", closePanel);
    return () => document.removeEventListener("pointerdown", closePanel);
  }, [notificationsOpen]);

  const addFeature = () => {
    const suggestions = ["柔和边角", "轻量材质", "单手收纳"];
    const next = suggestions.find((item) => !features.includes(item));
    if (next) {
      setFeatures((current) => [...current, next]);
      notify(`已增加特征「${next}」`);
    } else {
      notify("特征已补充完整");
    }
  };

  return (
    <>
    <div className="view-panel">
      <PageHeader
        eyebrow="下午好，知夏"
        title="把刚才的灵感，变成看得见的方案。"
        action={
          <div className="top-actions">
            {searchOpen ? (
              <label className="creator-search-box">
                <span>⌕</span>
                <input autoFocus aria-label="搜索项目与创作内容" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchTerm(""); }} aria-label="关闭搜索">×</button>
              </label>
            ) : (
              <button className="icon-btn search-btn" aria-label="搜索" onClick={() => { setSearchOpen(true); setNotificationsOpen(false); }}>⌕</button>
            )}
            <div className="notification-wrap" ref={notificationsRef}>
              <button className="icon-btn notification" aria-label="消息通知" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setSearchOpen(false); }}>♧</button>
              {notificationsOpen && (
                <section className="notification-panel" aria-label="消息通知">
                  <header><div><b>消息通知</b><small>NOTIFICATIONS</small></div><span>0</span></header>
                  <div className="notification-scroll"><div className="notification-empty"><span>♧</span><b>暂无消息</b><small>新的项目动态和系统提醒会显示在这里</small></div></div>
                </section>
              )}
            </div>
            <button className="primary-btn compact" onClick={onNewProject}><span>＋</span> 新项目</button>
          </div>
        }
      />
      <div className="content-grid">
        <section className="creator-column">
          <article className="prompt-card">
            <div className="card-heading"><div><h2>你想设计什么？</h2></div></div>
            <div className="prompt-box">
              <textarea
                aria-label="设计想法"
                placeholder="请输入你的想法"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={240}
              />
              <div className="prompt-footer">
                <div className="input-tools" ref={voiceMenuRef}>
                  <button className="voice-input" aria-label="语音输入" aria-expanded={voiceMenuOpen} onClick={() => setVoiceMenuOpen((open) => !open)}>🎙︎</button>
                  {voiceMenuOpen && (
                    <div className="voice-source-menu">
                      <button onClick={() => { setVoiceMenuOpen(false); setVoiceMode("audio"); }}><span>●</span><b>纯语音</b><small>保留录音作为创作内容</small></button>
                      <button onClick={() => { setVoiceMenuOpen(false); setVoiceMode("text"); }}><span>文</span><b>语音转文字</b><small>识别后写入内容输入框</small></button>
                    </div>
                  )}
                </div>
                <span>{promptCount}/240</span>
              </div>
              {audioReferenceUrl && (
                <div className="voice-attachment">
                  <span>🎙︎</span><audio controls src={audioReferenceUrl} /><button onClick={() => { URL.revokeObjectURL(audioReferenceUrl); setAudioReferenceUrl(""); }} aria-label="删除语音内容">×</button>
                </div>
              )}
            </div>
            <div className="reference-row">
              <div className="reference-tray">
                {references.map((reference) => (
                  <div
                    className={`reference-tile ${reference.source === "灵感" ? `inspiration-reference ${reference.tone}` : ""} ${reference.previewUrl ? "album-reference" : ""}`}
                    key={reference.id}
                    style={reference.previewUrl ? { backgroundImage: `url("${reference.previewUrl}")` } : undefined}
                    role="img"
                    aria-label={`参考图片：${reference.title}`}
                  >
                    {!reference.previewUrl && reference.source === "默认" && <span className="reference-shape lamp" />}
                    {!reference.previewUrl && reference.source === "灵感" && <span className="reference-inspiration-shape" />}
                    <button className="reference-remove" onClick={() => onRemoveReference(reference.id)} aria-label={`删除参考 ${reference.title}`}>×</button>
                  </div>
                ))}
                <div className="add-reference-wrap" ref={referenceMenuRef}>
                  <button className="add-reference" onClick={() => setReferenceMenuOpen((open) => !open)} aria-expanded={referenceMenuOpen}>
                    <span>＋</span>添加参考
                  </button>
                  {referenceMenuOpen && (
                    <div className="reference-source-menu">
                      <label>
                        <span>▧</span><b>从相册中选择</b>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) onAddAlbumReference(file);
                            setReferenceMenuOpen(false);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button onClick={() => { setReferenceMenuOpen(false); setCameraOpen(true); }}>
                        <span>◉</span><b>使用相机拍摄</b>
                      </button>
                      <button onClick={() => { setReferenceMenuOpen(false); onOpenInspiration(); }}>
                        <span>✦</span><b>从灵感中选择</b>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="feature-locks">
                <small>特征</small>
                <div>
                  {features.map((feature) => (
                    <button key={feature} onClick={() => setFeatures((current) => current.filter((item) => item !== feature))}>
                      {feature} <span>×</span>
                    </button>
                  ))}
                  <button className="add-feature" onClick={addFeature}><span>＋</span> 增加</button>
                </div>
              </div>
            </div>
            <div className="prompt-actions">
              <button className="ghost-btn" onClick={() => notify("AI 已帮你补全使用场景")}><span>✦</span> 帮我补充想法</button>
              <button className="primary-btn" disabled={generating || !prompt.trim()} onClick={() => generate(features)}>
                {generating ? "正在生成…" : "生成概念草图"}<span>{generating ? "◌" : "→"}</span>
              </button>
            </div>
          </article>
          <section className="recent-section">
            <div className="section-heading">
              <div><h2>最近项目</h2></div>
              <button onClick={onShowProjects}>查看全部 →</button>
            </div>
            <div className="project-grid">
              {recentItems.map((project, index) => (
                <button className="project-card" key={project.name} onClick={() => onShowProject(project.name)}>
                  <span className={`project-visual ${project.tone}`}><span className={`concept-object concept-${project.pattern}`} /><small>{String(index + 1).padStart(2, "0")}</small></span>
                  <span className="project-info"><b>{project.name}</b><small>{project.versions} 个版本 · {project.meta.replace("更新于", "")}</small></span>
                  <span className="project-arrow">↗</span>
                </button>
              ))}
            </div>
          </section>
        </section>
        <aside className="insight-column">
          <article className="ai-card">
            <div className="ai-title"><span className="ai-glyph">✦</span><div><small>KIMI K3 · AI 需求理解</small><h2>{result ? result.concept.title : "等待理解您的想法"}</h2></div><span className="confidence">{result ? "已完成" : "—"}</span></div>
            <div className="intent-block"><small>设计方向</small><textarea aria-label="AI 设计方向" readOnly value={result ? [result.understanding, ...result.directions].join("\n\n") : "AI会自动理解您的想法"} /></div>
            <div className="tag-block"><small>提取标签</small>{result ? <div className="tags">{result.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : <div className="tags empty-tags" aria-label="暂无提取标签"><span /><span /></div>}</div>
            {result && <ConceptVisual sketch={{ ...result.concept, id: "preview", createdAt: "刚刚生成" }} compact />}
          </article>
        </aside>
      </div>
    </div>
    {cameraOpen && (
      <CameraCaptureDialog
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => { onAddAlbumReference(file); setCameraOpen(false); }}
      />
    )}
    {voiceMode && (
      <VoiceCaptureDialog
        mode={voiceMode}
        onClose={() => setVoiceMode(null)}
        onAudio={(url) => {
          if (audioReferenceUrl) URL.revokeObjectURL(audioReferenceUrl);
          setAudioReferenceUrl(url);
          setVoiceMode(null);
          notify("语音内容已添加");
        }}
        onText={(text) => {
          setPrompt(`${prompt}${prompt ? "\n" : ""}${text}`.slice(0, 240));
          setVoiceMode(null);
          notify("语音已转换为文字");
        }}
        notify={notify}
      />
    )}
    </>
  );
}

function ConceptVisual({ sketch, compact = false }: { sketch: ConceptSketch; compact?: boolean }) {
  return (
    <div className={`generated-concept ${sketch.palette} form-${sketch.form} ${compact ? "compact" : ""}`}>
      <span className="sketch-grid" />
      <span className="sketch-shadow" />
      <span className="sketch-body"><i /><b /></span>
      <span className="sketch-line line-a" /><span className="sketch-line line-b" />
      {!compact && <div><small>CONCEPT SKETCH</small><strong>{sketch.title}</strong><p>{sketch.caption}</p></div>}
    </div>
  );
}

function SaveGenerationDialog({ result, projects, onClose, onSave }: { result: GenerationResult; projects: Project[]; onClose: () => void; onSave: (name: string) => void }) {
  const [target, setTarget] = useState(projects[0]?.name ?? "");
  return (
    <div className="project-confirm-backdrop generation-save-backdrop">
      <section className="generation-save-dialog" role="dialog" aria-modal="true" aria-label="保存生成结果">
        <button className="capture-close" onClick={onClose}>×</button>
        <div className="generation-save-preview"><ConceptVisual sketch={{ ...result.concept, id: "save-preview", createdAt: "刚刚生成" }} /></div>
        <div className="generation-save-copy">
          <span className="drawer-eyebrow">SAVE CREATION</span><h2>将结果保存到项目</h2>
          <p>{result.understanding}</p>
          <label><span>目标项目</span><select value={target} onChange={(event) => setTarget(event.target.value)}>{projects.map((project) => <option key={project.name}>{project.name}</option>)}</select></label>
          <div className="tags">{result.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <button className="primary-btn" disabled={!target} onClick={() => onSave(target)}>保存到项目 <span>→</span></button>
        </div>
      </section>
    </div>
  );
}

function ProjectEditor({ project, onBack, onUpdate, notify }: { project: Project; onBack: () => void; onUpdate: (project: Project) => void; notify: (message: string) => void }) {
  const addBlock = () => onUpdate({ ...project, textBlocks: [...project.textBlocks, { id: `text-${Date.now()}`, text: "输入说明文字", fontSize: 24, width: 320, height: 120 }] });
  const updateBlock = (id: string, patch: Partial<EditableTextBlock>) => onUpdate({ ...project, textBlocks: project.textBlocks.map((block) => block.id === id ? { ...block, ...patch } : block) });
  const removeBlock = (id: string) => onUpdate({ ...project, textBlocks: project.textBlocks.filter((block) => block.id !== id) });
  const removeSketch = (id: string) => {
    onUpdate({ ...project, sketches: project.sketches.filter((sketch) => sketch.id !== id) });
    notify("概念草图已从项目中删除");
  };
  return (
    <div className="view-panel project-editor-view">
      <header className="editor-topbar"><button onClick={onBack}>← 返回项目</button><div><span className="eyebrow">PROJECT EDITOR</span><h1>{project.name}</h1></div><button className="primary-btn compact" onClick={() => notify("项目编辑内容已保存")}>保存修改</button></header>
      <div className="editor-layout">
        <section className="editor-main">
          <div className="editor-section-heading"><div><small>01</small><h2>概念草图</h2></div><span>{project.sketches.length} 个方案</span></div>
          <div className="editor-sketch-grid">
            {project.sketches.map((sketch) => <article key={sketch.id}><ConceptVisual sketch={sketch} /><button onClick={() => removeSketch(sketch.id)} aria-label={`删除 ${sketch.title}`}>×</button></article>)}
            {project.sketches.length === 0 && <div className="editor-empty"><span>✦</span><b>还没有概念草图</b><p>前往创作页面输入需求并选择此项目保存。</p></div>}
          </div>
          <div className="editor-section-heading"><div><small>02</small><h2>自由文字画布</h2></div><button onClick={addBlock}>＋ 添加文字框</button></div>
          <div className="text-canvas">
            {project.textBlocks.map((block) => (
              <article className="resizable-text-block" key={block.id} style={{ width: block.width, minHeight: block.height }}>
                <button className="text-block-delete" onClick={() => removeBlock(block.id)} aria-label="删除文字框">×</button>
                <textarea value={block.text} style={{ fontSize: block.fontSize }} onChange={(event) => updateBlock(block.id, { text: event.target.value })} />
                <div className="text-block-controls">
                  <label>字号<input type="range" min="12" max="72" value={block.fontSize} onChange={(event) => updateBlock(block.id, { fontSize: Number(event.target.value) })} /></label>
                  <label>宽度<input type="range" min="220" max="620" value={block.width} onChange={(event) => updateBlock(block.id, { width: Number(event.target.value) })} /></label>
                  <label>高度<input type="range" min="90" max="360" value={block.height} onChange={(event) => updateBlock(block.id, { height: Number(event.target.value) })} /></label>
                </div>
              </article>
            ))}
            {project.textBlocks.length === 0 && <button className="add-first-text" onClick={addBlock}><span>＋</span><b>添加第一个可变文字框</b><small>文字大小、框体宽高均可独立调整</small></button>}
          </div>
        </section>
        <aside className="editor-insight">
          <span className="ai-glyph">✦</span><small>AI 需求理解</small><h2>{project.aiUnderstanding}</h2>
          <div className="tags">{project.aiTags.length ? project.aiTags.map((tag) => <span key={tag}>{tag}</span>) : <span>暂无标签</span>}</div>
          <p>Kimi K3 综合创作描述、特征与参考图片后生成。你可以返回创作页继续迭代并保存新版本。</p>
        </aside>
      </div>
    </div>
  );
}

function ProjectsView({
  projects,
  filter,
  setFilter,
  favorites,
  toggleFavorite,
  highlightedProject,
  onArchive,
  onRestore,
  onDelete,
  onNewProject,
  notify,
  onEdit,
}: {
  projects: typeof allProjects;
  filter: string;
  setFilter: (value: string) => void;
  favorites: string[];
  toggleFavorite: (name: string) => void;
  highlightedProject: string;
  onArchive: (name: string) => void;
  onRestore: (name: string) => void;
  onDelete: (name: string) => void;
  onNewProject: () => void;
  notify: (message: string) => void;
  onEdit: (name: string) => void;
}) {
  const [pendingAction, setPendingAction] = useState<{
    type: "archive" | "delete";
    project: (typeof allProjects)[number];
  } | null>(null);

  return (
    <div className="view-panel">
      <PageHeader
        eyebrow={`项目空间 · ${projects.length} 个项目`}
        title="所有探索，都在这里继续生长。"
        action={<button className="primary-btn compact" onClick={onNewProject}><span>＋</span> 新项目</button>}
      />
      <div className="page-toolbar">
        <div className="filter-tabs" aria-label="筛选项目">
          {["全部", "进行中", "已完成", "已归档"].map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <button className="sort-button" onClick={() => notify("已按最近更新排序")}>最近更新 ↓</button>
      </div>
      <section className="all-project-grid" aria-label="历史项目">
        {projects.map((project, index) => (
          <article className={highlightedProject === project.name ? "project-panel highlighted" : "project-panel"} key={project.name}>
            <button className={`project-preview ${project.tone}`} onClick={() => notify(`正在预览「${project.name}」`)}>
              <span className="preview-index">0{index + 1}</span>
              <span className={`concept-object concept-${project.pattern}`} />
              <span className="preview-label">点击预览</span>
            </button>
            <div className="project-panel-copy">
              <div><span className={`status-dot ${project.status}`} />{project.status}</div>
              <h2>{project.name}</h2>
              <p>{project.versions} 个版本 · {project.meta}</p>
            </div>
            <div className={project.status === "已归档" ? "project-actions archived-actions" : "project-actions"}>
              <button aria-label={`预览 ${project.name}`} onClick={() => notify(`正在预览「${project.name}」`)}><span>◉</span>预览</button>
              {project.status === "已归档" ? (
                <>
                  <button aria-label={`彻底删除 ${project.name}`} onClick={() => setPendingAction({ type: "delete", project })}><span>×</span>彻底删除</button>
                  <button aria-label={`撤销归档 ${project.name}`} onClick={() => onRestore(project.name)}><span>↶</span>撤销归档</button>
                </>
              ) : (
                <>
                  <button aria-label={`编辑 ${project.name}`} onClick={() => onEdit(project.name)}><span>✎</span>编辑</button>
                  <button aria-label={`归档 ${project.name}`} onClick={() => setPendingAction({ type: "archive", project })}><span>□</span>归档</button>
                  <button
                    className={favorites.includes(project.name) ? "favorite active" : "favorite"}
                    aria-label={`${favorites.includes(project.name) ? "取消收藏" : "收藏"} ${project.name}`}
                    onClick={() => toggleFavorite(project.name)}
                  >
                    <span>{favorites.includes(project.name) ? "★" : "☆"}</span>收藏
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>
      {projects.length === 0 && <div className="empty-state">这里还没有符合条件的项目。</div>}
      {pendingAction && (
        <div className="project-confirm-backdrop" role="presentation">
          <section className="project-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="project-confirm-title">
            <span className={pendingAction.type === "delete" ? "confirm-icon danger" : "confirm-icon"}>
              {pendingAction.type === "delete" ? "×" : "□"}
            </span>
            <h2 id="project-confirm-title">
              {pendingAction.type === "delete" ? "彻底删除项目？" : "确认归档项目？"}
            </h2>
            <p>
              {pendingAction.type === "delete"
                ? `「${pendingAction.project.name}」将被永久删除，并同步从最近项目与收藏中移除，此操作无法撤销。`
                : pendingAction.project.status === "已完成"
                  ? `归档「${pendingAction.project.name}」后，它将同步从导出页的可选项目中移除，但项目数据仍可恢复。`
                  : `归档「${pendingAction.project.name}」后，它将从当前项目列表中移至“已归档”，之后可以撤销归档。`}
            </p>
            <div>
              <button className="confirm-cancel" onClick={() => setPendingAction(null)}>取消</button>
              <button
                className={pendingAction.type === "delete" ? "confirm-submit danger" : "confirm-submit"}
                onClick={() => {
                  if (pendingAction.type === "delete") onDelete(pendingAction.project.name);
                  else onArchive(pendingAction.project.name);
                  setPendingAction(null);
                }}
              >
                {pendingAction.type === "delete" ? "确认删除" : "确认归档"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function InspirationView({
  filter,
  setFilter,
  savedPosts,
  likedPosts,
  toggleSavedPost,
  toggleLikedPost,
  onAddToCreator,
  onAddToStyleReference,
  notify,
  projects,
  publishedProjectNames,
  onUploadProject,
}: {
  filter: string;
  setFilter: (value: string) => void;
  savedPosts: string[];
  likedPosts: string[];
  toggleSavedPost: (title: string) => void;
  toggleLikedPost: (title: string) => void;
  onAddToCreator: (post: (typeof inspirationPosts)[number]) => void;
  onAddToStyleReference: (post: (typeof inspirationPosts)[number]) => void;
  notify: (message: string) => void;
  projects: Project[];
  publishedProjectNames: string[];
  onUploadProject: (name: string) => void;
}) {
  const [addMenu, setAddMenu] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState(projects[0]?.name ?? "");
  const activeMenuRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const visiblePosts = filter === "为你推荐"
    ? inspirationPosts
    : inspirationPosts.filter((post) => post.categories.includes(filter));

  useEffect(() => {
    if (!addMenu) return;
    const closeMenu = (event: PointerEvent) => {
      if (!activeMenuRef.current?.contains(event.target as Node)) setAddMenu("");
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [addMenu]);

  return (
    <div className="view-panel inspiration-view">
      <PageHeader
        eyebrow="灵感库 · 每日更新"
        title="在别人的好想法里，找到自己的下一步。"
        action={
          <div className="inspiration-header-actions"><label className="inspiration-search"><span>⌕</span><input aria-label="搜索灵感" placeholder="搜索材质、形态、场景…" onKeyDown={(event) => event.key === "Enter" && notify("已为你整理相关灵感")} /></label><button className="primary-btn compact" onClick={() => setUploadOpen(true)}>↑ 上传项目</button></div>
        }
      />
      <div className="inspiration-tabs" aria-label="灵感分类">
        {["为你推荐", "产品", "空间", "材质", "配色", "交互"].map((item) => (
          <button
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => {
              setAddMenu("");
              setFilter(item);
              feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >{item}</button>
        ))}
      </div>
      <div className="masonry-scroll" ref={feedRef}>
        <section className="masonry-feed" aria-label={`${filter}灵感流`}>
          {publishedProjectNames.map((name) => {
            const project = projects.find((item) => item.name === name);
            if (!project || (filter !== "为你推荐" && filter !== "产品")) return null;
            const sketch = project.sketches[0];
            return <article className="inspiration-card uploaded-inspiration" key={`uploaded-${name}`}>
              {sketch ? <ConceptVisual sketch={sketch} compact /> : <div className={`inspiration-art ${project.tone} medium`}><span className={`concept-object concept-${project.pattern}`} /></div>}
              <div className="inspiration-copy"><div><span className="uploaded-chip">用户项目</span><h2>{project.name}</h2><p>用户名称 · {project.sketches.length} 张概念草图</p></div></div>
            </article>;
          })}
          {visiblePosts.map((post, index) => (
            <article
              className={`inspiration-card variant-${index % 4}`}
              key={post.title}
              ref={addMenu === post.title ? activeMenuRef : undefined}
            >
              <button className={`inspiration-art ${post.tone} ${post.height}`} onClick={() => notify(`正在查看「${post.title}」`)}>
                <span className={`art-object art-${(index % 8) + 1}`} />
                <span className="art-tag">{post.tag}</span>
                <span className="view-hint">查看灵感 ↗</span>
              </button>
              <div className="inspiration-copy">
                <div><h2>{post.title}</h2><p>{post.author}</p></div>
                <div className="post-actions">
                  <button
                    className={likedPosts.includes(post.title) ? "like-post active" : "like-post"}
                    aria-label={`${likedPosts.includes(post.title) ? "取消点赞" : "点赞"} ${post.title}`}
                    onClick={() => toggleLikedPost(post.title)}
                  >
                    {likedPosts.includes(post.title) ? "♥" : "♡"}
                  </button>
                  <button
                    className={savedPosts.includes(post.title) ? "save-post active" : "save-post"}
                    aria-label={`${savedPosts.includes(post.title) ? "取消收藏" : "收藏"} ${post.title}`}
                    onClick={() => toggleSavedPost(post.title)}
                  >
                    {savedPosts.includes(post.title) ? "★" : "☆"}
                  </button>
                  <button
                    className={addMenu === post.title ? "add-post active" : "add-post"}
                    aria-label={`添加 ${post.title}`}
                    aria-expanded={addMenu === post.title}
                    onClick={() => setAddMenu((current) => current === post.title ? "" : post.title)}
                  >
                    ＋
                  </button>
                </div>
              </div>
              {addMenu === post.title && (
                <div className="inspiration-add-panel">
                  <small>添加到</small>
                  <button onClick={() => { setAddMenu(""); onAddToCreator(post); }}>
                    <span>✦</span><b>创作内容参考</b><i>添加到创作页参考区域</i>
                  </button>
                  <button onClick={() => { setAddMenu(""); onAddToStyleReference(post); }}>
                    <span>▤</span><b>导出风格参考</b><i>用于 PPT / PDF 视觉编排</i>
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
        <div className="feed-end"><span>✦</span>{filter} · 共 {visiblePosts.length} 条灵感</div>
      </div>
      {uploadOpen && <div className="project-confirm-backdrop"><section className="upload-project-dialog" role="dialog" aria-modal="true"><button className="capture-close" onClick={() => setUploadOpen(false)}>×</button><span className="drawer-eyebrow">SHARE INSPIRATION</span><h2>上传项目到灵感</h2><p>将发布项目名称，并使用项目内最新的概念草图作为卡片封面。</p><label><span>选择项目</span><select value={uploadTarget} onChange={(event) => setUploadTarget(event.target.value)}>{projects.map((project) => <option key={project.name}>{project.name}</option>)}</select></label><button className="primary-btn" disabled={!uploadTarget} onClick={() => { onUploadProject(uploadTarget); setUploadOpen(false); }}>确认上传 <span>→</span></button></section></div>}
    </div>
  );
}

const profileItems = [
  { icon: "✦", title: "AI 使用额度", detail: "本月剩余 76% · 760 次" },
  { icon: "◎", title: "知识助手偏好", detail: "语言、回答风格与专业领域" },
  { icon: "⌘", title: "账号设置", detail: "个人资料、安全与登录方式" },
  { icon: "◇", title: "数据与隐私设置", detail: "数据授权、存储与使用范围" },
];

function ProfileCenter({
  open,
  theme,
  avatarMode,
  avatarPreview,
  isLoggedIn,
  onClose,
  onThemeChange,
  onAvatarModeChange,
  onAvatarFile,
  onLogin,
  onLogout,
  notify,
}: {
  open: boolean;
  theme: ThemeMode;
  avatarMode: AvatarMode;
  avatarPreview: string;
  isLoggedIn: boolean;
  onClose: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onAvatarModeChange: (mode: AvatarMode) => void;
  onAvatarFile: (file: File) => void;
  onLogin: () => void;
  onLogout: () => void;
  notify: (message: string) => void;
}) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [loginPageOpen, setLoginPageOpen] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!avatarMenuRef.current?.contains(event.target as Node)) setAvatarMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [avatarMenuOpen]);

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (account === "123456" && password === "123456") {
      onLogin();
      setLoginPageOpen(false);
      setAccount("");
      setPassword("");
      setLoginError("");
      notify("登录成功，欢迎回来");
    } else {
      setLoginError("账号或密码错误，请重新输入");
    }
  };

  return (
    <>
      <button
        className={`profile-backdrop ${open ? "open" : ""}`}
        aria-label="关闭个人中心"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`profile-drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="个人中心"
      >
        <header className="profile-drawer-header">
          <div>
            <span className="drawer-eyebrow">{loginPageOpen && !isLoggedIn ? "SIGN IN" : "PERSONAL CENTER"}</span>
            <h2>{loginPageOpen && !isLoggedIn ? "登录" : "个人中心"}</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="关闭个人中心">×</button>
        </header>

        {!isLoggedIn ? (
          loginPageOpen ? (
            <form className="login-page" onSubmit={submitLogin}>
              <button type="button" className="login-back" onClick={() => { setLoginPageOpen(false); setLoginError(""); }}>← 返回</button>
              <span className="login-mark"><i /></span>
              <div className="login-copy"><h3>登录 SketchFlow</h3><p>登录后即可管理个人偏好、额度与隐私设置。</p></div>
              <label><span>账号</span><input value={account} onChange={(event) => { setAccount(event.target.value); setLoginError(""); }} autoComplete="username" placeholder="请输入账号" /></label>
              <label><span>密码</span><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setLoginError(""); }} autoComplete="current-password" placeholder="请输入密码" /></label>
              {loginError && <p className="login-error" role="alert">{loginError}</p>}
              <button className="login-submit" type="submit">确认登录 <span>→</span></button>
              <small className="login-hint">演示账号与密码均为 123456</small>
            </form>
          ) : (
            <section className="signed-out-state">
              <span className="signed-out-avatar"><i /></span>
              <h3>尚未登录</h3>
              <p>登录后可查看 AI 使用额度、管理知识助手偏好与账户设置。</p>
              <button onClick={() => setLoginPageOpen(true)}>登录 <span>→</span></button>
              <small>登录前不会展示任何个人账户信息</small>
            </section>
          )
        ) : (
          <>
            <section className="profile-identity">
              <div className="profile-avatar-control" ref={avatarMenuRef}>
                <AvatarVisual className="profile-avatar-large" mode={avatarMode} previewUrl={avatarPreview} />
                <button className="add-avatar-button" onClick={() => setAvatarMenuOpen((open) => !open)} aria-expanded={avatarMenuOpen}>＋ 添加头像</button>
                {avatarMenuOpen && (
                  <div className="avatar-source-menu">
                    <label><span>▧</span>从相册中选取<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) onAvatarFile(file); setAvatarMenuOpen(false); event.target.value = ""; }} /></label>
                    <button onClick={() => { onAvatarModeChange("camera"); setAvatarMenuOpen(false); notify("已启用拍照头像预览"); }}><span>◉</span>拍照</button>
                    <button onClick={() => { onAvatarModeChange("inspiration"); setAvatarMenuOpen(false); notify("已从灵感中选择头像"); }}><span>✦</span>从灵感中添加</button>
                  </div>
                )}
              </div>
              <div><b>用户名称</b><small>SketchFlow 创作者</small></div>
              <span className="member-chip">创作会员</span>
            </section>

            <section className="theme-card">
              <div className="theme-card-copy"><span className="theme-icon">{theme === "light" ? "☼" : "◐"}</span><div><b>界面风格</b><small>选择更舒适的创作环境</small></div></div>
              <div className="theme-switch" role="group" aria-label="界面风格">
                <button className={theme === "light" ? "active" : ""} aria-pressed={theme === "light"} onClick={() => onThemeChange("light")}><span>☼</span> 浅色</button>
                <button className={theme === "dark" ? "active" : ""} aria-pressed={theme === "dark"} onClick={() => onThemeChange("dark")}><span>◐</span> 深色</button>
              </div>
            </section>

            <nav className="profile-menu" aria-label="个人中心功能">
              {profileItems.map((item) => (
                <button key={item.title} onClick={() => notify(`${item.title}功能已打开`)}><span className="profile-menu-icon">{item.icon}</span><span><b>{item.title}</b><small>{item.detail}</small></span><i>›</i></button>
              ))}
            </nav>

            <footer className="profile-drawer-footer">
              <span><i /> 服务状态正常</span>
              <button onClick={() => { onLogout(); notify("已退出当前账号"); }}>退出登录</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function ExportView({
  completedProjects,
  styleReferences,
  onRemoveStyleReference,
  onOpenInspiration,
  notify,
}: {
  completedProjects: typeof allProjects;
  styleReferences: (typeof inspirationPosts)[number][];
  onRemoveStyleReference: (title: string) => void;
  onOpenInspiration: () => void;
  notify: (message: string) => void;
}) {
  const [project, setProject] = useState(completedProjects[0]?.name ?? "");
  const [format, setFormat] = useState<"PDF" | "PPT">("PPT");
  const [copy, setCopy] = useState("请输入设计文案");
  const [generating, setGenerating] = useState(false);
  const [ready, setReady] = useState(false);
  const [deck, setDeck] = useState<DeckResult | null>(null);
  const [history, setHistory] = useState([
    { id: 1, project: "便携咖啡研磨器", format: "PPT", time: "今天 10:24" },
    { id: 2, project: "折叠户外水壶", format: "PDF", time: "7 月 18 日" },
    { id: 3, project: "便携咖啡研磨器", format: "PDF", time: "7 月 15 日" },
    { id: 4, project: "折叠户外水壶", format: "PPT", time: "7 月 11 日" },
    { id: 5, project: "便携咖啡研磨器", format: "PPT", time: "7 月 5 日" },
  ]);

  const selectedProject = completedProjects.find((item) => item.name === project);

  const createDocument = async () => {
    if (!selectedProject) return;
    setGenerating(true);
    setReady(false);
    try {
      const response = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "export",
          project: {
            name: selectedProject.name,
            aiUnderstanding: selectedProject.aiUnderstanding,
            aiTags: selectedProject.aiTags,
            conceptSketches: selectedProject.sketches.map(({ title, caption, form, palette }) => ({ title, caption, form, palette })),
          },
          copy,
          styleReferences: styleReferences.map((item) => `${item.title}（${item.tag}）`),
        }),
      });
      const payload = await response.json() as DeckResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "方案生成失败");
      setDeck(payload);
      setGenerating(false);
      setReady(true);
      setHistory((current) => [
        { id: Date.now(), project, format, time: "刚刚" },
        ...current.filter((item) => !(item.project === project && item.format === format)),
      ]);
      notify(`${format} 方案介绍已生成`);
    } catch (error) {
      setGenerating(false);
      notify(error instanceof Error ? error.message : "方案生成失败，请稍后重试");
    }
  };

  const downloadDocument = async () => {
    if (!deck) return;
    if (format === "PDF") {
      const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
      const printWindow = window.open("", "_blank");
      if (!printWindow) return notify("浏览器阻止了 PDF 打印窗口");
      printWindow.opener = null;
      printWindow.document.write(`<title>${escapeHtml(deck.title)}</title><style>body{font-family:Arial,sans-serif;padding:56px;color:#17231b}section{page-break-after:always;min-height:80vh}h1{font-size:42px}h2{font-size:30px}p,li{font-size:18px;line-height:1.7}</style><section><h1>${escapeHtml(deck.title)}</h1><p>${escapeHtml(deck.subtitle)}</p></section>${deck.slides.map((slide) => `<section><h2>${escapeHtml(slide.title)}</h2><p>${escapeHtml(slide.body)}</p><ul>${slide.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`).join("")}`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }
    const { default: PptxGenJS } = await import("pptxgenjs");
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "SketchFlow";
    pptx.subject = selectedProject?.aiUnderstanding || "AI 设计方案介绍";
    pptx.title = deck.title;
    pptx.company = "SketchFlow";
    const cover = pptx.addSlide();
    cover.background = { color: "17231B" };
    cover.addText("SKETCHFLOW / AI DESIGN", { x: 0.7, y: 0.55, w: 5, h: 0.3, fontFace: "Aptos", fontSize: 11, color: "A8B7AC", charSpacing: 1.8 });
    cover.addText(deck.title, { x: 0.7, y: 2.1, w: 9.8, h: 1.3, fontFace: "Microsoft YaHei", fontSize: 34, bold: true, color: "F7F4EC", margin: 0 });
    cover.addText(deck.subtitle, { x: 0.72, y: 3.55, w: 8.7, h: 0.8, fontFace: "Microsoft YaHei", fontSize: 16, color: "C9D3CB", margin: 0, breakLine: false });
    cover.addShape(pptx.ShapeType.arc, { x: 10.4, y: 1.35, w: 2.1, h: 2.1, rotate: 24, line: { color: "B8D84A", width: 4 }, fill: { color: "17231B", transparency: 100 } });
    deck.slides.forEach((item, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: index % 2 ? "F4F1E8" : "FFFFFF" };
      slide.addText(String(index + 1).padStart(2, "0"), { x: 0.65, y: 0.45, w: 0.7, h: 0.4, fontSize: 12, color: "7B897E", bold: true });
      slide.addText(item.title, { x: 0.7, y: 1.05, w: 5.3, h: 0.8, fontFace: "Microsoft YaHei", fontSize: 27, bold: true, color: "17231B", margin: 0 });
      slide.addText(item.body, { x: 0.72, y: 2.0, w: 5.1, h: 1.5, fontFace: "Microsoft YaHei", fontSize: 14, color: "536057", breakLine: false, valign: "top", margin: 0 });
      slide.addText(item.bullets.map((text) => ({ text, options: { bullet: { indent: 16 }, breakLine: true } })), { x: 6.5, y: 1.25, w: 5.6, h: 4.3, fontFace: "Microsoft YaHei", fontSize: 17, color: "26342B", breakLine: false, paraSpaceAfter: 18, margin: 0.08 });
      slide.addShape(pptx.ShapeType.line, { x: 0.72, y: 6.75, w: 11.85, h: 0, line: { color: "CDD5CF", width: 1 } });
      slide.addText(selectedProject?.name || project, { x: 0.72, y: 6.88, w: 4.5, h: 0.25, fontSize: 9, color: "7B897E" });
    });
    await pptx.writeFile({ fileName: `${project}-SketchFlow.pptx`, compression: true });
    notify("PPT 文件已下载");
  };

  return (
    <div className="view-panel export-view">
      <PageHeader
        eyebrow="AI 智能导出"
        title="把设计过程，整理成一份会讲故事的方案。"
      />
      <div className="export-layout">
        <section className="export-settings">
          <div className="export-step"><span>01</span><div><b>选择项目</b><small>选择需要整理与介绍的设计方案</small></div></div>
          <div className="project-selector">
            {completedProjects.map((item) => (
              <button key={item.name} className={project === item.name ? "active" : ""} onClick={() => { setProject(item.name); setReady(false); setDeck(null); }}>
                <span className={`mini-project ${item.tone}`}>
                  <span className={`concept-object concept-${item.pattern}`} />
                </span>
                <span><b>{item.name}</b><small>{item.versions} 个版本</small></span><i>{project === item.name ? "✓" : ""}</i>
              </button>
            ))}
            {completedProjects.length === 0 && <p className="no-export-projects">暂无已完成项目，请先完成一个项目后再导出。</p>}
          </div>

          <div className="export-step"><span>02</span><div><b>设计文案</b><small>AI 将依据这段内容生成叙事结构</small></div></div>
          <div className="export-copy-box">
            <textarea value={copy} onChange={(event) => { setCopy(event.target.value); setReady(false); }} aria-label="设计文案" />
            <button onClick={() => { setCopy("面向年轻租房人群，聚焦轻量、折叠与小空间收纳，通过多轮草图验证结构与交互细节。"); notify("AI 已优化设计文案"); }}>✦ AI 优化文案</button>
          </div>

          <div className="history-heading"><div><b>历史记录</b><small>查看并再次下载已生成的方案文件</small></div></div>
          <div className="export-history">
            {history.map((item) => (
              <div className="history-row" key={item.id}>
                <span className="history-format">{item.format}</span>
                <span><b>{item.project}</b><small>{item.time} · 已生成</small></span>
                <button onClick={() => notify(`${item.project} 的 ${item.format} 文件已进入下载队列`)} aria-label={`下载 ${item.project} ${item.format}`}>↓</button>
              </div>
            ))}
          </div>
        </section>

        <aside className="export-preview">
          <div className="export-step"><span>03</span><div><b>选择格式并生成</b><small>内容和版式可在生成后继续调整</small></div></div>
          <div className="format-switch">
            {(["PPT", "PDF"] as const).map((item) => (
              <button key={item} className={format === item ? "active" : ""} onClick={() => { setFormat(item); setReady(Boolean(deck)); }}>
                <span>{item === "PPT" ? "▤" : "▧"}</span><b>{item}</b><small>{item === "PPT" ? "演示与提案" : "归档与分享"}</small>
              </button>
            ))}
          </div>
          <div className={ready ? "document-preview ready" : "document-preview"}>
            <div className="document-cover"><span>SKETCHFLOW / {format}</span><strong>{project}</strong><small>AI 设计方案介绍</small></div>
            <div className="document-pages"><span /><span /><span /></div>
            {ready && <div className="ready-mark">✓ 已完成</div>}
          </div>
          <button
            className="primary-btn export-generate"
            disabled={generating || !copy.trim() || !project}
            onClick={ready ? downloadDocument : createDocument}
          >
            {generating ? "AI 正在编排内容…" : ready ? `下载 ${format} 文件` : `生成 ${format} 方案`}<span>{generating ? "◌" : ready ? "↓" : "→"}</span>
          </button>
          <p className="export-note">AI 将自动整理项目版本、设计文案与关键亮点。</p>
          <section className="style-reference-section">
            <div className="style-reference-heading">
              <div><b>风格参考</b><small>从灵感库添加，指导版式、材质与配色</small></div>
              <button onClick={onOpenInspiration}>＋ 添加</button>
            </div>
            {styleReferences.length > 0 ? (
              <div className="style-reference-list">
                {styleReferences.map((item) => (
                  <div className="style-reference-item" key={item.title}>
                    <span className={`style-swatch ${item.tone}`}><i /></span>
                    <span><b>{item.title}</b><small>{item.tag} · {item.author}</small></span>
                    <button onClick={() => onRemoveStyleReference(item.title)} aria-label={`移除风格参考 ${item.title}`}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <button className="empty-style-reference" onClick={onOpenInspiration}>
                <span>＋</span>
                <b>从灵感库添加参考</b>
                <small>你收藏的好风格，可以直接用于导出</small>
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
