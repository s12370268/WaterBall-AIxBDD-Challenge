建議按三個獨立目的拆成三個 commit，方便分別審查與回復。

1. 提高發布套件的最低 Node 支援版本。這改變使用者的執行環境需求，即使只修改套件設定，也應標記 breaking change：

   ```text
   build!: 將最低 Node 支援版本從 18 提高至 22

   BREAKING CHANGE: 最低支援的 Node 版本由 18 提高至 22，使用者須升級至 Node 22 或更新的受支援版本。
   ```

2. 修正無關的 README 錯字：

   ```text
   docs: 修正 README 錯字
   ```

3. 回復已知提交的快取變更：

   ```text
   revert: 回復 abc1234 的快取變更

   This reverts commit abc1234.
   ```

對穩定版公開套件，提高最低 Node 版本屬不相容變更，語意上通常對應 major。單純 `docs` 不由規範保證升版；`revert` 的版本影響要看原始變更、回復後行為，以及發布工具如何辨識回復。未提供 abc1234 的 diff，無法判斷回復是否另外造成破壞性影響。

這些是依摘要提供的草稿，未操作 Git 或執行 lint。沒有 release 設定與現有版號，不能確定實際發布類型或下一個版號；還需考慮 parser、版本階段及整段提交歷史。
