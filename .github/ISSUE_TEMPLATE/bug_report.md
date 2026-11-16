name: 报告问题 / Bug report
description: 编辑、版本切换或界面出了问题 / Something broke in editing, version switching or the UI
labels: [bug]
body:
  - type: input
    id: dsh-version
    attributes:
      label: DSH 版本 / DSH version
      placeholder: 0.2.2-rc.1
    validations:
      required: true
  - type: input
    id: plugin-version
    attributes:
      label: 插件版本 / Plugin version
      placeholder: 0.3.1
    validations:
      required: true
  - type: dropdown
    id: profile
    attributes:
      label: 运行环境 / Profile
      options:
        - web
        - desktop
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 复现步骤 / Steps
      description: 做了什么操作，期望什么，实际发生了什么。 / What you did, what you expected, what happened.
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: 报错信息（如有） / Error output (if any)
      render: text