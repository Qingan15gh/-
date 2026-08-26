# Qingan15gh · 个人主页

一个由 GitHub 数据实时驱动的开发者个人主页。

🌐 **在线地址（启用 GitHub Pages 后）**: `https://qingan15gh.github.io/-`

## ✨ 特性

- 🎨 深色系、开发者风格的单页设计，响应式适配手机
- 🖼️ 头像、项目、统计数据全部从 **GitHub API 实时拉取**，账号有更新页面自动同步
- ⭐ 项目卡片自动展示语言、大小、Star 数
- ✨ 星轨背景、滚动入场动画、导航菜单

## 📁 结构

```
├── index.html          # 页面结构
├── css/style.css       # 样式
├── js/main.js          # 交互 + GitHub API 数据
├── docs/               # 原始资料截图
└── README.md
```

## 🛠️ 自定义

改 `js/main.js` 顶部的 `USERNAME` 即可切换账号；改 `index.html` 里的「技能」「联系方式」等占位内容；头像和项目数据无需改动，会自动跟随 GitHub。

## 🚀 部署（GitHub Pages）

推送到仓库后，在仓库 **Settings → Pages** 里把 Source 设为 `main` 分支即可上线，无需任何服务器。
