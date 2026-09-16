# 第二輪：客製化深度評估 ＋ 表單類元件

環境同第一輪：antd `6.6.2`、`@ant-design/pro-components@3.1.14-7`(beta)、React 19、Vite 6。
Token 來源換成 `src/sample_theme.json` —— **一份既有專案的 antd theme，借來當真實值的來源。**

> ⚠ **這不是本產品的品牌色。** 頁面上看到的青色、橘色、灰色都只是借來的測試值，
> 目的是拿「一份真的被用過的 theme」來量覆蓋率，不是在提案配色。
> 所以這一輪一樣不評價顏色好壞。
一樣，沒實測的地方會標「未實測」，顏色好壞不評價。

頁面上「主題」現在有三層，切了立刻生效：

| 層 | 內容 |
| --- | --- |
| **Ant 預設值** | 完全不傳 `theme` |
| **我們的 token** | 只套 `sample_theme.json`（借用的測試值），未定義的一律留 antd 預設，沒有覆寫任何樣式 |
| **深度客製** | 跟上一層**同一份 token**，差別全部在 token 以外：ConfigProvider 元件層設定 ＋ 自訂 render ＋ CSS 覆寫 |

第三層刻意不加任何 token，這樣量到的才是「token 以外還要付多少」。

---

# 0. Token 覆蓋率

## 0-1. 這份 JSON 定義了什麼

**全域 token：33 個，全部是顏色，外加一個 `borderRadius: 4`。**

```
colorPrimary  colorInfo  colorSuccess  colorWarning  colorError  colorLink
colorTextBase  colorText  colorTextSecondary  colorTextTertiary  colorTextQuaternary
colorSuccessBg/BgHover/Border/BorderHover/Hover
colorWarningBg/BgHover/Border/BorderHover/Hover
colorErrorBg/BgHover/Border/BorderHover/Hover
colorInfoBg/BgHover/Border/BorderHover/Hover
colorPrimaryHover
borderRadius
```

**元件層：51 個元件。但其中 38 個只設了 `lineHeight` 和／或 `fontFamily`**，等於沒設。
真正設了有意義的值的只有 13 個：Typography、Button、Layout、Menu、Dropdown、Cascader、
Rate、TreeSelect、Tag、Alert、Message、Result、Skeleton。

## 0-2. ⚠ Table 元件層 token：**一個都沒有**

你點名要檢查的 11 個，`components.Table` 底下全部沒有：

| Table token | 這份 JSON | 目前實際用的值 |
| --- | --- | --- |
| `headerBg` | ❌ 沒定義 | **antd 預設** |
| `headerColor` | ❌ 沒定義 | **antd 預設** |
| `borderColor` | ❌ 沒定義 | **antd 預設** |
| `cellPaddingBlockMD` | ❌ 沒定義 | **antd 預設**（12px） |
| `cellPaddingInlineMD` | ❌ 沒定義 | **antd 預設**（8px） |
| `rowHoverBg` | ❌ 沒定義 | **antd 預設** |
| `rowSelectedBg` | ❌ 沒定義 | **antd 預設** |
| `rowExpandedBg` | ❌ 沒定義 | **antd 預設** |
| `headerSortActiveBg` | ❌ 沒定義 | **antd 預設** |
| `bodySortBg` | ❌ 沒定義 | **antd 預設** |
| `selectionColumnWidth` | ❌ 沒定義 | **antd 預設** |

`components.Table` 實際內容只有這兩行：

```json
"Table": { "lineHeight": 1.5, "fontFamily": "'Lato', sans-serif" }
```

其餘沒定義的 Table token（一併列出來，這就是你要補的清單）：
`headerSplitColor`、`cellPaddingBlock`、`cellPaddingInline`、`cellPaddingBlockSM`、
`cellPaddingInlineSM`、`cellFontSize`、`cellFontSizeMD`、`cellFontSizeSM`、
`rowSelectedHoverBg`、`headerSortHoverBg`、`fixedHeaderSortActiveBg`、`headerFilterHoverBg`、
`headerBorderRadius`、`expandIconBg`、`footerBg`、`footerColor`、
`filterDropdownBg`、`filterDropdownMenuBg`、`stickyScrollBarBg`、`stickyScrollBarBorderRadius`。

> 第一輪的 `src/tokens.ts` 沒有被改動，現在它的角色變成「Table 元件層 token 的完整參考清單」，
> 上面每一項都有註解說明影響什麼。要補值的話那份可以直接當底稿。

## 0-3. 第一輪 §5 證實對表格有實質影響、但這份 JSON 沒定義的全域 token

