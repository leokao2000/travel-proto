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

環境變數：`PORT`、`DATA_DIR`（可選）、`GOOGLE_OAUTH_CLIENT_ID`（選用，Google Drive 備份）、`FLIGHT_API_KEY`（選用，航班查詢）。

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

## 航班查詢（選用）

去程、回程可以完全手動填。沒有設定金鑰時，「查詢航班」會停用，行程仍可儲存。

目前沒有可靠、免金鑰、能查未來班表的公開 API。OpenSky 只有當下的 ADS-B 航跡，沒有時刻表。Aviationstack 免費方案（每月 100 次、個人非商用）只有即時航班；未來班表要付費（Basic 約每月 49.99 美元，年繳約 44.99 美元；Professional 約 149.99 美元；Business 約 499.99 美元）。FlightAware AeroAPI 沒有真正的免費額度，班表最長約一年，即時狀態大約只到出發前兩天。

因此查詢預設走 AeroDataBox（RapidAPI）。2026 年 11 月官網價目：Basic 免費方案每月約 400 個 API units、每秒 1 次，未來班表最長約 365 天，但仍然要一把 API 金鑰。直接訂閱的 Starter / Growth / Scale 約為每月 19 / 99 / 499 美元。API.Market 的 Pro 約 7.50 美元，RapidAPI 的 Pro 約 8 美元。額度與價格會變，以供應商頁面為準。

1. 到 [AeroDataBox on RapidAPI](https://rapidapi.com/aedbx-aedbx/api/aerodatabox) 訂閱 Basic（或更高方案），複製 API Key。不要把金鑰寫進程式或提交到 git。
2. 在 Render 新增環境變數 `FLIGHT_API_KEY`，值貼上該金鑰，然後重新部署。
3. 部署完成後，行程裡的「查詢航班」才會亮起。查詢只補上還空著的機場與時間，不會蓋掉你已輸入的航班號碼或日期。

伺服器呼叫 `https://aerodatabox.p.rapidapi.com/flights/number/{航班號碼}/{日期}`，金鑰放在 header，不會寫進 log。本機測試可另設 `FLIGHT_API_URL` 指到自己的假上游，正式環境請留空。
