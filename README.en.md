# The Last Word (最终解释权)

**You get the last word.**

The model's reply is a draft. Delete the lecture, keep the conclusion, get back to work — no regeneration, no second burn of tokens.

## Three actions

| Action | Entry | Result |
|---|---|---|
| Edit reply | "Edit reply" under the reply | Rewrite the final reply (body or thinking text) and continue |
| Edit prompt | "Edit prompt" at the turn tail | Change this prompt and regenerate |
| Regenerate | "Regenerate" at the turn tail | Same prompt, run the turn again |

## Why install it

**Edit the reply, don't re-run the tools.** Every lookup, command and file change stays on record. You only rewrite the final answer — the task never starts over.

**Switch versions like flipping drafts.** One sidebar entry per conversation; flip between versions with ‹n/m› under the turn, archived ones included. Changed your mind? Flip back.

**Rewrite the prompt mid-answer.** See the model going off track? Don't wait for it to finish — change the prompt and start over. Streaming replies stop automatically, so no tokens burn on an answer nobody will read.

**The original conversation is always there.** Every edit keeps a copy; switch to another version whenever you like.

## Install

```bash
dsh plugin --profile web add github:Ylsssq926/dsh-last-word
```

Use `--profile desktop` for the desktop app. Restart DSH and enable the plugin.

## License

MIT.

掠蓝 · QQ group: 676475076