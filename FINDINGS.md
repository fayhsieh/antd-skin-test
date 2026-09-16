# AntD 表格換膚評估結果

測試環境：antd `6.6.2`＋`@ant-design/pro-components@3.1.14-7`（beta）＋React 19＋Vite 6。
所有結論都是在本 repo 的頁面上實際點過、用 devtools 量過才寫的，沒有實測的地方會標「未實測」。

分類定義：

| 標記 | 意思 |
| --- | --- |
| **內建** | antd / ProTable 直接支援，設定一下就有 |
| **調 token** | 靠主題 token 就能達成 |
| **要寫 CSS** | token 推不動，需要覆寫樣式（或自己接第三方套件）才能達成 |
| **做不到** | 需要自己寫元件或找替代方案 |

---

## 0. 先講最重要的三個結論

1. **ProComponents 支援 antd 6 的版本目前只有 beta。**
   `@ant-design/pro-components` 的 `latest` 是 `2.8.10`，peerDependencies 是 `antd: ^4.24.15 || ^5.11.2` —— 不支援 antd 6。
   支援 antd 6 的是 `beta` tag 的 `3.1.14-7`（`peerDependencies.antd: ^6.0.0`）。
   也就是說：**要用 antd 6 + ProTable，今天只有 beta 這條路。** 細節見 README。

2. **antd 6 預設就輸出 CSS 變數，這對換膚是好消息。**
   表格的根節點帶 `ant-table-css-var`，實際量到 `--ant-table-header-bg`、`--ant-table-row-hover-bg`、
   `--ant-table-cell-padding-block-md`、`--ant-table-border-color`、`--ant-color-primary` 等變數。
   代表「token 推不動」的東西，很多可以退一步用「覆寫 CSS 變數」處理，不必寫選擇器去打 antd 的樣式，
   而且 devtools 裡能直接看到哪個變數在管哪裡。這比 antd 5 的 cssinjs-only 好調很多。

3. **狀態（載入中／空／無結果／錯誤／無權限）antd 只給你兩個半。**
   載入中是內建、空資料是內建，其餘三個 antd 完全沒有概念，都得自己塞進 `locale.emptyText`。
   而且塞進去的東西會跟著表格的橫向捲動寬度走，不會置中在可視區（見 §4）。

---

## 1. 交互項目

