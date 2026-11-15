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

Le modèle a lu huit fichiers, exécuté trois commandes, et s’est trompé sur un nombre dans la conclusion. Régénérer signifie relancer tous les outils.

Modifiez directement la réponse. Les traces d’outils sont conservées intactes et la conversation continue depuis votre version.

## Fonctionnalités

- **Modifier la réponse** — icône crayon à côté de la réponse. Texte et raisonnement sont modifiables ; l’enregistrement crée une nouvelle version avec tout l’historique des outils. `Ctrl / Cmd + Enter` enregistre, `Esc` annule.
- **Modifier la question** — icône crayon en fin de tour. Si la génération part dans la mauvaise direction, changez la question et repartez aussitôt : l’ancienne réponse s’arrête d’elle-même, sans attendre la fin.
- **Régénérer** — icône de réessai en fin de tour. Même question, le tour repart.
- **Changer de version** — ‹n/m› sous le tour. Chaque modification est une version ; revenez en arrière en cas d’erreur, y compris les versions archivées. Une seule entrée par conversation dans la barre latérale, jamais de désordre.

## Interface

<p align="center">
  <img src="docs/ui-preview.png" alt="Interface : entrées d’édition à côté de la réponse, anneau de versions et dialogue d’édition" width="100%">
</p>

## Fonctionnement

<p align="center">
  <img src="docs/how-it-works.png" alt="Fonctionnement : modifier la réponse → nouvelle version → continuer depuis votre version, traces d’outils conservées" width="100%">
</p>

Modifier ne touche jamais la conversation d’origine. Chaque enregistrement crée une nouvelle branche avec chaque consultation, commande et modification de fichier conservée : vous ne réécrivez que la réponse finale, la tâche ne repart pas de zéro. Si le résultat ne convient pas, ‹n/m› revient à n’importe quelle version.

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