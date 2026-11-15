<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center"><strong>最後の一言はあなたのもの。</strong></p>

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
  <a href="README.en.md">English</a> ·
  日本語 ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

モデルの返信は下書きにすぎません。説教は削り、結論を残して作業を続行——再生成も、トークンの二度消費も不要です。

## 3つのアクション

| アクション | 入口 | 結果 |
|---|---|---|
| 返信を編集 | 返信横の鉛筆アイコン | 最終返信（本文または思考テキスト）を書き換えて続行 |
| 質問を編集 | ターン末尾の鉛筆アイコン | この質問を変更して再生成 |
| 再生成 | ターン末尾のリトライアイコン | 質問はそのまま、このターンをやり直し |

## なぜ入れるのか

**返信を編集しても、ツールを再実行しない。** 調べた資料、実行したコマンド、変更したファイル——記録は一つも失われません。書き換えるのは最終回答だけ。タスクを最初からやり直す必要はありません。

**バージョン切り替えは下書きをめくるように。** 同じ会話の複数バージョンはサイドバーに1件だけ。ターン下の ‹n/m› で気軽に切り替え、アーカイブ済みのバージョンにも直接戻れます。間違えた？めくって戻るだけ。

**生成の途中でも質問を書き換えてやり直せる。** モデルが脱線したら、最後まで待たずに質問を変更して即やり直し。生成中だった古い返信は自動停止するので、誰も読まない回答にトークンを燃やしません。

**元の会話はいつでもそこに。** 編集ごとに控えを残すので、気に入らなければいつでも別バージョンへ。

## 画面

<p align="center">
  <img src="docs/ui-preview.png" alt="UIプレビュー：返信横のアイコン入口、バージョンリング、編集ダイアログ" width="100%">
</p>

入口は返信のすぐそば。読む流れを妨げません。ダーク／ライトテーマはホストに追従し、画面は8言語対応。

## 1回の編集で起きること

<p align="center">
  <img src="docs/how-it-works.png" alt="編集フロー：下書き → 書き換え → あなたのバージョンから続行、ツール記録は保持" width="100%">
</p>

## インストール

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

デスクトップ版は `--profile web` を `--profile desktop` に。インストール後、DSH を再起動してプラグインを有効化してください。

ローカル開発ではディレクトリをリンクすることもできます：

```bash
dsh plugin --profile web add link:/絶対パス/model-response-editor
```

## こだわりの細部

- ダイアログは自動フォーカス。`Ctrl / Cmd + Enter` で保存、`Esc` でキャンセル。
- 本文と思考テキストは別々に編集、ワンクリックで切り替え。
- ‹n/m› リングで現在のバージョンを表示。アーカイブ版にも直接戻れます。
- 生成中に質問を編集すると、古い返信は自動停止。
- エラーは次に何をすべきかを伝えます。専門用語は投げません。

## 互換性

- DSH `>=0.2.2-rc.1 <0.3.0`、web とデスクトップ。
- 画面言語：中文、English、日本語、Español、Français、Deutsch、Русский、Português。

## 開発

```bash
pnpm install
npm test   # 9つの回帰グループ：分岐、バージョン、サイドバー、ナビゲーション、ツール記録など
```

## ライセンス

Apache-2.0。本プラグインを参考・再配布する場合は、[LICENSE](LICENSE) と [NOTICE](NOTICE) のクレジットを保持してください。

掠蓝 · QQ グループ：676475076