| 全域 token | 這份 JSON | 對表格的影響 |
| --- | --- | --- |
| `colorBorder` | ❌ **預設值** | bordered 模式的直格線 |
| `colorBorderSecondary` | ❌ **預設值** | **列與列之間的分隔線** ← 表格最常看到的那條 |
| `colorBgContainer` | ❌ **預設值** | 表格本體底色、固定欄用它遮住下層 |
| `colorBgElevated` | ❌ **預設值** | 篩選下拉、日期面板底色 |
| `colorFillAlter` | ❌ **預設值** | **表頭底色的來源**（`headerBg` 沒設時就是它） |
| `colorTextDisabled` | ❌ **預設值** | 停用狀態文字（JSON 有 `colorTextQuaternary`，不是同一個） |
| `controlHeight` / `controlHeightSM` | ❌ **預設值** | 按鈕／輸入框高度，連帶工具列高度 |
| `padding` / `paddingSM` / `paddingXS` | ❌ **預設值** | **儲存格內距的預設來源** |
| `margin` / `marginXS` | ❌ **預設值** | 區塊間距、表格與分頁的距離 |
| `fontSize` / `fontSizeSM` / `fontSizeHeading5` | ❌ **預設值** | 儲存格與表頭字級 |
| `lineHeight`（全域） | ❌ **預設值** | 列高。**注意**：JSON 是逐元件設 `lineHeight: 1.5`，不是設全域 |
| `borderRadiusSM` | ❌ **預設值** | Tag 圓角、小尺寸控制項 |
| `lineWidth` | ❌ **預設值** | 所有邊框粗細，含表格格線 |
| `borderRadius` | ✅ **有定義**（4） | 唯一一個有定義的非顏色全域 token |

**一句話：這份 JSON 是一份「顏色主題」，不是一份「設計系統 token」。**
版面（密度、間距、字級、線寬）幾乎整組留在 antd 預設值。

## 0-4. 順帶量到的兩件事

**(a) `'Lato'` 這個字體在本專案沒有被載入。**
JSON 在 38 個元件上宣告了 `fontFamily: "'Lato', sans-serif"`，但 repo 裡沒有 `@font-face`、
也沒有 Google Fonts 的 `<link>`，`document.fonts` 裡查不到 Lato。
結果是：有宣告的地方英數字掉到 generic `sans-serif`（macOS 上是 Helvetica），
跟 antd 預設的 `-apple-system` 堆疊**不一樣**；中文因為 Lato 沒有中文字，兩邊都一樣。
→ 要嘛把 Lato 載進來，要嘛把這 38 個 `fontFamily` 拿掉，現在是第三種狀態（宣告了但沒生效到預期字體）。

**(b) 元件層 `fontFamily` 不會傳給該元件的所有子元素。** 實測同一張表單裡：

| 元素 | computed font-family |
| --- | --- |
| `.ant-input` | `Lato, sans-serif` ✅ |
| `.ant-picker input` | `Lato, sans-serif` ✅ |
| `.ant-card-head-title` | `Lato, sans-serif` ✅ |
| `.ant-form-item-label label` | `-apple-system, system-ui, …` ❌ |

`Form` 有設 `fontFamily`，但 antd 沒有把它套用到 label 上。
→ **同一個表單裡，label 和 input 會是兩套字體。** 這不是 token 值的問題，是 antd 的套用範圍問題。

---

# 0-5. 這份 JSON 是不是 antd 5 時代的格式？

**是 antd 5 時代產出的（Layout/Menu 的深色配色寫法、`Tag.defaultColor` 的用法都是 antd 5 的習慣），
但就「token 名稱」而言，33 個全域 token 與 51 個元件的所有 key，在 antd 6 全部仍然存在，沒有一個被改名或移除。**

我把 antd 5.29.3 與 antd 6.6.2 的 `theme/interface` 全部 key 做了 diff：

- **antd 5 有、antd 6 移除的全域 token：0 個。**
- antd 6 新增的全域 token：`colorBorderDisabled`、`colorErrorAffix`、`colorWarningAffix`、
  `focusOutline`、`screenXXXL`、`screenXXLMax`、`screenXXXLMin`，以及四個新元件
  （`Addon`、`BorderBeam`、`Listy`、`Masonry`）。
- Table / Select / DatePicker / Form / Empty / Input / Checkbox 的 ComponentToken：**5→6 沒有任何移除**。
  Pagination 新增 `itemSizeLG`，Tag 新增 `solidTextColor`。

## ⚠ 名稱沒變，但行為變了 —— 這幾項請你自己判斷要不要處理

**不自動猜對應關係，只列事實：**

