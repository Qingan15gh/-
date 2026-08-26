/* ===== Qingan15gh 个人主页脚本 ===== */
(() => {
  "use strict";

  const USERNAME = "Qingan15gh";
  const API = "https://api.github.com";

  /* ---------- 1. 星轨背景 ---------- */
  const canvas = document.getElementById("stars");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let stars = [], W, H;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.min(140, Math.floor(W * H / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        v: Math.random() * 0.22 + 0.05,
        a: Math.random() * 0.6 + 0.2,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.y -= s.v;
        if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener("resize", resize);
  }

  /* ---------- 2. 导航 ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      }
    });
  }

  /* ---------- 3. 入场动画 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- 4. 年份 ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 5. 语言颜色 ---------- */
  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
    HTML: "#e34c26", CSS: "#563d7c", Java: "#b07219", Go: "#00ADD8",
    Rust: "#dea584", C: "#555555", "C++": "#f34b7d", "C#": "#178600",
    PHP: "#4F5D95", Ruby: "#701516", Swift: "#F05138", Kotlin: "#A97BFF",
    Vue: "#41b883", Shell: "#89e051", Dockerfile: "#384d54",
    Vue3: "#41b883", "Jupyter Notebook": "#DA5B0B", Markdown: "#083fa1",
  };
  const langColor = (lang) => (lang && LANG_COLORS[lang]) || "#8b96ad";

  /* ---------- 6. 格式化 ---------- */
  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 7. 拉取 GitHub 数据 ---------- */
  const projectsEl = document.getElementById("projectsList");
  const statsEl = document.getElementById("statsGrid");

  const fetchJson = async (url) => {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  async function renderStats(user) {
    if (!statsEl) return;
    const created = new Date(user.created_at);
    statsEl.innerHTML = [
      { n: user.public_repos, label: "公开仓库" },
      { n: user.followers, label: "粉丝" },
      { n: user.following, label: "关注" },
      { n: created.getFullYear(), label: "加入年份" },
    ]
      .map(
        (s) =>
          `<div class="stat-card"><div class="stat-num">${fmt(s.n)}</div>` +
          `<div class="stat-label">${s.label}</div></div>`
      )
      .join("");
  }

  function renderProjects(repos) {
    if (!projectsEl) return;
    repos = repos.filter((r) => !r.fork);
    if (!repos.length) {
      projectsEl.innerHTML = `
        <div class="card empty-card" style="grid-column:1/-1">
          <span class="big">🚀</span>
          暂无公开项目 —— 一切才刚开始，敬请期待！
        </div>`;
      return;
    }
    projectsEl.innerHTML = repos
      .map(
        (r) => `
        <a class="card" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <div class="card-top">
            <span class="card-name">📁 ${esc(r.name)}</span>
            ${r.stargazers_count ? `<span>⭐ ${r.stargazers_count}</span>` : ""}
          </div>
          <p class="card-desc">${esc(r.description || "暂无描述")}</p>
          <div class="card-meta">
            ${r.language ? `<span><i class="lang-dot" style="background:${langColor(r.language)}"></i>${esc(r.language)}</span>` : ""}
            <span>${r.size ? Math.max(1, Math.round(r.size / 1000)) + " MB" : "刚刚创建"}</span>
          </div>
        </a>`
      )
      .join("");
  }

  async function load() {
    try {
      const [user, repos] = await Promise.all([
        fetchJson(`${API}/users/${USERNAME}`),
        fetchJson(`${API}/users/${USERNAME}/repos?per_page=100&sort=updated`),
      ]);
      renderStats(user);
      renderProjects(repos);
      const created = document.getElementById("createdDate");
      if (created && user.created_at) {
        created.textContent = new Date(user.created_at).toISOString().slice(0, 10);
      }
    } catch (err) {
      console.warn("GitHub API 加载失败：", err);
      if (projectsEl) {
        projectsEl.innerHTML = `
          <div class="card empty-card" style="grid-column:1/-1">
            <span class="big">⚠️</span>
            数据加载失败（可能被限流），请稍后刷新页面。
          </div>`;
      }
      if (statsEl) {
        statsEl.innerHTML = Array.from({ length: 4 }, () =>
          `<div class="stat-card"><div class="stat-num">—</div><div class="stat-label">未知</div></div>`
        ).join("");
      }
    }
  }

  load();
})();
