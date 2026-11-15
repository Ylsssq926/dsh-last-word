<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Apache-2.0"></a>
  <img src="https://img.shields.io/badge/version-0.3.1-brightgreen.svg" alt="0.3.1">
  <img src="https://img.shields.io/badge/DSH-%E2%89%A50.2.2--rc.1-orange.svg" alt="DSH ≥0.2.2-rc.1">
  <img src="https://img.shields.io/badge/tests-9%2F9-success.svg" alt="tests 9/9">
  <img src="https://img.shields.io/badge/i18n-8%20languages-purple.svg" alt="8 languages">
  <a href="https://github.com/Ylsssq926/dsh-last-word/stargazers"><img src="https://img.shields.io/github/stars/Ylsssq926/dsh-last-word?style=flat" alt="stars"></a>
</p>

<p align="center">
  <a href="README.md">中文</a> ·
  English ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

The model read eight files, ran three commands, and got one number wrong in the conclusion. Regenerating means running every tool again.

Just edit the reply. Tool records stay intact, and the conversation continues from your version.

## Features

- **Edit reply** — pencil icon beside the reply. Body and reasoning text are both editable; saving creates a new version with the full tool record carried over. `Ctrl / Cmd + Enter` saves, `Esc` cancels.
- **Edit prompt** — pencil icon at the turn tail. If the generation goes off track, change the prompt and restart immediately — the old reply stops on its own, no waiting for it to finish.
- **Regenerate** — retry icon at the turn tail. Same prompt, run the turn again.
- **Switch versions** — ‹n/m› under the turn. Every edit is a version; switch back if you mess up, archived ones included. One sidebar entry per conversation, so it never gets cluttered.

## Interface

<p align="center">
  <img src="docs/ui-preview.png" alt="Interface: edit entries beside the reply, version ring and edit dialog" width="100%">
</p>

## How it works

<p align="center">
  <img src="docs/how-it-works.png" alt="How it works: edit reply → new version → continue from your version, tool records preserved" width="100%">
</p>

Editing never touches the original conversation. Each save creates a new branch with every lookup, command and file change carried over — you only rewrite the final answer, the task never starts over. Not happy with it? ‹n/m› switches back to any version.

## Install

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Use `--profile desktop` for the desktop app. Restart DSH and enable the plugin.

For local development, link a directory:

```bash
dsh plugin --profile web add link:/absolute/path/to/model-response-editor
```

## Compatibility

- DSH `>=0.2.2-rc.1 <0.3.0`, web and desktop.
- Interface languages: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português. Theme follows the host.

## Development

```bash
pnpm install
npm test
```

## License

Apache-2.0. Keep the attribution in [LICENSE](LICENSE) and [NOTICE](NOTICE) when referencing or redistributing.

掠蓝 · QQ group: 676475076