| # | 項目 | antd 5 | antd 6 | 對這份 JSON 的影響 |
| --- | --- | --- | --- | --- |
| 1 | **Tag 預設底色的推導來源** | `defaultBg` 由 `colorFillQuaternary` 推導 | 改由 **`colorFillTertiary`** 推導 | JSON 有設 `Tag.defaultColor` 但沒設 `defaultBg`。同一份 token 在 antd 6 下，預設 Tag 的底色會比 antd 5 時**深一階**。要維持原樣得自己補 `Tag.defaultBg`。 |
| 2 | **Tag 的變體 API** | `bordered` | 新增 `variant: 'filled' \| 'solid' \| 'outlined'`，**`bordered` 標記為 deprecated** | JSON 沒用到，但既有程式碼若有 `<Tag bordered>` 會開始出現 deprecation 警告。 |
| 3 | **Alert 的主要文字 prop** | `message` | **`message` deprecated → 改用 `title`** | JSON 的 `Alert` 區塊不受影響，但既有程式碼全要改。第一輪已實測會在 console 噴警告。 |
| 4 | **Divider 的 `orientation` 語意整個換掉** | `orientation="left \| right \| center"`（標題位置） | `orientation` 變成 `'horizontal' \| 'vertical'`（方向），標題位置改叫 **`titlePlacement`** | JSON 的 `Divider` 區塊不受影響，但這是**會直接編譯失敗**的破壞性變更。本輪寫表單時就踩到了。 |
| 5 | **Form 移除 `hideRequiredMark`** | 有（已 deprecated） | **移除** | JSON 不受影響；既有程式碼要改用 `requiredMark={false}`。 |
| 6 | **Select 的 `popupRender`** | 有 | 頂層 d.ts 查不到，相關設定移到 `popup` 物件 | JSON 不受影響；既有自訂下拉的程式碼要確認。 |
| 7 | **antd 6 預設輸出 CSS 變數** | cssinjs 直接產值 | 產 `--ant-*` CSS 變數，定義在元件自己的根節點上 | 對 JSON 沒影響，但**改變了「怎麼覆寫」的遊戲規則**，見第一段 §C1。 |
| 8 | **尺寸命名** | `middle` | class 名變成 `ant-table-medium`；`Switch` 的 `default` 標記 deprecated（改 `medium`） | JSON 不受影響；自己寫的 CSS 選擇器若有 `ant-table-middle` 會失效。 |
| 9 | **`Layout.headerColor` 與 `headerBg` 同值** | — | — | JSON 兩個都是 `rgb(67,67,67)`。這不是 antd 6 造成的，是這份 JSON 本身的值，但在 antd 6 下 Layout Header 的文字會跟背景同色。**請你判斷是不是有意的。** |

---

# 0-6. 密度實測：套上這份 token 之後的實際列高

在 20,000 筆／原生 Table／`bordered=false` 下量 computed style（單位 px）。

| 密度 | Table size | 儲存格 padding | line-height | **列高** | 表頭高 |
| --- | --- | --- | --- | --- | --- |
| 寬鬆 | `large` | `16px` | **21px** | **57** | **75** |
| 中等 | `medium` | `12px 8px` | **21px** | **49** | **46** |
| 緊湊 | `small` | `8px` | **21px** | **41** | **38** |

同樣三個密度，切回「Ant 預設值」對照：

| 密度 | 儲存格 padding | line-height | 列高 | 表頭高 |
| --- | --- | --- | --- | --- |
| 寬鬆 | `16px` | 22px | 57 | 77 |
| 中等 | `12px 8px` | 22px | 49 | 47 |
| 緊湊 | `8px` | 22px | 41 | 39 |

## 跟第一輪的差異

第一輪用我編的值，**中等量到 41px**（padding `8px 12px`）。
這份 JSON **中等是 49px**，整整高 8px。

原因很單純：**這份 JSON 沒有定義任何 Table padding token，所以三段密度 100% 是 antd 原廠值。**
第一輪的 41px 是因為 `tokens.ts` 把 `cellPaddingBlockMD` 設成 8（antd 預設是 12）。

**唯一生效的 Table token 是 `lineHeight: 1.5`**，它把行高從 antd 預設的 22px（14 × 1.5714）
壓到 21px（14 × 1.5）。列高沒跟著變（padding 主導），但表頭高各少 1–2px。

## 順帶量到：寬鬆模式下表頭會換行

寬鬆模式表頭高度從 46/47px 跳到 75/77px ——
因為 `cellPaddingInline` 變成 16px，固定寬度的欄位（例如「預計出貨日」130px）
扣掉左右各 16px 只剩 98px，標題被擠到換兩行。
antd **沒有獨立的表頭 padding token**（表頭和儲存格共用 `cellPadding*`），
所以「寬鬆的內容 ＋ 不換行的表頭」這個常見需求，token 做不到，要寫 CSS。

---
---

# 第一段：客製化成本

「深度客製」層實際做出來的每一項。**時間上限一項抓 30–45 分鐘**，超過就停損。

## 成本表

