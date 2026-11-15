<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center"><strong>Das letzte Wort gehört dir.</strong></p>

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
  <a href="README.ja.md">日本語</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  Deutsch ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

Die Antwort des Modells ist ein Entwurf. Streich die Predigt, behalte die Schlussfolgerung, arbeite weiter — ohne Neu-Generierung, ohne Tokens ein zweites Mal zu verbrennen.

## Drei Aktionen

| Aktion | Einstieg | Ergebnis |
|---|---|---|
| Antwort bearbeiten | Stift-Symbol neben der Antwort | Finale Antwort (Text oder Denktext) umschreiben und weitermachen |
| Frage bearbeiten | Stift-Symbol am Zug-Ende | Diese Frage ändern und neu generieren |
| Neu generieren | Wiederholen-Symbol am Zug-Ende | Gleiche Frage, der Zug läuft erneut |

## Warum installieren

**Antwort bearbeiten, ohne die Tools neu auszuführen.** Jede Recherche, jeder Befehl, jede Dateiänderung bleibt protokolliert. Du schreibst nur die finale Antwort um — die Aufgabe beginnt nie von vorn.

**Versionen wechseln wie Entwürfe blättern.** Ein Sidebar-Eintrag pro Unterhaltung; wechsle mit ‹n/m› unter dem Zug zwischen Versionen, auch archivierte. Vergriffen? Blättere zurück.

**Mitten in der Antwort die Frage ändern.** Das Modell driftet ab? Warte nicht bis zum Ende — ändere die Frage und starte sofort neu. Streamende Antworten stoppen automatisch, keine Tokens für eine Antwort, die niemand liest.

**Das ursprüngliche Gespräch bleibt immer.** Jede Änderung behält eine Kopie; wechsle jederzeit die Version.

## Die Oberfläche

<p align="center">
  <img src="docs/ui-preview.png" alt="UI-Vorschau: Symbole neben der Antwort, Versionsring und Bearbeitungsdialog" width="100%">
</p>

Die Einstiege liegen direkt neben der Antwort, ohne den Lesefluss zu stören. Dunkel- / Hell-Themes folgen dem Host; die Oberfläche spricht 8 Sprachen.

## Was eine Bearbeitung tut

<p align="center">
  <img src="docs/how-it-works.png" alt="Bearbeitungsfluss: Entwurf → Umschreiben → ab deiner Version weiter, Tool-Datensätze bleiben" width="100%">
</p>

## Installation

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Für die Desktop-App `--profile desktop` verwenden. DSH neu starten und das Plugin aktivieren.

Für lokale Entwicklung lässt sich auch ein Verzeichnis verlinken:

```bash
dsh plugin --profile web add link:/absoluter/pfad/zu/model-response-editor
```

## Durchdachte Details

- Der Dialog fokussiert automatisch; `Strg / Cmd + Enter` speichert, `Esc` bricht ab.
- Text und Denktext werden getrennt bearbeitet, ein Klick zum Wechseln.
- Der ‹n/m›-Ring zeigt die aktuelle Version; archivierte Versionen wechseln direkt zurück.
- Die Frage während der Generierung zu ändern stoppt die alte Antwort automatisch.
- Fehler sagen dir, was als Nächstes zu tun ist — kein Fachjargon.

## Kompatibilität

- DSH `>=0.2.2-rc.1 <0.3.0`, Web und Desktop.
- Oberflächensprachen: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português.

## Entwicklung

```bash
pnpm install
npm test   # 9 Regressionsgruppen: Verzweigung, Versionen, Sidebar, Navigation, Tool-Datensätze…
```

## Lizenz

Apache-2.0. Wer dieses Plugin referenziert oder weiterverteilt, behält die Namensnennung in [LICENSE](LICENSE) und [NOTICE](NOTICE) bei.

掠蓝 · QQ-Gruppe: 676475076