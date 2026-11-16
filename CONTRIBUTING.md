# 参与贡献 · Contributing

## 开发 · Development

```bash
pnpm install
npm test   # 9 组回归 / 9 regression groups
```

改代码后先跑 `npm test`。涉及分叉、版本、工具记录的改动，确认对应回归组通过。

Run `npm test` after changes. For branching, version or tool-record changes, make sure the matching regression group passes.

## 提交 · Submitting

- 一个 PR 做一件事，说清楚改了什么、为什么。 / One change per PR; say what and why.
- 保持「改回复不重跑工具」：编辑只动最终回复，工具记录必须完整保留。 / Keep "edit the reply, no tool re-runs": edits touch only the final reply, tool records stay intact.
- 界面文案用平实的动作动词，错误提示说明下一步怎么做。 / Plain action verbs in the UI; errors say what to do next.
- 用户可见文案不引用其他项目或署名（第三方许可声明除外，见 NOTICE）。 / No other-project names or attribution in user-facing copy (third-party license notices excepted, see NOTICE).

## 许可 · License

提交即表示同意以 Apache-2.0 授权你的贡献。 / By contributing, you agree your contribution is licensed under Apache-2.0.