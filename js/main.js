/* ===== Qingan15gh 个人主页脚本 ===== */
(() => {
  "use strict";

  const USERNAME = "Qingan15gh";
  const API = "https://api.github.com";

  /* ---------- 1. 导航 ---------- */
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

  /* ---------- 2. 入场动画 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- 3. 年份 ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 4. 格式化 ---------- */
  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 5. 拉取 GitHub 数据 ---------- */
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
          <span class="big">暂无公开项目</span>
          一切才刚开始，敬请期待。
        </div>`;
      return;
    }
    projectsEl.innerHTML = repos
      .map(
        (r) => `
        <a class="card" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <div class="card-top">
            <span class="card-name">${esc(r.name)}</span>
            ${r.stargazers_count ? `<span class="card-name-star">★ ${r.stargazers_count}</span>` : ""}
          </div>
          <p class="card-desc">${esc(r.description || "暂无描述")}</p>
          <div class="card-meta">
            ${r.language ? `<span><i class="lang-dot"></i>${esc(r.language)}</span>` : ""}
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
            <span class="big">数据加载失败</span>
            可能被限流，请稍后刷新页面。
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
