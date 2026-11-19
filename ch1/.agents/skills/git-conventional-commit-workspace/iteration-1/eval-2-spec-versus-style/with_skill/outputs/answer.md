A：符合核心規範。`Feat` 的大寫不是 Conventional Commits 1.0.0 規範錯誤；使用小寫 `feat` 可以是團隊風格建議，無須因此修正。

B：符合核心規範。`!` 已標記破壞性變更，描述也交代移除舊參數，因此不一定要再加 `BREAKING CHANGE` footer。若想補充遷移方式，可以加入，但不是此處的必要修正。

C：若意圖標記破壞性變更，目前未正確標記。小寫 `breaking change:` 不是有效的 breaking token；它可以被視為一般 body 文字，但不能表示規範中的 breaking change。最小修正版為：

```text
fix: handle empty input

BREAKING CHANGE: input must now be a string
```

專案規則未知，以上為人工依核心規範檢查，未執行 commitlint。未提供實際變更，無法驗證訊息的語意是否與程式一致。
