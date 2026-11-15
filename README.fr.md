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
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.es.md">Español</a> ·
  Français ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

Plugin DSH. Modifiez directement la dernière réponse du modèle et poursuivez la conversation depuis votre version. Les traces d’outils sont conservées intactes ; la conversation d’origine est gardée.

## Fonctionnalités

- **Modifier la réponse** — icône crayon à côté de la réponse. Réécrivez le texte ou le raisonnement ; l’enregistrement crée une nouvelle version et la conversation repart de là. `Ctrl / Cmd + Enter` enregistre, `Esc` annule.
- **Modifier la question** — icône crayon en fin de tour. Changez cette question et régénérez ; possible en pleine génération, l’ancienne réponse s’arrête automatiquement.
- **Régénérer** — icône de réessai en fin de tour. Même question, le tour repart.
- **Changer de version** — ‹n/m› sous le tour bascule entre les versions d’une même conversation, y compris archivées. Une seule entrée par conversation dans la barre latérale.

## Interface

<p align="center">
  <img src="docs/ui-preview.png" alt="Interface : entrées d’édition à côté de la réponse, anneau de versions et dialogue d’édition" width="100%">
</p>

## Fonctionnement

<p align="center">
  <img src="docs/how-it-works.png" alt="Fonctionnement : modifier la réponse → nouvelle version → continuer depuis votre version, traces d’outils conservées" width="100%">
</p>

Chaque enregistrement crée une nouvelle branche avec l’historique complet des outils. Revenez à une version antérieure à tout moment.

## Installation

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

`--profile desktop` pour l’application de bureau. Redémarrez DSH et activez le plugin.

En développement local, liez un répertoire :

```bash
dsh plugin --profile web add link:/chemin/absolu/vers/model-response-editor
```

## Compatibilité

- DSH `>=0.2.2-rc.1 <0.3.0`, web et bureau.
- Langues de l’interface : 中文, English, 日本語, Español, Français, Deutsch, Русский, Português. Le thème suit l’hôte.

## Développement

```bash
pnpm install
npm test
```

## Licence

Apache-2.0. Conservez l’attribution de [LICENSE](LICENSE) et [NOTICE](NOTICE) en cas de référence ou de redistribution.

掠蓝 · Groupe QQ : 676475076