| 項目 | 原生 Table | ProTable | 判定 | 備註 |
| --- | --- | --- | --- | --- |
| 點欄位標題排序 | `sorter` 一行搞定 | 同左 | **內建** | 兩邊行為一致。排序中的欄位底色吃 `Table.bodySortBg`、表頭底色吃 `headerSortActiveBg`，都是 token。 |
| 欄位篩選：狀態多選 | `filters` + `onFilter` | 同左，另可用 `valueEnum` 一份定義同時餵表格、篩選選單、搜尋表單 | **內建** | ProTable 少寫一半設定。 |
| 欄位篩選：日期區間 | **要自己畫 `filterDropdown`** | 搜尋列 `valueType: 'dateRange'` 直接有 | 原生＝**做不到**（內建層面）／ProTable＝**內建** | antd 內建的 `filters` 只有「勾選清單」一種形態，沒有區間 UI。原生版本這裡寫了 ~30 行自訂面板。 |
| 欄位篩選：金額範圍 | **要自己畫 `filterDropdown`** | 搜尋列 `valueType: 'digitRange'` 直接有 | 同上 | 同上，原生版本自己接了兩個 `InputNumber`。 |
| 上方搜尋列 | **沒有這個東西** | `search` prop，由 columns 的 `valueType` 自動長出整張表單，含展開／收起、重設、查詢 | 原生＝**做不到**／ProTable＝**內建** | 這是原生 vs ProTable 差最多的一項。 |
| 勾選單列 | `rowSelection` | 同左 | **內建** | 選取列底色＝`Table.rowSelectedBg` / `rowSelectedHoverBg`，是 token。 |
| 全選 | 表頭勾選框＝**只選目前這一頁**（已實測：20,000 筆、每頁 10 筆，按表頭勾選框只得到「已選 10 筆」） | 同左 | **內建（但語意要注意）** | 要跨頁全選得掛 `Table.SELECTION_ALL` 到表頭旁的下拉（本頁已掛）。設計上要先講清楚「全選」是全選哪個範圍。 |
| 批次操作列（已選 N 筆＋按鈕） | **沒有內建**，本頁是自己用 `<Alert>` 手刻一條 | `tableAlertRender` + `tableAlertOptionRender` 內建，給 `rowSelection` 就自動出現 | 原生＝**做不到**／ProTable＝**內建** | 手刻的成本其實不高（約 20 行），但位置、間距、關閉行為都要自己定。 |
| 每列最右操作欄（檢視／編輯／更多） | 自己 `render` | 自己 `render`（`valueType: 'option'` 會幫你處理間距與 link 樣式） | **內建** | 兩邊都要自己寫內容，差別只在 ProTable 幫你排版。 |
| 欄位顯示切換 | **沒有內建** | `options.setting` 內建，且支援拖曳排序、釘選左／右、重設、`columnsState` 持久化到 localStorage | 原生＝**做不到**／ProTable＝**內建** | 已實測：ProTable 的「列展示」浮層可勾選、可拖曳、可固定左右，全部可用。原生要做等於自己寫一個 Dropdown＋Checkbox 清單＋自行過濾 columns。 |
| 欄寬拖曳 | 需要 **`react-resizable`**（本 repo 已裝 `4.0.2`）＋`components.header.cell` 換掉 `<th>`＋自己存寬度 state＋自己寫把手的 CSS | **未接**：ProTable 會自行接管 `components`，要外掛得另外處理 | **要寫 CSS** | 已實測可用：拖曳把 `訂單編號` 從 160px 拉到 240px，表頭與內容寬度同步。成本＝一個 30 行的 `ResizableTitle.tsx`＋約 20 行 CSS（`.react-resizable-handle` 完全沒有預設樣式，把手是隱形的，要自己畫）。`react-resizable@4.0.2` 依賴 `react-draggable@4.4.6`，但它有傳 `nodeRef`，所以**沒有踩到 React 19 移除 `findDOMNode` 的雷**。 |
| 密度切換 | `size` prop 有（`large`/`middle`/`small`），但**沒有切換 UI**，本頁的 Segmented 是手刻的 | `options.density` 內建，有現成下拉 | 原生＝**要寫 CSS**（其實是「要自己做 UI」）／ProTable＝**內建** | 三段密度的實際列高由 `Table.cellPaddingBlock*` 決定，是 token。量到 middle 的列高是 41px（`padding: 8px 12px`）。 |
| 固定表頭 | `sticky` | 同左（透傳） | **內建** | 需搭 `scroll.y`。 |
| 固定左右欄 | `column.fixed: 'left' / 'right'` | 同左 | **內建** | 陰影是 antd 自己畫的，顏色**沒有對應 token**，要改得寫 CSS（見 §3）。 |
| 展開列 | `expandable.expandedRowRender` | 同左 | **內建**（但虛擬捲動下失效，見下） | 展開列背景＝`Table.rowExpandedBg`，是 token。 |
| 分頁 | `pagination` | 同左 | **內建** | |
| 20,000 筆捲動 | 見 §2 | 見 §2 | — | |

---

## 2. 20,000 筆的實測

| 組合 | 結果 |
| --- | --- |
| 20,000 筆 ＋ 分頁（每頁 20） | 完全沒感覺。DOM 只有當頁 20 列，總節點數 ~1,270。這是正常用法。 |
| 20,000 筆 ＋ **關掉分頁** ＋ 沒開虛擬捲動 | **等同當掉。** 實測分頁鎖死超過 90 秒仍無回應，只能重新整理。antd 會老實把 20,000 個 `<tr>` 全丟進 DOM。頁面上已加警語，但警語是在渲染後才出現，來不及救。 |
| 20,000 筆 ＋ **虛擬捲動**（`virtual`） | 好用。DOM 只留 12～20 列、總節點數 ~1,160，捲動順暢。**不需要額外套件**，antd Table 自己就有 `virtual` prop。 |
| ProTable ＋ 虛擬捲動 | 也可以。`virtual` 不是 ProTable 自己的 prop，是透傳到底層 antd Table，實測同樣只渲染 12 列。 |

