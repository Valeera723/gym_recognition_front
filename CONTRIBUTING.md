# AI-FIT Team Contribution Guide

这份文档是给团队成员和使用 AI agent 改代码时看的。目标很简单：大家都能快速更新项目，同时不要互相覆盖、不要把线上版本改坏。

## 三个源头

- Figma 是设计源头：页面视觉、动效、交互流程先在 Figma 里确定。
- GitHub 是代码源头：所有代码更新都进入这个仓库。
- `main` 是线上源头：合并到 `main` 后会触发 GitHub Pages 部署。

## 分支规则

不要直接修改或推送 `main`。每次改动新建一个分支：

```bash
git checkout main
git pull
git checkout -b feature/short-change-name
```

推荐分支命名：

```text
feature/figma-home-update
feature/equipment-recognition-api
feature/correction-video-flow
fix/pages-deploy
docs/api-contract
```

## Pull Request 规则

每次修改完成后开 Pull Request，PR 里必须说明：

- 改了哪些页面或功能
- 对应的 Figma 链接或截图
- 怎么测试
- 有没有改接口
- 有没有新增依赖

合并前至少由队长或另一名成员 review。

## 前端更新流程

### 快速 Figma 原型更新

适合课程展示、快速同步 Figma 画面。

1. 设计同学在 Figma 完成页面更新。
2. 导出新的页面 PNG、图标或素材。
3. 更新 `public/figma-images`。
4. 如果页面跳转/热区变了，更新 `src/data/figmaManifest.json` 和 `public/figma-manifest.json`。
5. 本地预览并截图确认。
6. 提交 PR。

### 正式 React 组件更新

适合真实交互、动画、摄像头、上传、识别结果页。

1. 不要整包覆盖项目。
2. 优先改 `src/components`、`src/services`、`src/styles`。
3. 一次 PR 只做一个页面或一个功能。
4. 需要动画时说明触发条件、持续时间、进入/退出状态。
5. 保证移动端 390px 宽度下能正常显示。

## 使用 v0、语构或其他 agent 的规则

可以使用 agent 帮忙生成代码，但要遵守：

- 先把当前 GitHub 仓库导入 agent，不要让 agent 从零生成一个新项目。
- 告诉 agent 只修改指定文件或指定页面。
- 不要让 agent 删除 `.github`、`public/figma-images`、`src/services`。
- agent 生成后必须本地运行检查。
- agent 的改动也要通过分支和 PR 合并。

## 后端和模型规则

后端代码可以加入仓库，但模型权重和大视频不要直接提交到 Git。

推荐：

```text
apps/api/             Python FastAPI 后端
models/README.md      说明模型权重如何下载或放置
docs/api-contract.md  前后端接口约定
```

不要提交：

```text
*.pt
*.onnx
*.engine
*.mp4
*.avi
datasets/
runs/
```

如果必须版本管理大文件，先讨论是否使用 Git LFS。

## 本地运行

前端：

```bash
npm install
npm run dev
```

静态预览：

```bash
npm run preview:static
```

构建检查：

```bash
npm run build
```

## 上线

合并到 `main` 后，GitHub Actions 会自动部署到 GitHub Pages：

```text
https://valeera723.github.io/gym_recognition_front/
```

如果部署失败，先看 GitHub Actions 的报错，再修 workflow 或构建问题。
