# 交付與驗證記錄

- 可用第一版位於 `../double-diamond-principle/SKILL.md`，名稱為 `double-diamond-principle`。使用時可指定 `/double-diamond-principle` 與情境；若目前介面尚未列出新 skill，可直接要求依照完整 SKILL.md 路徑執行。未修改全域技能目錄或既有 skill-creator-ziv。
- 依使用者要求，先讀指定 Framework for Innovation，再沿站內相關連結查閱 Double Diamond、歷史、Systemic Design Framework，另補官方服務設計方法指南。研究筆記保留閱讀路徑、關鍵字、方法、步驟、規則、適用條件、例外與原始來源。
- 本次依 skill-creator-ziv 執行兩個案例的有／無 skill 比較，共四份輸出；為配合並行上限，每位代理依序執行同設定的兩題，並非每題完全隔離。
- 十項檢查：有 skill 通過 10/10，無 skill 通過 9/10。評閱依實際產物與可引用證據完成，不是盲測；多數檢查雙方皆通過，不能據此推稱普遍效能提升。
- 已以原附 `eval-viewer/generate_review.py` 生成 `iteration-1/review.html`。可切換 Outputs 與 Benchmark，查看輸出及逐項證據。靜態頁的回饋匯出後可用於下一輪修訂。
- 原附 `quick_validate.py` 缺少 PyYAML，未安裝額外套件。以 `finalize_review.py` 進行本 skill 的簡單純量 frontmatter、命名、說明長度、本文長度、本地連結、UTF-8、eval JSON 與答案字數檢查，全部通過。此檢查不是通用 YAML 驗證器。
- 代理未提供每題 token 或獨立計時；只保留其可取得的批次時間，benchmark 不比較時間與 token，也不把缺值當零。
- 新增的文獻查閱與追溯規則已寫入，尚未以第三個獨立案例驗證。尚未取得人工使用回饋，未執行描述觸發率最佳化，也未宣稱完成多輪改善。