### 虛擬捲動的三個坑（都實測過）

1. **必須給 `scroll.y`，而且每一欄都要有固定 `width`。** 這是文件有寫的。
2. **`scroll.x` 必須把「勾選欄」和「展開欄」的寬度也算進去。**
   一開始 `scroll.x` 只加總了有定義的欄位寬度，結果虛擬模式下勾選欄與展開欄被壓成 **1px**（量到 `width: 1`），
   checkbox 和展開箭頭整個爛掉。非虛擬模式不會有這個問題。
   修法是在 `scroll.x` 上補 `48 + (展開列 ? 48 : 0)`，補完量到兩欄都回到 48px。
   → 這是「開虛擬捲動要付的隱藏成本」，不是 bug，但沒人會第一次就想到。
3. **虛擬模式下「展開列」直接失效。**
   已實測：點展開箭頭沒有任何反應，`ant-table-expanded-row` 數量恆為 0，圖示維持 collapsed。
   關掉 `virtual` 後同一顆按鈕立刻正常展開。
   → **「20,000 筆流暢捲動」和「展開列」目前二選一。** 這個要先跟設計講。

---

## 3. 「要寫 CSS」與「做不到」—— 卡在哪裡

這節是這次評估的重點。

### 3-1. 狀態標籤的顏色，只有三個跟著 token 走 —— **調 token（部分）／要寫 CSS（其餘）**

實測把主題從 Ant 預設切到我們的 token，量 `.ant-tag` 的 computed style：

| 狀態 | `<Tag color>` | Ant 預設 | 我們的 token | 有沒有跟著走 |
| --- | --- | --- | --- | --- |
| 已完成 | `success` | `#52c41a` | `#2ba471` | ✅ 跟 `colorSuccess` |
| 暫停 | `warning` | `#faad14` | `#e37318` | ✅ 跟 `colorWarning` |
| 異常 | `error` | `#ff4d4f` | `#d54941` | ✅ 跟 `colorError` |
| 已確認 | `blue` | `rgb(9,88,217)` | `rgb(9,88,217)` | ❌ 完全沒動 |
| 備貨中 | `cyan` | `rgb(8,151,156)` | `rgb(8,151,156)` | ❌ 完全沒動 |
| 已出貨 | `geekblue` | — | — | ❌ 同上 |
| 退貨中 | `volcano` | — | — | ❌ 同上 |

**卡點：** antd 的 preset 色（blue / cyan / geekblue / volcano / purple…）是一組寫死的色盤，
不是從 seed token 推導出來的，`ConfigProvider` 的 token 動不了它們。
我們有 9 種訂單狀態，但 token 只管得到 success / warning / error 三種。

**要做什麼：** 剩下 6 種狀態得自己給值 —— 不是寫 CSS，是在 columns 裡直接指定
`<Tag color="#xxxxxx">`（或 `color` + `bordered` + 自訂 class）。
也就是說「狀態色」這件事會從 token 系統裡漏出來，變成一份要自己維護的對照表。
建議：直接在 `tokens.ts` 旁邊開一份 `statusColors` 對照表，不要假裝它在 token 裡。

另外一個順帶發現：`success`/`warning`/`error` 的**背景色**是 antd 從主色推出來的，
我們的 `colorSuccess: #2ba471` 推出來的底色是 `rgb(213,227,219)`（偏灰綠、有點濁），
比 antd 預設的 `#f6ffed` 難看。底色不吃單獨的 token，要改只能覆寫 CSS 變數。

### 3-2. 固定欄的陰影 —— **要寫 CSS**

固定左右欄時 antd 會畫一道陰影（`ant-table-ping-left` / `ant-table-ping-right` 相關樣式）。
**這道陰影沒有對應的 Table component token**（Table 的 token 清單裡沒有任何 shadow 欄位）。
想改粗細、顏色、要不要改成一條實線，只能覆寫 CSS。