| # | 項目 | 做了什麼 | 用的機制 | 動到的檔案與行數 | 難度 | 副作用 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **換 icon（A 類：全域一次換）** | Select 的 suffix／clear／remove／已選勾、DatePicker 的日曆與清除、Spin 的轉圈、Empty 的圖、Table 的展開鈕，全部換成 Lucide | **ConfigProvider 元件層設定**（`select` / `datePicker` / `spin` / `empty` / `table.expandable` / `renderEmpty`） | `deep/deepConfig.tsx` 57 行、`deep/icons.tsx` 53 行 | **容易** | Spin 換掉 icon 之後**轉圈動畫沒了**，antd 的旋轉是綁在原本那顆 icon 上，要自己補 12 行 CSS keyframes |
| 2 | **換 icon（B 類：只能逐個傳）** | 排序箭頭、篩選漏斗、分頁四顆箭頭 | **逐欄 `column.sortIcon` / `column.filterIcon`**＋**逐個 `Pagination.itemRender`**。這三個都**沒有 ConfigProvider 設定** | `deep/DeepBits.tsx` 約 40 行、`columns.tsx` +8 行（兩個 builder 各加一個 `deepCol` 再 `.map()` 套上去） | **普通** | 無。但成本會隨「表格數量 × 欄位數量」線性增加，這是五種模式要放大的部分 |
| 3 | **換 icon（C 類：沒有 API）** | 勾選框的勾 | **只能 CSS**。antd 的勾不是 icon，是用 `::after` 畫的旋轉 45° 長方形 → 關掉 `::after`，改用 `background-image` 塞 data-URI SVG | `deep/deep.css` 約 28 行 | **普通** | 半選（indeterminate）狀態那一橫也是 `::after` 畫的，要另外處理，否則會一起被關掉 |
| 4 | **換 icon（做不到）** | ProTable 工具列的**全螢幕**圖示、欄位設定浮層裡的**三顆釘選圖示** | 無。原始碼是 `_jsx(FullScreenIcon, {})` / `_jsx(VerticalAlignTopOutlined, {})`，**寫死、沒有 prop 可傳** | — | **放棄** | ProTable 的重新整理（`options.reloadIcon`）、密度（`options.densityIcon`）、設定（`settingIcon`）有 prop 可換，但全螢幕和釘選沒有。**要換只能 patch 套件或自己重寫工具列** |
| 5 | **分頁列重做** | 版面從「總數 → 上一頁 → 頁碼 → 下一頁 → 每頁筆數 → 跳頁」改成「每頁筆數 → `1–20 / 50` → （頁碼靠右，目前頁是深色方塊）」，跳頁欄拿掉 | **三種機制混用**：`itemRender`（換每一顆的內容）＋ `showTotal`（換文字）＋ **CSS `order`（換排列順序）** | `deep/DeepBits.tsx` 約 20 行、`deep/deep.css` 約 54 行 | **普通** | 無。但**排列順序完全沒有 API**，antd 的 DOM 順序是寫死的，只能靠 flex `order` 搬。想插入 antd 沒有的東西（例如「共 3 頁」）就得整個自己寫 |
| 6 | **表頭排序與篩選呈現** | 排序箭頭從「標題右邊上下兩個小三角」搬到**標題文字左邊**、改成單一箭頭；篩選漏斗改成滑桿圖示並貼齊標題 | icon 用 `column.sortIcon`／`filterIcon`；**位置只能用 CSS `order` 和 `justify-content`** | `deep/deep.css` 約 37 行 | **普通** | 無 |
| 7 | **標籤（Tag）重做** | 不用 `<Tag>`，改成自己畫的 `.deep-chip`：方角、左側 3px 色條、9 種狀態各自的色（用 `color-mix()` 自動推底色），完全不碰 antd preset | **完全自己寫**（取代 `<Tag>` 元件） | `deep/DeepBits.tsx` 約 25 行、`deep/deep.css` 約 24 行 | **容易** | 無。反而比第一輪「9 種狀態只有 3 種吃 token」的困境乾淨 —— 一旦自己畫，9 種就都受控 |
| 8 | **操作欄重做** | 「檢視 編輯 ⋯」藍色文字連結 → 三顆 24×24 的圖示按鈕（眼睛／鉛筆／刪節號）＋ Tooltip | **自訂 render**（換掉 column 的 `render`） | `deep/DeepBits.tsx` 約 22 行、`deep/deep.css` 約 25 行、`columns.tsx` +2 行 | **容易** | 無 |
| 9 | **空狀態重做** | antd 的灰色插畫 → Lucide 收件匣線條圖 ＋ 小字說明 | **`ConfigProvider.renderEmpty`**（全域一次換）＋ 搜尋無結果另外走 `locale.emptyText` | `deep/DeepBits.tsx` 約 12 行、`deep/deep.css` 約 17 行、`shared.tsx` +15 行 | **容易** | `renderEmpty` 是全域的，Select 的「查無資料」也會一起換掉（antd 原始碼確認 Select 會呼叫 `renderEmpty?.('Select')`）。**它不是只影響表格。** 好消息是它會收到 `componentName` 參數，要分元件給不同空狀態是做得到的 —— 本輪沒分，一律同一個 |
| 10 | **下拉選單與日期面板浮層** | 圓角 → 2px 方角；柔和陰影 → 1px 深色實線邊框 ＋ 硬邊偏移陰影；選項列方角、選中反白改成深底白字；日期格子從圓形改方塊、週標題改小字大寫 | **CSS**，但**必須掛在 `<body>` 上** | `deep/deep.css` 約 53 行、`App.tsx` +5 行（`useEffect` 切 body class） | **普通** | **這是最容易漏掉的一項**：浮層走 React portal 掛在 `<body>` 底下，`.page` 的 scope 完全蓋不到。必須額外維護一個 body class，而且切換／卸載都要記得清掉 |
| 11 | **表單控制項外觀** | 輸入框、Select、DatePicker 從圓角＋內陰影改成 2px 方角＋focus 時底部 2px 色線；必填標記從 label 前的紅星改成 label 後的小圓點 | **CSS**（必填標記是覆寫 `.ant-form-item-required::before/::after`） | `deep/deep.css` 約 29 行 | **普通** | 必填星號只能用 `::before { display:none }` 關掉再用 `::after` 重畫，**動到虛擬元素就等於放棄 antd 未來在那裡加東西的相容性** |
| 12 | **表頭外觀** | 灰底＋粗體＋圓角 → 無底色＋11px 小字＋字距＋大寫＋下方 2px 深色實線 | **覆寫 CSS 變數**（`--ant-table-header-bg` 等）＋ 直接寫 CSS（字距、大寫、粗細） | `deep/deep.css` 約 41 行（§0 變數 27 行 ＋ §1 表頭 14 行） | **普通** | ⚠ **踩到一個真的 bug**，見下方「副作用詳述」 |

