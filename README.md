# AntD 表格換膚評估頁

一次性的評估工具，不是產品程式碼。
目的只有一個：**Ant Design 的表格，套上我們的設計 token 之後，離我們要的「訂單列表」有多遠。**

結論分兩份：
- **[FINDINGS.md](./FINDINGS.md)** —— 第一輪：表格的交互與狀態盤點
- **[FINDINGS-2.md](./FINDINGS-2.md)** —— 第二輪：token 覆蓋率、深度客製成本、表單／Select／DatePicker

這份 README 只講怎麼跑、以及版本怎麼選的。

## 跑起來

```bash
npm install
```

```bash
npm run dev
```

打開 http://localhost:5173 就好。沒有 API、沒有路由、沒有狀態管理。

## ⚠️ 版本結論（這件事本身就是要知道的答案）

> **ProComponents 的穩定版最高只支援到 antd 5.x。
> 支援 antd 6 的只有 beta 版，因此本測試使用 `@ant-design/pro-components@3.1.14-7`（beta tag）。**

查 npm registry 的實際結果：

| 版本 | dist-tag | `peerDependencies.antd` | 能不能配 antd 6 |
| --- | --- | --- | --- |
| `2.8.10` | **latest** | `^4.24.15 \|\| ^5.11.2` | ❌ |
| `3.0.0-beta.3` | — | `^5.11.2` | ❌ |
| `3.1.14-7` | **beta** | `^6.0.0` | ✅ |

所以組合是：

| 套件 | 版本 | 備註 |
| --- | --- | --- |
| `antd` | `6.6.2` | 指定版本 |
| `@ant-design/pro-components` | `3.1.14-7` | **beta**，是目前唯一支援 antd 6 的版本 |
| `@ant-design/icons` | `6.3.4` | pro-components 3.x 要 icons ^6 |
| `react` / `react-dom` | `19.x` | |
| `vite` | `6.4.3` | 本機 Node 是 v20.5.1，Vite 7/8 需要 Node ≥20.19，所以停在 6 |
| `react-resizable` | `4.0.2` | 只為了測欄寬拖曳，見 FINDINGS §1 |

### 用 beta 要知道的風險

- `npm install` 會噴 `EBADENGINE`：`pro-components@3.1.14-7` 宣告 `node >= 22.12.0`，本機是 v20.5.1。
  實測 **dev server 跑得起來、頁面功能正常**，但正式要用得先把 Node 升上去。
- 3.x beta 已經開始改 API。目前踩到的：`hideInSearch` 被移除，改成 `search: false`。
  代表從 2.x 升上來不是無痛的，columns 定義要逐欄看。
- beta 沒有升版保證，隨時可能再改。

## 頁面怎麼用

最上面一列是常駐切換：

1. **區塊**：表格 ↔ 表單／Select／DatePicker
2. **主題（三層）**：
   - **Ant 預設值** —— 完全不傳 `theme`
   - **我們的 token** —— 只套 `src/sample_theme.json`，未定義的一律留 antd 預設，沒有覆寫任何樣式
   - **深度客製** —— 同一份 token ＋ ConfigProvider 元件層設定 ＋ 自訂 render ＋ CSS 覆寫

表格區塊底下另有：

3. **元件**：原生 antd Table ↔ ProTable（同一份資料、同一組欄位）
4. **資料量**：50 筆 ↔ 20,000 筆
5. **狀態**：正常／載入中／空資料／搜尋無結果／錯誤／無權限

第二列是表格能力開關：虛擬捲動、固定表頭、固定左右欄、展開列、分頁、外框線、欄寬拖曳。

表格上方的藍／黃色說明條會隨狀態變。**開頭有 ⚠ 的都是 antd 沒有、我們自己補的東西** ——
看到 ⚠ 就代表那個畫面不能當成 antd 的原廠能力。

### 兩個要小心的組合

- **20,000 筆 ＋ 關掉分頁 ＋ 沒開虛擬捲動**：實測會讓整個分頁鎖死一分鐘以上，等同當掉。
  頁面上會先跳警語。要看這個極端值可以，重新整理就好。
- **虛擬捲動 ＋ 展開列**：展開列在虛擬模式下完全沒反應，這是 antd 的限制，不是 bug。

## 檔案在哪

| 檔案 | 作用 |
| --- | --- |
| **`src/sample_theme.json`** | **第二輪起的 token 來源。** 「我們的 token」與「深度客製」兩層都吃這一份。⚠ 這是**一份既有專案的 theme，借來當測試值用的**，不是本產品的品牌色 —— 看到的顏色不代表任何設計決定 |
| `src/tokens.ts` | 第一輪手寫的 token，**內容未改動**。現在的角色是「Table 元件層 token 的完整參考清單」—— JSON 缺的那些都在這裡，每一項都有註解說它影響什麼，要補值可以當底稿 |
| `src/theme2.ts` | 三層主題的切換來源 |
| `src/deep/` | **深度客製層。** `icons.tsx`（Lucide 對照表）、`deepConfig.tsx`（ConfigProvider 元件層設定）、`DeepBits.tsx`（自訂 render）、`deep.css`（383 行 CSS 覆寫，每段都註明為什麼 token 做不到） |
| `src/forms/` | 第二輪的表單區：`OrderForm.tsx`、`SelectLab.tsx`、`DatePickerLab.tsx`、`formData.ts`（假後端） |
| `src/App.tsx` | 控制列、狀態說明條、主題切換 |
| `src/data.ts` | 假訂單資料產生器（決定性偽亂數，切換資料量時同一筆不會亂跳）。客戶名稱刻意混了 3 個字到 25 個字，用來看截斷 |
| `src/columns.tsx` | 原生與 ProTable 的欄位定義，含原生版自己畫的金額 / 日期區間篩選面板 |
| `src/NativeDemo.tsx` | 原生 antd Table。手刻的工具列與批次操作列都標註了「原生沒有」 |
| `src/ProDemo.tsx` | ProTable。搜尋列、欄位顯示、密度都用它內建的 |
| `src/ResizableTitle.tsx` | 欄寬拖曳用的 `<th>`。這個檔案＋`index.css` 裡那段 CSS 就是「欄寬拖曳要付的成本」 |
| `src/index.css` | 只有頁面容器和拖曳把手的樣式。**刻意沒有任何表格美化** |

## 刻意沒做的事

- 沒有接 API、沒有路由、沒有狀態管理
- 沒有為了好看去覆寫 antd 的樣式 —— antd 預設醜的地方就讓它醜，然後記在 FINDINGS.md 裡
- 沒有抽象化、沒有測試
