"use client";

import { useMemo, useState } from "react";

const projects = [
  { name: "模块化通勤灯", meta: "8 个版本 · 刚刚", tone: "orange" },
  { name: "桌面空气净化器", meta: "4 个版本 · 昨天", tone: "blue" },
  { name: "便携咖啡研磨器", meta: "12 个版本 · 3 天前", tone: "green" },
];

const versions = [
  { id: "V.04", title: "折叠灯臂", time: "刚刚", active: true },
  { id: "V.03", title: "暖灰外壳", time: "12 分钟前" },
  { id: "V.02", title: "旋钮交互", time: "28 分钟前" },
  { id: "V.01", title: "初始概念", time: "今天 14:20" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("创作");
  const [prompt, setPrompt] = useState(
    "一盏适合通勤和小户型的桌面灯，灯臂可以折叠收纳，保留圆形旋钮，整体轻巧但不要像玩具。",
  );
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");

  const promptCount = useMemo(() => prompt.trim().length, [prompt]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      notify("新方案已生成，并保存为 V.05");
    }, 1100);
  };

  return (
    <main className="app-page">
      <section className="app-shell">
        <aside className="rail">
          <div className="brand" aria-label="灵图 SketchFlow">
            <span className="brand-mark">S</span>
            <span className="brand-copy">
              <b>灵图</b>
              <small>SketchFlow</small>
            </span>
          </div>

          <nav className="primary-nav" aria-label="主导航">
            {[
              ["创作", "✦"],
              ["项目", "▦"],
              ["灵感", "◌"],
              ["导出", "↗"],
            ].map(([label, icon]) => (
              <button
                className={activeNav === label ? "nav-item active" : "nav-item"}
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  if (label !== "创作") notify(`${label}模块将在下一版接入`);
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="rail-tip">
            <span className="tip-orbit">◎</span>
            <b>今天也有好想法</b>
            <p>灵感、草图和每次修改都会自动保存。</p>
          </div>

          <button className="profile" onClick={() => notify("个人中心将在下一版接入")}>
            <span className="avatar">林</span>
            <span>
              <b>林知夏</b>
              <small>个人创作空间</small>
            </span>
            <span className="profile-more">•••</span>
          </button>
        </aside>

        <div className="workspace">
          <header className="topbar">
            <div>
              <span className="eyebrow">下午好，知夏</span>
              <h1>把刚才的灵感，变成看得见的方案。</h1>
            </div>
            <div className="top-actions">
              <button className="icon-btn" aria-label="搜索" onClick={() => notify("搜索将在下一版接入")}>
                ⌕
              </button>
              <button className="icon-btn notification" aria-label="通知" onClick={() => notify("暂无新通知")}>
                ♧
              </button>
              <button className="primary-btn compact" onClick={() => notify("已新建空白项目")}>
                <span>＋</span> 新项目
              </button>
            </div>
          </header>

          <div className="content-grid">
            <section className="creator-column">
              <article className="prompt-card">
                <div className="card-heading">
                  <div>
                    <span className="step-label">01 · 记录灵感</span>
                    <h2>你想设计什么？</h2>
                  </div>
                  <span className="autosave">● 已自动保存</span>
                </div>

                <div className="prompt-box">
                  <textarea
                    aria-label="设计想法"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    maxLength={240}
                  />
                  <div className="prompt-footer">
                    <div className="input-tools">
                      <button aria-label="添加图片" onClick={() => notify("图片上传将在下一版接入")}>▧</button>
                      <button aria-label="拍照" onClick={() => notify("相机将在小程序版接入")}>◉</button>
                      <button aria-label="语音输入" onClick={() => notify("语音输入将在后续版本接入")}>⌁</button>
                    </div>
                    <span>{promptCount}/240</span>
                  </div>
                </div>

                <div className="reference-row">
                  <button className="reference-tile" onClick={() => notify("可在这里替换参考图")}>
                    <span className="reference-shape lamp" />
                    <span className="reference-overlay">参考图 01</span>
                  </button>
                  <button className="add-reference" onClick={() => notify("图片上传将在下一版接入")}>
                    <span>＋</span>
                    添加参考
                  </button>
                  <div className="feature-locks">
                    <small>必须保留</small>
                    <div>
                      <button>圆形旋钮 <span>×</span></button>
                      <button>折叠结构 <span>×</span></button>
                    </div>
                  </div>
                </div>

                <div className="prompt-actions">
                  <button className="ghost-btn" onClick={() => notify("AI 已帮你补全使用场景")}>
                    <span>✦</span> 帮我补充想法
                  </button>
                  <button className="primary-btn" disabled={generating || !prompt.trim()} onClick={generate}>
                    {generating ? "正在生成…" : "生成概念草图"}
                    <span>{generating ? "◌" : "→"}</span>
                  </button>
                </div>
              </article>

              <section className="recent-section">
                <div className="section-heading">
                  <div>
                    <span className="step-label">继续创作</span>
                    <h2>最近项目</h2>
                  </div>
                  <button onClick={() => notify("项目列表将在下一版接入")}>查看全部 →</button>
                </div>

                <div className="project-grid">
                  {projects.map((project, index) => (
                    <button
                      className="project-card"
                      key={project.name}
                      onClick={() => notify(`已打开「${project.name}」`)}
                    >
                      <span className={`project-visual ${project.tone}`}>
                        <span className={`object-shape object-${index + 1}`} />
                        <small>0{index + 1}</small>
                      </span>
                      <span className="project-info">
                        <b>{project.name}</b>
                        <small>{project.meta}</small>
                      </span>
                      <span className="project-arrow">↗</span>
                    </button>
                  ))}
                </div>
              </section>
            </section>

            <aside className="insight-column">
              <article className="ai-card">
                <div className="ai-title">
                  <span className="ai-glyph">✦</span>
                  <div>
                    <small>AI 需求理解</small>
                    <h2>你的想法已经更清晰了</h2>
                  </div>
                  <span className="confidence">92%</span>
                </div>

                <div className="intent-block">
                  <small>设计方向</small>
                  <p>面向年轻租房人群的折叠桌面灯，强调便携、克制和易收纳。</p>
                </div>
                <div className="tag-block">
                  <small>提取标签</small>
                  <div className="tags">
                    <span>轻量化</span>
                    <span>折叠</span>
                    <span>小户型</span>
                    <span>通勤</span>
                    <span>极简</span>
                  </div>
                </div>
                <button className="edit-intent" onClick={() => notify("需求编辑器将在下一版接入")}>
                  编辑需求摘要 <span>→</span>
                </button>
              </article>

              <article className="timeline-card">
                <div className="timeline-title">
                  <div>
                    <span className="step-label">模块化通勤灯</span>
                    <h2>版本时间线</h2>
                  </div>
                  <button aria-label="更多版本操作" onClick={() => notify("更多操作将在下一版接入")}>•••</button>
                </div>
                <div className="version-list">
                  {versions.map((version) => (
                    <button
                      className={version.active ? "version active" : "version"}
                      key={version.id}
                      onClick={() => notify(`已切换到 ${version.id} ${version.title}`)}
                    >
                      <span className="version-dot" />
                      <span className="version-thumb">
                        <span />
                      </span>
                      <span className="version-copy">
                        <b>{version.id} · {version.title}</b>
                        <small>{version.time}</small>
                      </span>
                      {version.active && <span className="current-pill">当前</span>}
                    </button>
                  ))}
                </div>
                <button className="history-btn" onClick={() => notify("已展开完整版本历史")}>
                  查看完整历史
                </button>
              </article>
            </aside>
          </div>
        </div>

        <nav className="mobile-nav" aria-label="移动端导航">
          {[
            ["创作", "✦"],
            ["项目", "▦"],
            ["灵感", "◌"],
            ["我的", "☺"],
          ].map(([label, icon]) => (
            <button
              key={label}
              className={activeNav === label ? "active" : ""}
              onClick={() => {
                setActiveNav(label);
                if (label !== "创作") notify(`${label}模块将在下一版接入`);
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </section>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