## 副作用詳述：`--ant-table-header-bg: transparent` 會弄壞固定欄

一開始把表頭底色設成 `transparent`（想要「沒有灰底的表頭」），結果**固定在右側的「操作」欄，
它的表頭直接透出下層正在橫向捲動的「金額」欄**，兩個標題疊在一起。

原因：antd 的固定欄是 `position: sticky` ＋ **靠背景色遮住下層**，沒有額外的遮罩層。
表頭一透明，遮蔽就破功。

修法是改成不透明的 `#ffffff`（視覺上一樣是「沒有灰底」），同理
`headerSortActiveBg` / `headerSortHoverBg` 也不能設 transparent。

**這一項值得記住：任何「把背景改成透明」的設計需求，在 antd 的固定欄上都會爆。**

## 另一個機制上的坑：antd 6 的 CSS 變數不是掛在祖先上

第一輪發現「antd 6 預設輸出 CSS 變數」是好消息，但這一輪才知道實際怎麼用：

antd 把變數定義在**元件自己的根節點**上：

```css
.css-var-_r_7i_.ant-table-css-var { --ant-table-header-bg: #f2f5f9; … }
```

這是兩個 class 的 specificity。所以：

- ❌ `[data-skin="deep"] { --ant-table-header-bg: X }`（掛祖先）→ **不會生效**
- ✅ `.page[data-skin="deep"] .ant-table-css-var { --ant-table-header-bg: X }`（祖先＋元件根節點，3 個 class）→ 生效

也就是：**CSS 變數能用，但每一個元件都要寫一條「墊高 specificity」的選擇器**，
而且要知道每個元件的 `ant-xxx-css-var` class 名。這比「在 `:root` 改一行」貴很多。

---

## 總結

### 做完這一輪客製，總共花了多久？

我的 wall-clock 不是有用的參考值（我不會累、也不用查文件）。給你可以拿去估的東西：

**實際產出的程式碼量**

| 檔案 | 行數 | 性質 |
| --- | --- | --- |
| `src/deep/deep.css` | **383** | 新增，純覆寫 |
| `src/deep/DeepBits.tsx` | 136 | 新增，自訂 render |
| `src/deep/deepConfig.tsx` | 57 | 新增，ConfigProvider 設定 |
| `src/deep/icons.tsx` | 53 | 新增，icon 對照表 |
| `src/theme2.ts` | 31 | 新增，三層主題切換 |
| 第一輪檔案的改動 | 約 +60 | `App.tsx` / `columns.tsx` / `NativeDemo.tsx` / `ProDemo.tsx` / `shared.tsx` 各加一個 `skin` 分支 |
| **合計** | **約 720 行** | 只涵蓋**一種模式（List）的一張表格** |

**以人估**：對熟 antd 的工程師，這 720 行大約是 **2–3 個工作天**。
其中真正花時間的不是寫，是「找出 antd 到底把那個東西畫在哪裡」——
勾選框的勾、固定欄的遮蔽機制、CSS 變數的 specificity，這三個各自都要翻原始碼才知道。

