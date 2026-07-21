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

const recentProjects = [
  { name: "模块化通勤灯", meta: "8 个版本 · 刚刚", tone: "orange" },
  { name: "桌面空气净化器", meta: "4 个版本 · 昨天", tone: "blue" },
  { name: "便携咖啡研磨器", meta: "12 个版本 · 3 天前", tone: "green" },
];

const allProjects = [
  { name: "模块化通勤灯", meta: "更新于 5 分钟前", versions: 8, tone: "orange", status: "进行中" },
  { name: "桌面空气净化器", meta: "更新于昨天", versions: 4, tone: "blue", status: "进行中" },
  { name: "便携咖啡研磨器", meta: "更新于 3 天前", versions: 12, tone: "green", status: "已完成" },
  { name: "陪伴型香氛音箱", meta: "更新于 7 月 12 日", versions: 6, tone: "rose", status: "进行中" },
  { name: "折叠户外水壶", meta: "更新于 7 月 8 日", versions: 9, tone: "sand", status: "已完成" },
  { name: "无障碍厨房计时器", meta: "更新于 6 月 26 日", versions: 5, tone: "violet", status: "已归档" },
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
  const visibleRecentProjects = recentProjects.filter((recent) =>
    projects.some((project) => project.name === recent.name),
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const switchView = (view: ViewName) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      notify("新方案已生成，并保存为 V.05");
    }, 1100);
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
        : [...current, { id: `inspiration-${post.title}`, title: post.title, tone: post.tone, source: "灵感" }],
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
    const previewUrl = URL.createObjectURL(file);
    setCreationReferences((current) => [
      ...current,
      { id: `album-${Date.now()}`, title: file.name, tone: "album", source: "相册", previewUrl },
    ]);
    notify("已从相册添加创作参考");
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
          {activeView === "创作" && (
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
            />
          )}
          {activeView === "项目" && (
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
              notify={notify}
            />
          )}
          {activeView === "灵感" && (
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
            />
          )}
          {activeView === "导出" && (
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
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  promptCount: number;
  generating: boolean;
  generate: () => void;
  notify: (message: string) => void;
  onShowProjects: () => void;
  onShowProject: (name: string) => void;
  references: CreationReference[];
  onRemoveReference: (id: string) => void;
  onAddAlbumReference: (file: File) => void;
  onOpenInspiration: () => void;
  recentItems: typeof recentProjects;
}) {
  const [features, setFeatures] = useState(["圆形旋钮", "折叠结构"]);
  const [referenceMenuOpen, setReferenceMenuOpen] = useState(false);
  const referenceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!referenceMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!referenceMenuRef.current?.contains(event.target as Node)) setReferenceMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [referenceMenuOpen]);

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
    <div className="view-panel">
      <PageHeader
        eyebrow="下午好，知夏"
        title="把刚才的灵感，变成看得见的方案。"
        action={
          <div className="top-actions">
            <button className="icon-btn search-btn" aria-label="搜索" onClick={() => notify("搜索将在后续版本接入")}>⌕</button>
            <button className="icon-btn notification" aria-label="通知" onClick={() => notify("暂无新通知")}>♧</button>
            <button className="primary-btn compact" onClick={() => notify("已新建空白项目")}><span>＋</span> 新项目</button>
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
                <div className="input-tools">
                  <button aria-label="添加图片" onClick={() => notify("图片上传将在后续版本接入")}>▧</button>
                  <button aria-label="拍照" onClick={() => notify("相机将在小程序版接入")}>◉</button>
                  <button className="voice-input" aria-label="语音输入" onClick={() => notify("语音输入将在后续版本接入")}>🎙︎</button>
                </div>
                <span>{promptCount}/240</span>
              </div>
            </div>
            <div className="reference-row">
              <div className="reference-tray">
                {references.map((reference) => (
                  <div
                    className={`reference-tile ${reference.source === "灵感" ? `inspiration-reference ${reference.tone}` : ""} ${reference.previewUrl ? "album-reference" : ""}`}
                    key={reference.id}
                    style={reference.previewUrl ? { backgroundImage: `url("${reference.previewUrl}")` } : undefined}
                  >
                    {!reference.previewUrl && reference.source === "默认" && <span className="reference-shape lamp" />}
                    {!reference.previewUrl && reference.source === "灵感" && <span className="reference-inspiration-shape" />}
                    <span className="reference-overlay">{reference.title}</span>
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
              <button className="primary-btn" disabled={generating || !prompt.trim()} onClick={generate}>
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
                  <span className={`project-visual ${project.tone}`}><span className={`object-shape object-${index + 1}`} /><small>0{index + 1}</small></span>
                  <span className="project-info"><b>{project.name}</b><small>{project.meta}</small></span>
                  <span className="project-arrow">↗</span>
                </button>
              ))}
            </div>
          </section>
        </section>
        <aside className="insight-column">
          <article className="ai-card">
            <div className="ai-title"><span className="ai-glyph">✦</span><div><small>AI 需求理解</small><h2>等待理解您的想法</h2></div><span className="confidence">—</span></div>
            <div className="intent-block"><small>设计方向</small><textarea aria-label="AI 设计方向" defaultValue="AI会自动理解您的想法" /></div>
            <div className="tag-block"><small>提取标签</small><div className="tags empty-tags" aria-label="暂无提取标签"><span /><span /></div></div>
            <button className="edit-intent" onClick={() => notify("需求编辑器将在后续版本接入")}>编辑需求摘要 <span>→</span></button>
          </article>
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
  notify,
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
  notify: (message: string) => void;
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
        action={<button className="primary-btn compact" onClick={() => notify("已新建空白项目")}><span>＋</span> 新项目</button>}
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
              <span className={`concept-object concept-${(index % 6) + 1}`} />
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
                  <button aria-label={`编辑 ${project.name}`} onClick={() => notify(`正在编辑「${project.name}」`)}><span>✎</span>编辑</button>
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
}) {
  const [addMenu, setAddMenu] = useState("");
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
          <label className="inspiration-search">
            <span>⌕</span>
            <input aria-label="搜索灵感" placeholder="搜索材质、形态、场景…" onKeyDown={(event) => event.key === "Enter" && notify("已为你整理相关灵感")} />
          </label>
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
  const [history, setHistory] = useState([
    { id: 1, project: "便携咖啡研磨器", format: "PPT", time: "今天 10:24" },
    { id: 2, project: "折叠户外水壶", format: "PDF", time: "7 月 18 日" },
    { id: 3, project: "便携咖啡研磨器", format: "PDF", time: "7 月 15 日" },
    { id: 4, project: "折叠户外水壶", format: "PPT", time: "7 月 11 日" },
    { id: 5, project: "便携咖啡研磨器", format: "PPT", time: "7 月 5 日" },
  ]);

  const createDocument = () => {
    setGenerating(true);
    setReady(false);
    window.setTimeout(() => {
      setGenerating(false);
      setReady(true);
      setHistory((current) => [
        { id: Date.now(), project, format, time: "刚刚" },
        ...current.filter((item) => !(item.project === project && item.format === format)),
      ]);
      notify(`${format} 方案介绍已生成`);
    }, 1200);
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
              <button key={item.name} className={project === item.name ? "active" : ""} onClick={() => { setProject(item.name); setReady(false); }}>
                <span className={`mini-project ${item.tone}`}>
                  <span className={`concept-object concept-${allProjects.findIndex((projectItem) => projectItem.name === item.name) + 1}`} />
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
              <button key={item} className={format === item ? "active" : ""} onClick={() => { setFormat(item); setReady(false); }}>
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
            onClick={ready ? () => notify(`${project} 的 ${format} 文件已进入下载队列`) : createDocument}
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
