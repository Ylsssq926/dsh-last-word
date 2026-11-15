<p align="center">
  <img src="docs/banner.png" alt="The Last Word" width="100%">
</p>

<h1 align="center">The Last Word · 最终解释权</h1>

<p align="center"><strong>La última palabra es tuya.</strong></p>

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

La respuesta del modelo es un borrador. Borra el sermón, quédate con la conclusión y sigue trabajando: sin regenerar, sin quemar tokens dos veces.

## Tres acciones

| Acción | Entrada | Resultado |
|---|---|---|
| Editar respuesta | Icono de lápiz junto a la respuesta | Reescribe la respuesta final (cuerpo o razonamiento) y continúa |
| Editar pregunta | Icono de lápiz al final del turno | Cambia esta pregunta y regenera |
| Regenerar | Icono de reintento al final del turno | La misma pregunta, el turno se repite |

## Por qué instalarlo

**Edita la respuesta sin volver a ejecutar las herramientas.** Cada consulta, comando y cambio de archivo queda registrado. Solo reescribes la respuesta final: la tarea nunca empieza de cero.

**Cambia de versión como quien pasa borradores.** Una sola entrada en la barra lateral por conversación; alterna versiones con ‹n/m› bajo el turno, incluidas las archivadas. ¿Te equivocaste? Vuelve atrás.

**Reescribe la pregunta a mitad de respuesta.** ¿El modelo se desvía? No esperes a que termine: cambia la pregunta y reinicia al instante. Las respuestas en streaming se detienen solas, sin quemar tokens en algo que nadie leerá.

**La conversación original siempre está.** Cada edición guarda una copia; cambia de versión cuando quieras.

## La interfaz

<p align="center">
  <img src="docs/ui-preview.png" alt="Vista de la interfaz: iconos junto a la respuesta, anillo de versiones y diálogo de edición" width="100%">
</p>

Las entradas están junto a la respuesta, sin interrumpir la lectura. Los temas claro / oscuro siguen al host; la interfaz habla 8 idiomas.

## Qué hace una edición

<p align="center">
  <img src="docs/how-it-works.png" alt="Flujo de edición: borrador → reescritura → continuar desde tu versión, registros de herramientas conservados" width="100%">
</p>

## Instalación

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Para la app de escritorio usa `--profile desktop`. Reinicia DSH y activa el plugin.

Para desarrollo local también puedes enlazar un directorio:

```bash
dsh plugin --profile web add link:/ruta/absoluta/a/model-response-editor
```

## Detalles cuidados

- El diálogo enfoca solo; `Ctrl / Cmd + Enter` guarda, `Esc` cancela.
- Cuerpo y razonamiento se editan por separado, con un clic para alternar.
- El anillo ‹n/m› muestra en qué versión estás; las archivadas vuelven directamente.
- Editar la pregunta durante la generación detiene la respuesta anterior.
- Los errores te dicen qué hacer después, sin jerga.

## Compatibilidad

- DSH `>=0.2.2-rc.1 <0.3.0`, web y escritorio.
- Idiomas de la interfaz: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português.

## Desarrollo

```bash
pnpm install
npm test   # 9 grupos de regresión: ramas, versiones, barra lateral, navegación, registros…
```

## Licencia

Apache-2.0. Si referencias o redistribuyes este plugin, conserva la atribución en [LICENSE](LICENSE) y [NOTICE](NOTICE).

掠蓝 · Grupo QQ: 676475076