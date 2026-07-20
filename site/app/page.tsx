"use client";

import { useEffect, useMemo, useState } from "react";

type ViewName = "创作" | "项目" | "灵感" | "导出";
type ThemeMode = "light" | "dark";

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
  { title: "单一转轴的折叠语言", author: "Mori Studio", tag: "结构", tone: "lime", height: "tall" },
  { title: "柔和边界与家庭感", author: "Note Design", tag: "CMF", tone: "clay", height: "medium" },
  { title: "半透明材料的光影层次", author: "Aperture Lab", tag: "材质", tone: "glass", height: "short" },
  { title: "为小空间保留呼吸感", author: "Nook Journal", tag: "空间", tone: "blue", height: "tall" },
  { title: "克制的按钮反馈", author: "Everyday Objects", tag: "交互", tone: "ink", height: "medium" },
  { title: "便携产品的握持曲线", author: "Forma", tag: "人体工学", tone: "sage", height: "short" },
  { title: "将功能收进一条线", author: "Minimal Archive", tag: "形态", tone: "paper", height: "tall" },
  { title: "暖灰色的安静表达", author: "Soft Goods", tag: "配色", tone: "stone", height: "medium" },
  { title: "机械细节也可以很温柔", author: "Index Works", tag: "细节", tone: "orange", height: "short" },
  { title: "在桌面上创造微型地景", author: "Field Notes", tag: "概念", tone: "violet", height: "tall" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<ViewName>("创作");
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["桌面空气净化器"]);
  const [savedPosts, setSavedPosts] = useState<string[]>(["单一转轴的折叠语言"]);
  const [likedPosts, setLikedPosts] = useState<string[]>(["柔和边界与家庭感"]);
  const [projectFilter, setProjectFilter] = useState("全部");
  const [inspirationFilter, setInspirationFilter] = useState("为你推荐");
  const [highlightedProject, setHighlightedProject] = useState("");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sketchflow-theme");
    const nextTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
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
    ? allProjects
    : allProjects.filter((project) => project.status === projectFilter);

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
            <span className="avatar">用</span>
            <span><b>用户名称</b><small>个人中心</small></span>
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
              notify={notify}
            />
          )}
          {activeView === "导出" && <ExportView notify={notify} />}
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
          onClose={() => setProfileOpen(false)}
          onThemeChange={changeTheme}
          notify={notify}
        />
      </section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
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
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  promptCount: number;
  generating: boolean;
  generate: () => void;
  notify: (message: string) => void;
  onShowProjects: () => void;
  onShowProject: (name: string) => void;
}) {
  const [features, setFeatures] = useState(["圆形旋钮", "折叠结构"]);

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
              <button className="reference-tile" onClick={() => notify("可在这里替换参考图")}>
                <span className="reference-shape lamp" /><span className="reference-overlay">参考图 01</span>
              </button>
              <button className="add-reference" onClick={() => notify("图片上传将在后续版本接入")}><span>＋</span>添加参考</button>
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
              {recentProjects.map((project, index) => (
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
            <div className="ai-title"><span className="ai-glyph">✦</span><div><small>AI 需求理解</small><h2>你的想法已经更清晰了</h2></div><span className="confidence">92%</span></div>
            <div className="intent-block"><small>设计方向</small><p>面向年轻租房人群的折叠桌面灯，强调便携、克制和易收纳。</p></div>
            <div className="tag-block"><small>提取标签</small><div className="tags"><span>轻量化</span><span>折叠</span><span>小户型</span><span>通勤</span><span>极简</span></div></div>
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
  notify,
}: {
  projects: typeof allProjects;
  filter: string;
  setFilter: (value: string) => void;
  favorites: string[];
  toggleFavorite: (name: string) => void;
  highlightedProject: string;
  notify: (message: string) => void;
}) {
  return (
    <div className="view-panel">
      <PageHeader
        eyebrow="项目空间 · 6 个项目"
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
                  <button aria-label={`彻底删除 ${project.name}`} onClick={() => notify(`请再次确认是否彻底删除「${project.name}」`)}><span>×</span>彻底删除</button>
                  <button aria-label={`撤销归档 ${project.name}`} onClick={() => notify(`「${project.name}」已恢复到项目列表`)}><span>↶</span>撤销归档</button>
                </>
              ) : (
                <>
                  <button aria-label={`编辑 ${project.name}`} onClick={() => notify(`正在编辑「${project.name}」`)}><span>✎</span>编辑</button>
                  <button aria-label={`归档 ${project.name}`} onClick={() => notify(`「${project.name}」已移入归档`)}><span>□</span>归档</button>
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
  notify,
}: {
  filter: string;
  setFilter: (value: string) => void;
  savedPosts: string[];
  likedPosts: string[];
  toggleSavedPost: (title: string) => void;
  toggleLikedPost: (title: string) => void;
  notify: (message: string) => void;
}) {
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
          <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <div className="masonry-scroll">
        <section className="masonry-feed" aria-label={`${filter}灵感流`}>
          {inspirationPosts.map((post, index) => (
            <article className={`inspiration-card variant-${index % 4}`} key={post.title}>
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
                </div>
              </div>
            </article>
          ))}
        </section>
        <div className="feed-end"><span>✦</span>继续向下，灵感还在生长</div>
      </div>
    </div>
  );
}

const profileItems = [
  { icon: "↗", title: "导出记录", detail: "查看与管理历史导出文件" },
  { icon: "✦", title: "AI 使用额度", detail: "本月剩余 76% · 760 次" },
  { icon: "◎", title: "知识助手偏好", detail: "语言、回答风格与专业领域" },
  { icon: "⌘", title: "账号设置", detail: "个人资料、安全与登录方式" },
  { icon: "◇", title: "数据与隐私设置", detail: "数据授权、存储与使用范围" },
];

function ProfileCenter({
  open,
  theme,
  onClose,
  onThemeChange,
  notify,
}: {
  open: boolean;
  theme: ThemeMode;
  onClose: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  notify: (message: string) => void;
}) {
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
            <span className="drawer-eyebrow">PERSONAL CENTER</span>
            <h2>个人中心</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="关闭个人中心">×</button>
        </header>

        <section className="profile-identity">
          <span className="profile-avatar-large">用</span>
          <div>
            <b>用户名称</b>
            <small>SketchFlow 创作者</small>
          </div>
          <span className="member-chip">创作会员</span>
        </section>

        <section className="theme-card">
          <div className="theme-card-copy">
            <span className="theme-icon">{theme === "light" ? "☼" : "◐"}</span>
            <div><b>界面风格</b><small>选择更舒适的创作环境</small></div>
          </div>
          <div className="theme-switch" role="group" aria-label="界面风格">
            <button
              className={theme === "light" ? "active" : ""}
              aria-pressed={theme === "light"}
              onClick={() => onThemeChange("light")}
            >
              <span>☼</span> 浅色
            </button>
            <button
              className={theme === "dark" ? "active" : ""}
              aria-pressed={theme === "dark"}
              onClick={() => onThemeChange("dark")}
            >
              <span>◐</span> 深色
            </button>
          </div>
        </section>

        <nav className="profile-menu" aria-label="个人中心功能">
          {profileItems.map((item) => (
            <button
              key={item.title}
              onClick={() => notify(`${item.title}功能已打开`)}
            >
              <span className="profile-menu-icon">{item.icon}</span>
              <span><b>{item.title}</b><small>{item.detail}</small></span>
              <i>›</i>
            </button>
          ))}
        </nav>

        <footer className="profile-drawer-footer">
          <span><i /> 服务状态正常</span>
          <button onClick={() => notify("已退出当前账号")}>退出登录</button>
        </footer>
      </aside>
    </>
  );
}