### 哪幾項是真正的阻力？

排序如下（最痛在前）：

1. **浮層走 portal，scope 蓋不到**（#10）。
   這不是「多寫幾行」的問題，是**架構上多一套 scope 要維護**。
   所有 dropdown、日期面板、Tooltip、Popover、Modal、Drawer 都在 `<body>` 底下。
   五種模式全部做完，body-scope 的 CSS 只會愈長愈大，而且沒有任何東西擋你寫錯。

2. **CSS 變數要逐元件墊 specificity**（機制坑）。
   antd 6 的 CSS 變數看起來像是「可以集中覆寫」，實際上不行。
   每個元件都要一條專屬選擇器，而且得先知道它的 `css-var` class 名。

3. **藏在元件內部、完全沒有 API 的東西**（#3、#4）。
   勾選框的勾是 `::after` 畫的長方形、ProTable 的全螢幕與釘選圖示寫死在原始碼裡。
   這類東西沒有「做多久」的問題，只有「要不要 fork／patch」的決定。

4. **`position: sticky` ＋ 背景色的隱含契約**（副作用詳述）。
   antd 有一批視覺行為是靠「不透明背景」成立的，文件不會寫，改了才知道。

### 同樣程度的客製套到五種模式，要多少工？

**假設**：五種模式＝List、Detail、Form、Command、Workspace；客製程度跟這一輪一樣
（換 icon、重做分頁／標籤／操作欄／空狀態／浮層、表頭與控制項外觀）。

| 項目 | 一次性 ／ 每個模式 | 估計 |
| --- | --- | --- |
| icon 對照表、ConfigProvider 設定、body-scope 浮層樣式、表單控制項外觀、按鈕 | **一次性**（五種模式共用） | 本輪已做掉約 **60%** |
| 表格相關（表頭、排序、分頁、標籤、操作欄、空狀態） | List ＋ Workspace 共用 | 本輪已做掉約 **80%** |
| Detail（Descriptions / Tabs / Timeline 的外觀） | 新的一批元件 | **3–4 天** |
| Command（Modal / Drawer / Steps / Result 的外觀，含 portal） | 新的一批元件 | **3–4 天** |
| Workspace（Layout / Menu / Splitter，Menu 是 antd 辨識度第二高的元件） | 新的一批元件 | **4–6 天** |
| 五種模式之間的一致性回歸（改一處會不會弄壞另一處） | 持續 | **3–5 天** |

**合計約 15–22 個工作天**，抓 **3–4 週**（單人）。

這個數字有兩個前提，任一不成立就要往上加：
- 不需要 fork 或 patch 任何套件（目前已知 ProTable 工具列有兩個圖示會逼你做這個決定）
- 不需要深色模式。要的話，上面每一條寫死顏色的 CSS 都要再來一次。

### 有沒有哪一項是「不管怎麼改都還是看得出 AntD」？

有，三個。

**1. Form 的錯誤訊息行為。**
antd 的 `Form.Item` 會在欄位下方保留一塊固定高度的錯誤區，錯誤出現時是**淡入＋高度動畫**。
這個動畫曲線、以及「錯誤出現時整張表單會抖一下」的體感，是 antd 的簽名。
要改得關掉 `help` 的 motion 並自己接管錯誤顯示，等於放棄 `Form.Item` 一半的價值。
**本輪沒做，時間盒內做不完。**

**2. Select 多選的 Tag 行為。**
選項變成可關閉小方塊、超出寬度收成「+N」、`maxTagCount="responsive"` 的量測邏輯 ——
這整套互動是 antd（實際上是 rc-select）的行為指紋。外觀能改，**行為改不動**。

**3. 表格「固定欄 ＋ 橫向捲動 ＋ 陰影」的那組互動。**
陰影的出現時機、跟著捲動位置變化的方式，是 rc-table 的實作。
第一輪已經記過「陰影沒有對應 token」；這一輪確認：連 CSS 都只能改顏色和粗細，
**時機和行為改不了**。熟 antd 的人看到那個陰影漸變就會認出來。

另外補一個不算「認出 AntD」但會露餡的：**波紋（Wave）效果**。
按鈕點下去外圈那圈擴散動畫是 antd 特有的，`ConfigProvider.wave` 可以關掉或換，
本輪沒動它 —— 這是**已知還留著的 AntD 痕跡**。

---
---

# 第二段：表單類元件能力盤點

分類定義同第一輪：**內建** ／ **調 token** ／ **要寫 CSS** ／ **做不到**。

## Form

