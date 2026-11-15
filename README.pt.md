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
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  Português ·
</p>

Plugin DSH. Edite diretamente a última resposta do modelo e continue a conversa a partir da sua versão. Os registros de ferramentas são mantidos intactos; a conversa original é preservada.

## Funções

- **Editar resposta** — ícone de lápis ao lado da resposta. Reescreva o texto ou o raciocínio; ao salvar, uma nova versão é criada e a conversa continua a partir dela. `Ctrl / Cmd + Enter` salva, `Esc` cancela.
- **Editar pergunta** — ícone de lápis no fim do turno. Mude esta pergunta e regenere; funciona no meio da geração — a resposta anterior para sozinha.
- **Regenerar** — ícone de repetição no fim do turno. A mesma pergunta, o turno roda de novo.
- **Trocar versão** — ‹n/m› sob o turno alterna entre versões da mesma conversa, incluindo arquivadas. Uma entrada por conversa na barra lateral.

## Interface

<p align="center">
  <img src="docs/ui-preview.png" alt="Interface: entradas de edição ao lado da resposta, anel de versões e diálogo de edição" width="100%">
</p>

## Como funciona

<p align="center">
  <img src="docs/how-it-works.png" alt="Como funciona: editar resposta → nova versão → continuar da sua versão, registros de ferramentas mantidos" width="100%">
</p>

Cada salvamento cria um novo ramo com o registro completo de ferramentas. Volte a uma versão anterior quando quiser.

## Instalação

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Use `--profile desktop` para o app desktop. Reinicie o DSH e ative o plugin.

Para desenvolvimento local, vincule um diretório:

```bash
dsh plugin --profile web add link:/caminho/absoluto/para/model-response-editor
```

## Compatibilidade

- DSH `>=0.2.2-rc.1 <0.3.0`, web e desktop.
- Idiomas da interface: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português. O tema segue o host.

## Desenvolvimento

```bash
pnpm install
npm test
```

## Licença

Apache-2.0. Mantenha a atribuição de [LICENSE](LICENSE) e [NOTICE](NOTICE) ao referenciar ou redistribuir.

掠蓝 · Grupo QQ: 676475076