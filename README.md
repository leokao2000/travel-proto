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

環境變數：`PORT`、`DATA_DIR`（可選）、`GOOGLE_OAUTH_CLIENT_ID`（選用，Google Drive 備份）。

## 設定 Google Drive 備份

「下載備份（JSON）」與「從檔案還原」不需要額外設定。要使用「備份到 Google Drive」與「從 Google Drive 還原」，請建立 OAuth 用戶端編號，並設到 Render。

1. 打開 [Google Cloud Console](https://console.cloud.google.com/)，建立或選一個專案。
2. 進入「API 和服務」→「已啟用的 API 和服務」，啟用 **Google Drive API**。
3. 進入「OAuth 同意畫面」：
   - 使用者類型選 **外部（External）**。
   - 應用程式名稱可填 `Leo prototype`。
   - 若還在測試中，把你的 Google 帳號加到**測試使用者**；或將應用程式發布為正式版。
   - 範圍只需 `https://www.googleapis.com/auth/drive.file`（只能看到這個 App 建立的檔案）。
4. 進入「憑證」→「建立憑證」→ **OAuth 用戶端 ID** → 應用程式類型選 **網頁應用程式（Web application）**。
5. **已授權的 JavaScript 來源**加入：
   - `https://travel-proto.onrender.com`
   - `http://localhost:3000`
6. 建立後複製用戶端編號（Client ID）。
7. 在 Render 這個 Web Service 的環境變數新增 `GOOGLE_OAUTH_CLIENT_ID`，值貼上該用戶端編號，然後重新部署。

存取權杖只留在瀏覽器記憶體，不會寫進伺服器或 localStorage。備份會放在雲端硬碟資料夾「Leo prototype 備份」。