| 項目 | 判定 | 說明 |
| --- | --- | --- |
| 標籤在左 ／ 標籤在上 | **內建** | `layout="horizontal" \| "vertical"`，搭 `labelCol` / `wrapperCol`。切換即時生效。 |
| 必填標記 | **內建**（樣式要寫 CSS） | `rules: [{ required: true }]` 自動出現紅星。星號在 label **前面**，位置與形狀沒有 token，要改成「label 後面的小圓點」只能覆寫 `.ant-form-item-required::before/::after`。 |
| 欄位層級的伺服器驗證錯誤 | **內建** | `form.setFields([{ name, errors: [...] }])`。巢狀欄位用 `name: ['receiver','phone']` 也接得上。頁面上輸入 `abc` 或手機填 `12345` 可以看到。 |
| 表單層級的錯誤總結 | **做不到** | antd **沒有**錯誤總結這個東西。本頁是自己在 `onFinishFailed` 收集 `errorFields`、再加上後端回的「對不到任何欄位」的錯誤，自己畫一個 `<Alert>`。約 25 行。 |
| 停用狀態 | **內建** | `<Form disabled>` 會往下傳給所有欄位。 |
| 唯讀狀態 | **做不到** | ⚠ antd Form **沒有 `readOnly`**。本頁是 `variant="borderless"` ＋ 每個欄位手動傳 `readOnly` / `inputReadOnly` / `open={false}` 拼出來的。跟 `disabled` 是**兩套完全不同的邏輯**，每加一個欄位型別就要再處理一次。 |
| 分區塊的長表單 | **內建**（但只是視覺） | 用 `<Divider titlePlacement="start">` 分段。antd 沒有「表單區塊」的概念，分段純粹是排版，**不能整區折疊、不能整區驗證、不能整區停用**。 |
| 未儲存變更防護 | **做不到** | antd 沒有。本頁是 `onValuesChange` 記 dirty ＋ `beforeunload` 監聽。**只能擋關分頁／重新整理**；要擋路由跳轉得靠 router（本輪沒做路由）。約 12 行。 |
| 欄位之間的連動 | **內建**（但要自己清值） | `Form.useWatch('channel')` 拿到通路，再算出倉庫選項。⚠ **通路改了之後 antd 不會自動清掉已選但已失效的倉庫**，要自己 `form.setFieldValue(undefined)`，否則會送出一個不合法的組合。 |
| 動態欄位列（商品明細） | **內建** | `Form.List`，`add` / `remove` 都給了。 |
| 捲到第一個錯誤 | **內建** | `scrollToFirstError`。 |

## Select

| 項目 | 判定 | 說明 |
| --- | --- | --- |
| 單選 | **內建** | |
| 多選 | **內建** | `mode="multiple"`；`maxTagCount="responsive"` 會自動收成「+N」，量測邏輯 antd 包好了。 |
| 分組選項 | **內建** | `options` 裡放 `{ label, options }`，不用額外元件。 |
| 標籤模式（可自由輸入） | **內建** | `mode="tags"`＋`tokenSeparators`。 |
| 大量選項（1,200 筆） | **內建** | rc-virtual-list 是 Select 的**預設行為，不用設定**。實測捲動順暢、DOM 只留可視項。這點比 Table 好（Table 的 `virtual` 要自己開）。 |
| 自訂選項呈現（編號＋名稱＋規格） | **內建** | `optionRender` 換選項列、`labelRender` 換選完後輸入框裡的樣子。⚠ **是兩個分開的 prop，只傳一個會出現「下拉裡很漂亮、選完變一坨」**。 |
| **遠端搜尋** | **要寫 CSS／自己寫**（半內建） | antd 只給三個鉤子：`onSearch`、`loading`、`notFoundContent`。**以下全部要自己寫**：<br>· debounce（antd 沒有）<br>· **競態處理** —— 打字快時舊的回應會蓋掉新的，要自己記 sequence 丟棄過期回應<br>· 「還沒查」vs「查詢中」vs「查無結果」三種狀態的區分（`notFoundContent` 只有一個插槽，要自己依狀態換內容）<br>本頁這一個 Select 就花了約 30 行。**五種模式裡每個遠端搜尋欄位都要重寫一次，除非自己包一個 `<RemoteSelect>`。** |
| 下拉浮層外觀 | **要寫 CSS** | 沒有 token 控制圓角以外的東西，而且浮層在 `<body>` 底下（見第一段 #10）。 |

## DatePicker

