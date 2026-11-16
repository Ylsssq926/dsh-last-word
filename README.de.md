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
  <a href="README.ja.md">日本語</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  Deutsch ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

Das Modell hat acht Dateien gelesen, drei Befehle ausgeführt und sich bei einer Zahl in der Schlussfolgerung vertan. Es hält das für die endgültige Antwort.

Du nicht. Bearbeite die Antwort direkt — die Tool-Datensätze bleiben vollständig erhalten, und das Gespräch läuft ab deiner Version weiter. Neu generieren würde alle Tools noch einmal laufen lassen; du nicht. Du hast das letzte Wort.

## Funktionen

- **Antwort bearbeiten** — Stift-Symbol neben der Antwort. Text und Denktext sind bearbeitbar; beim Speichern entsteht eine neue Version mit dem vollständigen Tool-Verlauf. `Strg / Cmd + Enter` speichert, `Esc` bricht ab.
- **Frage bearbeiten** — Stift-Symbol am Zug-Ende. Läuft die Generierung in die falsche Richtung, ändere die Frage und starte sofort neu — die alte Antwort stoppt von selbst, ohne auf das Ende zu warten.
- **Neu generieren** — Wiederholen-Symbol am Zug-Ende. Gleiche Frage, der Zug läuft erneut.
- **Version wechseln** — ‹n/m› unter dem Zug. Jede Bearbeitung ist eine Version; bei einem Fehler einfach zurückwechseln, auch zu archivierten. Ein Sidebar-Eintrag pro Gespräch, keine Unordnung.

## Oberfläche

<p align="center">
  <img src="docs/ui-preview.png" alt="Oberfläche: Bearbeitungs-Einstiege neben der Antwort, Versionsring und Bearbeitungsdialog" width="100%">
</p>

## Funktionsweise

<p align="center">
  <img src="docs/how-it-works.png" alt="Funktionsweise: Antwort bearbeiten → neue Version → ab deiner Version weiter, Tool-Datensätze bleiben" width="100%">
</p>

Bearbeiten berührt nie das ursprüngliche Gespräch. Jedes Speichern erzeugt einen neuen Zweig mit jeder Recherche, jedem Befehl und jeder Dateiänderung im Verlauf — du schreibst nur die finale Antwort um, die Aufgabe beginnt nicht von vorn. Passt das Ergebnis nicht, wechselt ‹n/m› zu jeder beliebigen Version zurück.

## Installation

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Für die Desktop-App `--profile desktop` verwenden. DSH neu starten und das Plugin aktivieren.

Für lokale Entwicklung ein Verzeichnis verlinken:

```bash
dsh plugin --profile web add link:/absoluter/pfad/zu/model-response-editor
```

## Kompatibilität

- DSH `>=0.2.2-rc.1 <0.3.0`, Web und Desktop.
- Oberflächensprachen: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português. Das Theme folgt dem Host.

## Entwicklung

```bash
pnpm install
npm test
```

## Lizenz

Apache-2.0. Bei Referenz oder Weiterverteilung die Namensnennung in [LICENSE](LICENSE) und [NOTICE](NOTICE) beibehalten.

掠蓝 · QQ-Gruppe: 676475076