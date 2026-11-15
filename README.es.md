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
  Español ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.pt.md">Português</a>
</p>

Plugin de DSH. Edita directamente la última respuesta del modelo y continúa la conversación desde tu versión. Los registros de herramientas se conservan intactos; la conversación original se mantiene.

## Funciones

- **Editar respuesta** — icono de lápiz junto a la respuesta. Reescribe el texto o el razonamiento; al guardar se crea una nueva versión y la conversación continúa desde ella. `Ctrl / Cmd + Enter` guarda, `Esc` cancela.
- **Editar pregunta** — icono de lápiz al final del turno. Cambia esta pregunta y regenera; también a mitad de generación: la respuesta anterior se detiene sola.
- **Regenerar** — icono de reintento al final del turno. La misma pregunta, el turno se ejecuta de nuevo.
- **Cambiar versión** — ‹n/m› bajo el turno alterna entre versiones de la misma conversación, incluidas las archivadas. Una sola entrada por conversación en la barra lateral.

## Interfaz

<p align="center">
  <img src="docs/ui-preview.png" alt="Interfaz: entradas de edición junto a la respuesta, anillo de versiones y diálogo de edición" width="100%">
</p>

## Cómo funciona

<p align="center">
  <img src="docs/how-it-works.png" alt="Cómo funciona: editar respuesta → nueva versión → continuar desde tu versión, registros de herramientas conservados" width="100%">
</p>

Cada guardado crea una nueva rama con el registro completo de herramientas. Vuelve a una versión anterior cuando quieras.

## Instalación

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Usa `--profile desktop` para la app de escritorio. Reinicia DSH y activa el plugin.

Para desarrollo local, enlaza un directorio:

```bash
dsh plugin --profile web add link:/ruta/absoluta/a/model-response-editor
```

## Compatibilidad

- DSH `>=0.2.2-rc.1 <0.3.0`, web y escritorio.
- Idiomas de la interfaz: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português. El tema sigue al host.

## Desarrollo

```bash
pnpm install
npm test
```

## Licencia

Apache-2.0. Conserva la atribución de [LICENSE](LICENSE) y [NOTICE](NOTICE) al referenciar o redistribuir.

掠蓝 · Grupo QQ: 676475076