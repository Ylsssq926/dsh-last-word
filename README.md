<p align="center">
  <img src="docs/banner.png" alt="最终解释权 The Last Word" width="100%">
</p>

<h1 align="center">最终解释权 · The Last Word</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Apache-2.0"></a>
  <a href="https://github.com/Ylsssq926/dsh-last-word/releases"><img src="https://img.shields.io/github/v/release/Ylsssq926/dsh-last-word?color=brightgreen" alt="release"></a>
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

模型查了八个文件、跑了三条命令，结论写错了一个数。它觉得这就是最终答案。

你觉得不是。直接改那条回复，工具记录原样保留，对话从你的版本继续——重新生成得重跑全部工具，你不用。最终解释权归你。

## 功能

- **编辑回复** — 回复旁的铅笔图标。正文、思考文本都能改，保存生成新版本，工具记录完整带过去。`Ctrl / Cmd + Enter` 保存，`Esc` 取消。
- **编辑提问** — 回合末尾的铅笔图标。生成到一半发现方向不对，改提问立刻重来，旧回复自动停止，不用等它说完。
- **重新生成** — 回合末尾的重试图标。提问不变，这一回合重来。
- **版本切换** — 回合下方 ‹n/m›。每次修改都是一个版本，改坏了切回去就是，归档的也能切回。侧栏里同一对话只占一条，不会越改越乱。

## 界面

<p align="center">
  <img src="docs/ui-preview.png" alt="界面：回复旁的编辑入口、版本环与编辑对话框" width="100%">
</p>

## 工作原理

<p align="center">
  <img src="docs/how-it-works.png" alt="工作原理：改回复 → 生成新版本 → 从你的版本继续，工具记录保留" width="100%">
</p>

编辑不碰原对话。每次保存生成一个新分支，查过的资料、跑过的命令、改过的文件，记录完整带过去——你改的只是最终回答，任务不用从头再来。不满意，‹n/m› 切回任何一版。

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