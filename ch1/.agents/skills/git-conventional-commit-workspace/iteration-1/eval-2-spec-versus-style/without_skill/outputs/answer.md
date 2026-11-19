A 符合規範。Conventional Commits 1.0.0 的一般關鍵字不區分大小寫；`Feat` 可以使用。統一成小寫 `feat` 是風格建議，沒有專案設定時不能當成規範錯誤。

B 符合規範。`!` 已標示破壞性變更，不一定要再加 `BREAKING CHANGE` footer；描述已交代移除舊參數。

C 的一般提交格式可以成立，但小寫 `breaking change` 無法作為規範定義的破壞性變更標記。這個標記必須大寫。要表達原意，最小修正為：

```text
fix: handle empty input

BREAKING CHANGE: input must now be a string
```

A、B 無須修正。
