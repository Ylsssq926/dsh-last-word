<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Apache-2.0"></a>
  <a href="https://github.com/Ylsssq926/dsh-last-word/releases"><img src="https://img.shields.io/github/v/release/Ylsssq926/dsh-last-word?color=brightgreen" alt="release"></a>
  <img src="https://img.shields.io/badge/DSH-%E2%89%A50.2.2--rc.1-orange.svg" alt="DSH ≥0.2.2-rc.1">
  <img src="https://img.shields.io/badge/tests-9%2F9-success.svg" alt="tests 9/9">
  <img src="https://img.shields.io/badge/i18n-8%20languages-purple.svg" alt="8 languages">
  <a href="https://github.com/Ylsssq926/dsh-last-word/stargazers"><img src="https://img.shields.io/github/stars/Ylsssq926/dsh-last-word?style=flat" alt="stars"></a>
</p>

<p align="center">
  <a href="README.md">中文</a> ·
  <a href="README.en.md">English</a> ·
  日本語 ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

モデルが8つのファイルを読み、3つのコマンドを実行して、結論の数値を一つ間違えた。モデルはそれを最終回答だと思っている。

あなたは違う。返信を直接編集すればいい。ツール実行記録はそのまま残り、会話はあなたのバージョンから続く。再生成なら全ツールをやり直しになるが、あなたはしなくていい。最後の一言はあなたが決める。

## 機能

- **返信を編集** — 返信横の鉛筆アイコン。本文も思考テキストも編集可能。保存するとツール記録ごと新しいバージョンが生成される。`Ctrl / Cmd + Enter` で保存、`Esc` でキャンセル。
- **質問を編集** — ターン末尾の鉛筆アイコン。生成途中で方向がおかしければ、質問を変えて即やり直し。古い返信は自動停止するので、最後まで待つ必要はない。
- **再生成** — ターン末尾のリトライアイコン。質問はそのまま、ターンをやり直し。
- **バージョン切り替え** — ターン下の ‹n/m›。編集ごとにバージョンが残り、失敗したら戻ればいい。アーカイブ済みも直接戻れる。サイドバーは会話ごとに1件だけで、散らからない。

## 画面

<p align="center">
  <img src="docs/ui-preview.png" alt="画面：返信横の編集入口、バージョンリング、編集ダイアログ" width="100%">
</p>

## 仕組み

<p align="center">
  <img src="docs/how-it-works.png" alt="仕組み：返信を編集 → 新バージョン → あなたのバージョンから続行、ツール記録は保持" width="100%">
</p>

編集は元の会話に触れない。保存ごとに新しい分岐が生成され、調べた資料・実行したコマンド・変更したファイルの記録がそのまま引き継がれる。書き換えるのは最終回答だけで、タスクを最初からやり直す必要はない。気に入らなければ ‹n/m› でどのバージョンにも戻せる。

## インストール

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

デスクトップ版は `--profile desktop` を使用。インストール後、DSH を再起動してプラグインを有効化してください。

ローカル開発ではディレクトリをリンクできます：

```bash
dsh plugin --profile web add link:/絶対パス/model-response-editor
```

## 互換性

- DSH `>=0.2.2-rc.1 <0.3.0`、web とデスクトップ。
- 画面言語：中文、English、日本語、Español、Français、Deutsch、Русский、Português。テーマはホストに追従。

## 開発

```bash
pnpm install
npm test
```

## ライセンス

Apache-2.0。参考・再配布の際は [LICENSE](LICENSE) と [NOTICE](NOTICE) のクレジットを保持してください。

掠蓝 · QQ グループ：676475076