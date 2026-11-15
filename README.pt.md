<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center"><strong>A última palavra é sua.</strong></p>

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
  Português
</p>

A resposta do modelo é um rascunho. Apague o sermão, fique com a conclusão e volte ao trabalho — sem regenerar, sem queimar tokens duas vezes.

## Três ações

| Ação | Entrada | Resultado |
|---|---|---|
| Editar resposta | Ícone de lápis ao lado da resposta | Reescreva a resposta final (corpo ou raciocínio) e continue |
| Editar pergunta | Ícone de lápis no fim do turno | Mude esta pergunta e regenere |
| Regenerar | Ícone de repetição no fim do turno | A mesma pergunta, o turno roda de novo |

## Por que instalar

**Edite a resposta sem reexecutar as ferramentas.** Cada consulta, comando e alteração de arquivo fica registrado. Você reescreve só a resposta final — a tarefa nunca recomeça do zero.

**Troque de versão como quem folheia rascunhos.** Uma entrada na barra lateral por conversa; alterne versões com ‹n/m› sob o turno, incluindo as arquivadas. Errou? Volte atrás.

**Reescreva a pergunta no meio da resposta.** O modelo está saindo do trilho? Não espere terminar — mude a pergunta e recomece na hora. Respostas em streaming param sozinhas, sem queimar tokens em algo que ninguém vai ler.

**A conversa original está sempre lá.** Cada edição guarda uma cópia; troque de versão quando quiser.

## A interface

<p align="center">
  <img src="docs/ui-preview.png" alt="Prévia da interface: ícones ao lado da resposta, anel de versões e diálogo de edição" width="100%">
</p>

As entradas ficam ao lado da resposta, sem interromper a leitura. Temas claro / escuro seguem o host; a interface fala 8 idiomas.

## O que uma edição faz

<p align="center">
  <img src="docs/how-it-works.png" alt="Fluxo de edição: rascunho → reescrita → continuar da sua versão, registros de ferramentas mantidos" width="100%">
</p>

## Instalação

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Para o app desktop use `--profile desktop`. Reinicie o DSH e ative o plugin.

Para desenvolvimento local também dá para linkar um diretório:

```bash
dsh plugin --profile web add link:/caminho/absoluto/para/model-response-editor
```

## Detalhes cuidadosos

- O diálogo foca sozinho; `Ctrl / Cmd + Enter` salva, `Esc` cancela.
- Corpo e raciocínio editam separados, um clique para alternar.
- O anel ‹n/m› mostra a versão atual; arquivadas voltam direto.
- Editar a pergunta durante a geração para a resposta antiga automaticamente.
- Erros dizem o que fazer em seguida, sem jargão.

## Compatibilidade

- DSH `>=0.2.2-rc.1 <0.3.0`, web e desktop.
- Idiomas da interface: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português.

## Desenvolvimento

```bash
pnpm install
npm test   # 9 grupos de regressão: ramificação, versões, barra lateral, navegação, registros…
```

## Licença

Apache-2.0. Ao referenciar ou redistribuir este plugin, mantenha a atribuição em [LICENSE](LICENSE) e [NOTICE](NOTICE).

掠蓝 · Grupo QQ: 676475076