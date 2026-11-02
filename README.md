# 旅途夥伴（travel-proto）

手機優先的旅行規劃原型（繁體中文）：

- 多國時間軸（時區／當地時間、每日活動）
- 邀請碼群組協作（約 7 秒輪詢同步）
- 共同帳本（原幣記帳，**以 TWD 結算**，預估匯率）
- 私人預算（僅 localStorage）與預估匯率（支援 EUR/CHF/JPY/TWD/CNY/HKD/AUD/NZD/KRW；預設約每週快取，可「立即更新」）

```bash
npm install
npm start
```

環境變數：`PORT`、`DATA_DIR`（可選）。
