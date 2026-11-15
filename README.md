<p align="center">
  <img src="docs/banner.png" alt="最终解释权 The Last Word" width="100%">
</p>

<h1 align="center">最终解释权 · The Last Word</h1>

<p align="center"><strong>本对话最终解释权归你所有。</strong></p>

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

模型回复只是草稿。说教删掉，结论留下，接着干活——不用重生成，不烧第二遍 token。

## 三个动作

| 动作 | 入口 | 结果 |
|---|---|---|
| 编辑回复 | 回复旁的铅笔图标 | 改写最终回复（正文或思考文本），保存后接着干 |
| 编辑提问 | 回合末尾的铅笔图标 | 修改这条提问，重新生成 |
| 重新生成 | 回合末尾的重试图标 | 提问不变，这一回合重来一次 |

## 为什么装它

**改回复，不重跑工具。** 工具查过的资料、跑过的命令、改过的文件，记录一条不丢。你只改最终回答，任务不用从头再来。

**版本切换，像翻草稿。** 同一对话的多个版本在侧栏只占一条，回合下方 ‹n/m› 随手切换，归档过的版本也能直接切回。改错了？切回去就是。

**生成到一半，也能改提问重来。** 看着模型跑偏，不用等它说完——改提问，立刻重来。还在生成的旧回复自动停掉，不白烧 token。

**原对话永远都在。** 每次修改都留底，不满意随时换一版。

## 界面一览

<p align="center">
  <img src="docs/ui-preview.png" alt="界面预览：回复旁的图标入口、版本环与编辑对话框" width="100%">
</p>

入口就在回复旁边，不打断阅读。深色 / 浅色主题自动跟随宿主，界面支持 8 种语言。

## 一次编辑发生了什么

<p align="center">
  <img src="docs/how-it-works.png" alt="编辑流程：草稿 → 改写 → 从你的版本继续，工具记录保留" width="100%">
</p>

## 安装

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

桌面端把 `--profile web` 换成 `--profile desktop`。安装后重启 DSH 并启用插件。

本地开发也可以链接目录：

```bash
dsh plugin --profile web add link:/绝对路径/到/model-response-editor
```

## 顺手的设计

- 对话框自动聚焦，`Ctrl / Cmd + Enter` 保存，`Esc` 取消。
- 正文与思考文本分开编辑，一键切换。
- 版本环 ‹n/m› 显示当前是第几版，归档版本直接切回。
- 生成中改提问，旧回复自动停止。
- 出错时告诉你下一步做什么，不甩术语。

## 兼容性

- DSH `>=0.2.2-rc.1 <0.3.0`，web 与桌面端。
- 界面语言：中文、English、日本語、Español、Français、Deutsch、Русский、Português。

## 开发

```bash
pnpm install
npm test   # 9 组回归：分叉、版本、侧栏、导航、工具记录等
```

## 许可

Apache-2.0。参考或分发本插件，请保留 [LICENSE](LICENSE) 与 [NOTICE](NOTICE) 中的署名。

掠蓝 · QQ 群：676475076