### 3-3. 長文字截斷只有「單行」—— **要寫 CSS**

`ellipsis: { showTitle: true }` 給的是單行 `text-overflow: ellipsis` ＋ `title` 原生提示。
資料裡刻意放了「新北市政府教育局學前教育科幼兒園設備採購案」這種超長客戶名稱，
實際就是硬切在一行，游標停上去才看得到全文。

**卡點：** antd 沒有多行截斷（2 行後省略）的選項，也沒有 token 可調。
要做 `-webkit-line-clamp` 就得寫 CSS，而且一旦多行，`cellPaddingBlock` 算出來的列高就不準了，
固定表頭 / 虛擬捲動（需要等高列）會跟著出問題。

### 3-4. 斑馬紋 —— **要寫 CSS**

antd Table 沒有 `striped` 這種 prop，也沒有「奇偶列底色」的 token。
要做只能用 `rowClassName={(_, i) => i % 2 ? 'odd' : ''}` 再自己寫 `.odd td { background: … }`，
而且要記得處理 hover / selected / fixed column 的疊加順序（固定欄的背景是另外畫的，會露餡）。

### 3-5. 表頭高度不能獨立於儲存格 —— **要寫 CSS**

Table 的 token 只有 `cellPaddingBlock*` 一組，表頭和內容共用。
想要「表頭 36px、內容 48px」這種常見設計，token 做不到，得寫 CSS 針對 `thead th` 覆寫。

### 3-6. 表頭欄位分隔線只有在 `bordered={false}` 時看得到 —— **行為要知道**

`headerSplitColor` 這個 token 只作用在非 bordered 模式的表頭短分隔線；
一旦 `bordered`，格線就整個交給 `borderColor`。兩者不能同時獨立控制。

### 3-7. 錯誤 / 無權限 —— **做不到**

見 §4。

### 3-8. 原生 Table 的「工具列」整條不存在 —— **做不到**

原生 Table 只有一張表格，沒有標題列、沒有右上角按鈕區、沒有重新整理、沒有欄位顯示、沒有密度切換。
本頁的原生版工具列（寬鬆／中等／緊湊、欄位顯示、重新整理）是手刻的 HTML，
其中「欄位顯示」和「重新整理」直接做成 disabled 並標註，讓差異看得見。

---

## 4. 六種狀態

| 狀態 | antd 給了什麼 | 判定 | 備註 |
| --- | --- | --- | --- |
| 載入中 | `loading` prop：一層 `Spin` 蓋住整個表格容器，表頭還在、資料半透明 | **內建** | ProTable 行為相同（只是透傳）。 |
| 空資料 | 不傳 `locale.emptyText` 就是預設 `<Empty />`（灰色插畫＋「暫無資料」） | **內建** | 頁面上這一格完全沒動過，看到的就是原廠長相。 |
| 搜尋無結果 | **什麼都沒有。跟「空資料」長得一模一樣。** | **做不到** | antd 不區分這兩種。頁面上看到的「找不到符合『SO-2026999999』的訂單＋清除搜尋條件」是我們自己傳 `locale.emptyText` 做出來的。ProTable 也沒有。要做就得自己判斷「有沒有下過條件」再決定塞哪一個 emptyText。 |
| 錯誤 | **完全沒有錯誤狀態。** | **做不到** | 頁面上的 500 畫面是把 `<Result status="500">` 塞進 `locale.emptyText`。ProTable 的 `request` reject 時預設也只是變成空資料（只多觸發一次 `onRequestError`），不會自己畫錯誤畫面。 |
| 無權限 | **連概念都沒有。** | **做不到** | 頁面上是自己塞 `<Result status="403">`。實務上通常會在表格外層就攔掉，不讓表格渲染。 |
| 大量資料 | `virtual` | **內建** | 見 §2。 |

### 塞 Result 進 emptyText 的副作用（實測）

