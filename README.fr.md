<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center"><strong>Le dernier mot vous appartient.</strong></p>

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

La réponse du modèle n’est qu’un brouillon. Supprimez le sermon, gardez la conclusion, reprenez le travail — sans régénération, sans brûler des tokens deux fois.

## Trois actions

| Action | Entrée | Résultat |
|---|---|---|
| Modifier la réponse | Icône crayon près de la réponse | Réécrivez la réponse finale (corps ou raisonnement) et continuez |
| Modifier la question | Icône crayon en fin de tour | Changez cette question et régénérez |
| Régénérer | Icône de reprise en fin de tour | Même question, le tour recommence |

## Pourquoi l’installer

**Modifiez la réponse sans relancer les outils.** Chaque recherche, commande et modification de fichier reste enregistrée. Vous ne réécrivez que la réponse finale : la tâche ne repart jamais de zéro.

**Changez de version comme on feuillette des brouillons.** Une seule entrée dans la barre latérale par conversation ; passez d’une version à l’autre avec ‹n/m› sous le tour, y compris les versions archivées. Une erreur ? Revenez en arrière.

**Réécrivez la question en pleine réponse.** Le modèle dérive ? N’attendez pas la fin : changez la question et repartez aussitôt. Les réponses en streaming s’arrêtent d’elles-mêmes, sans brûler des tokens pour une réponse que personne ne lira.

**La conversation d’origine est toujours là.** Chaque modification garde une copie ; changez de version quand vous voulez.

## L’interface

<p align="center">
  <img src="docs/ui-preview.png" alt="Aperçu : icônes près de la réponse, anneau de versions et dialogue d’édition" width="100%">
</p>

Les entrées sont juste à côté de la réponse, sans casser la lecture. Thèmes sombre / clair suivis depuis l’hôte ; l’interface parle 8 langues.

## Ce que fait une modification

<p align="center">
  <img src="docs/how-it-works.png" alt="Flux d’édition : brouillon → réécriture → continuer depuis votre version, traces d’outils conservées" width="100%">
</p>

## Installation

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Pour l’application de bureau, utilisez `--profile desktop`. Redémarrez DSH et activez le plugin.

En développement local, vous pouvez aussi lier un dossier :

```bash
dsh plugin --profile web add link:/chemin/absolu/vers/model-response-editor
```

## Détails soignés

- Le dialogue prend le focus automatiquement ; `Ctrl / Cmd + Entrée` enregistre, `Échap` annule.
- Corps et raisonnement se modifient séparément, un clic pour basculer.
- L’anneau ‹n/m› indique la version courante ; les versions archivées reviennent directement.
- Modifier la question pendant la génération arrête l’ancienne réponse.
- Les erreurs disent quoi faire ensuite, sans jargon.

## Compatibilité

- DSH `>=0.2.2-rc.1 <0.3.0`, web et bureau.
- Langues de l’interface : 中文, English, 日本語, Español, Français, Deutsch, Русский, Português.

## Développement

```bash
pnpm install
npm test   # 9 groupes de régression : branches, versions, barre latérale, navigation, traces d’outils…
```

## Licence

Apache-2.0. Si vous référencez ou redistribuez ce plugin, conservez l’attribution dans [LICENSE](LICENSE) et [NOTICE](NOTICE).

掠蓝 · Groupe QQ : 676475076