function ExportView({ notify }: { notify: (message: string) => void }) {
  const [project, setProject] = useState(allProjects[0].name);
  const [format, setFormat] = useState<"PDF" | "PPT">("PPT");
  const [copy, setCopy] = useState("项目背景、设计目标、核心亮点、方案演进与最终成果");
  const [generating, setGenerating] = useState(false);
  const [ready, setReady] = useState(false);

  const createDocument = () => {
    setGenerating(true);
    setReady(false);
    window.setTimeout(() => {
      setGenerating(false);
      setReady(true);
      notify(`${format} 方案介绍已生成`);
    }, 1200);
  };

  return (
    <div className="view-panel export-view">
      <PageHeader
        eyebrow="AI 智能导出"
        title="把设计过程，整理成一份会讲故事的方案。"
        action={<span className="export-badge"><span>✦</span> AI 自动编排</span>}
      />
      <div className="export-layout">
        <section className="export-settings">
          <div className="export-step"><span>01</span><div><b>选择项目</b><small>选择需要整理与介绍的设计方案</small></div></div>
          <div className="project-selector">
            {allProjects.filter((item) => item.status !== "已归档").map((item) => (
              <button key={item.name} className={project === item.name ? "active" : ""} onClick={() => { setProject(item.name); setReady(false); }}>
                <span className={`mini-project ${item.tone}`} /><span><b>{item.name}</b><small>{item.versions} 个版本</small></span><i>{project === item.name ? "✓" : ""}</i>
              </button>
            ))}
          </div>

          <div className="export-step"><span>02</span><div><b>设计文案</b><small>AI 将依据这段内容生成叙事结构</small></div></div>
          <div className="export-copy-box">
            <textarea value={copy} onChange={(event) => { setCopy(event.target.value); setReady(false); }} aria-label="设计文案" />
            <button onClick={() => { setCopy("面向年轻租房人群，聚焦轻量、折叠与小空间收纳，通过多轮草图验证结构与交互细节。"); notify("AI 已优化设计文案"); }}>✦ AI 优化文案</button>
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
            disabled={generating || !copy.trim()}
            onClick={ready ? () => notify(`${project} 的 ${format} 文件已进入下载队列`) : createDocument}
          >
            {generating ? "AI 正在编排内容…" : ready ? `下载 ${format} 文件` : `生成 ${format} 方案`}<span>{generating ? "◌" : ready ? "↓" : "→"}</span>
          </button>
          <p className="export-note">AI 将自动整理项目版本、设计文案与关键亮点。</p>
        </aside>
      </div>
    </div>
  );
}