| 項目 | 判定 | 說明 |
| --- | --- | --- |
| 單日 | **內建** | |
| 日期區間 | **內建** | `RangePicker` 是獨立元件。 |
| 含時間 | **內建** | `showTime`。 |
| 區間＋含時間 | **內建** | |
| 停用特定日期 | **內建**（樣式要寫 CSS） | `disabledDate` 回傳 `true` 就停用。⚠ **停用格子的樣式沒有獨立 token**，要跟一般格子區分得寫 CSS。 |
| 快捷選項（今天／本週／本月） | **內建** | `presets`。RangePicker 上會出現在面板左側。 |
| 面板外觀 | **要寫 CSS** | 同 Select，浮層在 `<body>` 底下。 |
| 日曆圖示替換（單日） | **內建** | `ConfigProvider.datePicker.suffixIcon`，全域一次換。 |
| 日曆圖示替換（**區間**） | **做不到**（全域層面） | ⚠ `RangePickerConfig` **只有 `variant` 和 `separator`，沒有 `suffixIcon` / `clearIcon`**。區間選擇器的日曆圖示**不能全域換**，只能逐個 `<RangePicker>` 傳 prop。 |
| 面板上下月／上下年箭頭 | **內建**（但要逐個傳） | `prevIcon` / `nextIcon` / `superPrevIcon` / `superNextIcon` 是**每個 instance 的 prop**，沒有 ConfigProvider 設定。 |

---

## zh-TW 語系檢查（獨立一段）

三個語系都在頁面上實測過，DatePicker 卡片右上角可以切。
結論先講：**antd 的 `zh_TW` 大部分是真的重寫過的台灣用語，不是簡轉繁；
但 `DatePicker.lang` 這一區塊有明顯的簡體殘留。**

### ✅ 確實是為台灣改過的

| 項目 | zh-TW | zh-CN | 判定 |
| --- | --- | --- | --- |
| **一週從星期幾開始** | **星期日**（實測 2026-09-16 那週的起點是 2026-09-13） | 星期一 | ✅ 符合台灣習慣，而且**跟 zh-CN 不同**，代表有特別處理 |
| 日期格式（dayjs `L`） | `2026/09/16` | `2026/09/16` | ✅ 台灣慣用 `YYYY/MM/DD` |
| 長日期（`LLL`） | `2026年9月16日 00:00`（24 小時制） | `2026年9月16日凌晨12点00分` | ✅ 台灣不會寫「凌晨12点」 |
| `Table.filterReset` | **重設** | 重置 | ✅ 真的換過詞 |
| `Table.selectAll` | **選取目前頁面** | 全选当页 | ✅ 整句重寫 |
| `Table.triggerAsc` | **點擊以遞增排序** | 点击升序 | ✅ 用「遞增／遞減」而非「升序／降序」，是台灣用語 |
| `Empty.description` | **暫無資料** | 暂无数据 | ✅ 「資料」不是「數據」 |
| `DatePicker.weekPlaceholder` | 請選擇**週** | 请选择周 | ✅ |

### ❌ 簡體中文直接轉繁體的殘留

| 項目 | zh-TW 目前 | zh-CN | 問題 |
| --- | --- | --- | --- |
| `DatePicker.lang.now` | **此刻** | 此刻 | ⚠ **一字未改**。台灣 UI 慣用「**現在**」，「此刻」是中國用法。這個字會出現在 `showTime` 的面板按鈕上。 |
| `DatePicker.lang.previousDecade` | **上一年代** | 上一年代 | ⚠ **一字未改**。「年代」在台灣指歷史年代（如 80 年代），不是「十年一頁」。應該是「**上十年**」。`nextDecade` 同。 |
| `DatePicker.lang.today` | 今天 | 今天 | 一字未改。「今天」可以接受，但台灣的正式 UI 更常用「**今日**」。**低優先**。 |

### ⚠ zh-TW 內部自己不一致

| 位置 | 字串 | 問題 |
| --- | --- | --- |
| `DatePicker.lang.ok` | `"確 定"` | **中間有一個空格** |
| `Table.filterConfirm` | `"確定"` | 沒有空格 |

同一份語系檔裡，日期面板的確定鈕和表格篩選的確定鈕**字面上就不一樣**。
（這是 antd 的 `autoInsertSpace` 習慣外洩到語系檔裡，zh-CN 的 `ok` 是 `"确定"`，沒有空格。）

### 實務建議

`zh_TW` 可以當底，但**上線前至少要覆寫 `DatePicker.lang` 的 `now`、`previousDecade`、
`nextDecade`、`ok` 四個字串**。antd 允許把 locale 物件展開後改掉再傳給 `ConfigProvider`，
成本很低（約 10 行），但沒人改的話這四個字會一直在畫面上。

---

# 還沒測到的

- Form 的 `Form.Item` 錯誤動畫改寫（第一段「改不動」的第 1 項，時間盒內沒做）
- `ConfigProvider.wave`（波紋效果）—— 已知還留著 AntD 痕跡，沒處理
- Radio 的圓點（跟勾選框同類，CSS-only，本頁沒有 Radio 所以沒做）
- 深色模式（`theme.algorithm: darkAlgorithm`）
- Cascader、TreeSelect、Upload、Transfer
- ProTable 搜尋列在深度客製層的外觀（本輪只處理了表格本體與浮層）
- 五種模式中的 Detail / Command / Workspace
