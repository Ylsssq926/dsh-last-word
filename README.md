<p align="center">
  <img src="docs/banner.png" alt="最终解释权 The Last Word" width="100%">
</p>

<h1 align="center">最终解释权 · The Last Word</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Apache-2.0"></a>
  <img src="https://img.shields.io/badge/version-0.3.1-brightgreen.svg" alt="0.3.1">
  <img src="https://img.shields.io/badge/DSH-%E2%89%A50.2.2--rc.1-orange.svg" alt="DSH ≥0.2.2-rc.1">
  <img src="https://img.shields.io/badge/tests-9%2F9-success.svg" alt="tests 9/9">
  <img src="https://img.shields.io/badge/i18n-8%20languages-purple.svg" alt="8 languages">
  <a href="https://github.com/Ylsssq926/dsh-last-word/stargazers"><img src="https://img.shields.io/github/stars/Ylsssq926/dsh-last-word?style=flat" alt="stars"></a>
</p>

<p align="center">
  中文 ·
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

DSH 插件。直接改模型的最后一条回复，改完从你的版本继续对话。工具调用记录原样保留，原对话不丢。

## 功能

- **编辑回复** — 回复旁的铅笔图标。改正文或思考文本，保存后生成新版本，接着对话。对话框里 `Ctrl / Cmd + Enter` 保存，`Esc` 取消。
- **编辑提问** — 回合末尾的铅笔图标。改这条提问重新生成；生成到一半也能改，旧回复自动停止。
- **重新生成** — 回合末尾的重试图标。提问不变，重跑这一回合。
- **版本切换** — 回合下方 ‹n/m› 切换同一对话的各个版本，归档的也能切回。侧栏里同一对话只占一条。

## 界面

<p align="center">
  <img src="docs/ui-preview.png" alt="界面：回复旁的编辑入口、版本环与编辑对话框" width="100%">
</p>

## 工作原理

<p align="center">
  <img src="docs/how-it-works.png" alt="工作原理：改回复 → 生成新版本 → 从你的版本继续，工具记录保留" width="100%">
</p>

每次保存生成一个新分支，工具记录完整带过去。不满意就切回旧版本。

## 安装

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

桌面端把 `--profile web` 换成 `--profile desktop`。安装后重启 DSH 并启用插件。

本地开发可以链接目录：

```bash
dsh plugin --profile web add link:/绝对路径/到/model-response-editor
```

## 兼容性

- DSH `>=0.2.2-rc.1 <0.3.0`，web 与桌面端。
- 界面语言：中文、English、日本語、Español、Français、Deutsch、Русский、Português。主题跟随宿主。

## 开发

```bash
pnpm install
npm test
```

## 许可

Apache-2.0。参考或分发请保留 [LICENSE](LICENSE) 与 [NOTICE](NOTICE) 中的署名。

掠蓝 · QQ 群：676475076