把 `<Result>` 放進 `locale.emptyText` 之後，它是被放在**表格的捲動容器內**，
所以它會跟著 `scroll.x`（本頁約 1,700px）撐開，而不是置中在可視區域。
視窗比表格窄的時候，403 / 500 的插圖會被擠到左邊、要橫向捲才看得到全部。

→ 結論：**錯誤與無權限不要塞進表格裡。** 正確做法是在表格外層做狀態切換，
表格根本不要渲染。這點在頁面上照實呈現了，方便直接看到它有多不對。

---

## 5. Table 元件層 token 實測有效清單

以下都在 `src/tokens.ts` 的 `tableComponentTokens`，已量到 computed style 確實生效：

| token | 影響 | 實測 |
| --- | --- | --- |
| `headerBg` | 表頭背景 | `#f2f5f9` → `thead th` 的 `background-color` 確實變了 ✅ |
| `headerColor` | 表頭文字 | `#1c2430` ✅ |
| `borderColor` | 列分隔線 | `#e8ecf2` → `td` 的 `border-bottom: 1px solid rgb(232,236,242)` ✅ |
| `cellPaddingBlockMD` / `cellPaddingInlineMD` | middle 的儲存格內距 | `8px 12px`，列高量到 41px ✅ |
| `rowHoverBg` | 列 hover | CSS 變數 `--ant-table-row-hover-bg: #f5f8ff` ✅ |
| `rowSelectedBg` / `rowSelectedHoverBg` | 選取列 | ✅ |
| `rowExpandedBg` | 展開列背景 | ✅ |
| `headerSortActiveBg` / `bodySortBg` | 排序中的表頭與整欄底色 | ✅ |
| `selectionColumnWidth` | 勾選欄寬 | ✅（虛擬模式另見 §2-2） |
| `footerBg` / `footerColor` | 表格 footer | 本頁沒用 footer，未實測 |
| `stickyScrollBarBg` | sticky 假捲軸 | 未實測 |

全域 token 中，對表格影響最大的是 `colorBorderSecondary`（列分隔線的來源）、
`colorFillAlter`（表頭底色的來源，會被 `headerBg` 蓋掉）、`fontSize`ｘ`lineHeight`（列高）。

---

## 6. 原生 Table vs ProTable 差異總結

| 面向 | 結論 |
| --- | --- |
| 排序、篩選（勾選清單）、固定欄、固定表頭、展開列、分頁、虛擬捲動 | **完全一樣**，ProTable 只是把 props 透傳下去 |
| 搜尋列、欄位顯示切換、密度切換、全螢幕、重新整理、批次操作列、工具列 | **ProTable 全部內建，原生全部要手刻** |
| 區間篩選（日期、金額） | ProTable 用 `valueType` 一行，原生要自己畫 `filterDropdown` |
| 欄位定義 | ProTable 的 `valueEnum` 一份定義同時餵「表格顯示」「篩選選單」「搜尋表單」，原生要寫三次 |
| 空值處理 | ProTable 有 `columnEmptyText`（預設 `-`），原生留白 |
| 欄寬拖曳 | 兩邊都沒有。原生可以外掛 `react-resizable`；ProTable 因為自己接管 `components`，外掛要另外處理 |
| 換膚 | **兩邊吃的是同一組 antd token**，ProTable 沒有另一套主題系統。上面 §5 的結論兩邊通用 |
| 風險 | ProTable 目前只有 beta 支援 antd 6（見 README） |

### ProComponents 3.x beta 的 API 變動（踩到的）

- `hideInSearch` **已被移除**，改用 `search: false`。舊教學和 2.x 的程式碼直接搬過來會編譯失敗。
  （這也表示：如果之後要從 2.x 升上來，columns 定義要逐欄檢查。）

---

## 7. 還沒測到的

誠實列出來，避免被當成結論：

- 可編輯表格（`editable`）
- 拖曳排序列（`DragSortTable`）
- 樹狀資料 / 多層表頭
- 深色模式（`theme.algorithm: darkAlgorithm`）
- RTL
- `footerBg` / `stickyScrollBarBg` 兩個 token
- ProTable `request` 模式（本頁一律用 `dataSource` 走本地資料，好跟原生版本比較）
