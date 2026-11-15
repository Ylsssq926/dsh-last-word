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
  Русский ·
  <a href="README.pt.md">Português</a>
</p>

Плагин DSH. Измените последний ответ модели напрямую и продолжите разговор с вашей версии. Записи инструментов сохраняются полностью; исходный разговор остаётся.

## Возможности

- **Изменить ответ** — иконка карандаша рядом с ответом. Перепишите текст или рассуждения; при сохранении создаётся новая версия, и разговор продолжается с неё. `Ctrl / Cmd + Enter` сохраняет, `Esc` отменяет.
- **Изменить вопрос** — иконка карандаша в конце хода. Измените этот вопрос и сгенерируйте заново; можно и во время генерации — старый ответ останавливается автоматически.
- **Сгенерировать заново** — иконка повтора в конце хода. Тот же вопрос, ход выполняется снова.
- **Переключить версию** — ‹n/m› под ходом переключает версии одного разговора, включая архивные. Одна запись в боковой панели на разговор.

## Интерфейс

<p align="center">
  <img src="docs/ui-preview.png" alt="Интерфейс: точки редактирования рядом с ответом, кольцо версий и диалог редактирования" width="100%">
</p>

## Как это работает

<p align="center">
  <img src="docs/how-it-works.png" alt="Как это работает: изменить ответ → новая версия → продолжить с вашей версии, записи инструментов сохранены" width="100%">
</p>

Каждое сохранение создаёт новую ветку с полной записью инструментов. В любой момент можно вернуться к старой версии.

## Установка

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Для десктопного приложения — `--profile desktop`. Перезапустите DSH и включите плагин.

Для локальной разработки подключите каталог:

```bash
dsh plugin --profile web add link:/абсолютный/путь/к/model-response-editor
```

## Совместимость

- DSH `>=0.2.2-rc.1 <0.3.0`, web и десктоп.
- Языки интерфейса: 中文, English, 日本語, Español, Français, Deutsch, Русский, Português. Тема следует за хостом.

## Разработка

```bash
pnpm install
npm test
```

## Лицензия

Apache-2.0. При использовании или распространении сохраняйте указание авторства в [LICENSE](LICENSE) и [NOTICE](NOTICE).

掠蓝 · QQ-группа: 676475076