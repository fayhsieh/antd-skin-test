/**
 * ============================================================================
 *  設計 Token —— 這個檔案就是整個換膚評估的旋鈕面板
 * ============================================================================
 *  值請直接改這裡，頁面上切到「我們的 token」就會套用。
 *  分成三塊：
 *    1. globalTokens          全域 token（影響所有 antd 元件）
 *    2. tableComponentTokens  Table 元件層 token ← 這一組對表格外觀影響最大
 *    3. ourTheme              組起來丟給 ConfigProvider 的最終物件
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 * 1. 全域 token（theme.token）
 * ------------------------------------------------------------------------ */
export const globalTokens = {
  // ── 顏色 ──────────────────────────────────────────────────────────────
  /** 主色。影響：連結、選取列底色的來源、Checkbox/Radio 選中、主按鈕、排序箭頭啟用色、分頁目前頁 */
  colorPrimary: '#2f6bff',
  /** 主要邊框色。影響：Input/Select 外框、表格 bordered 模式的格線 */
  colorBorder: '#d5dae2',
  /** 次要邊框色。影響：表格「列與列之間的分隔線」、表頭下緣線 ← 表格最常看到的那條線 */
  colorBorderSecondary: '#e8ecf2',
  /** 容器背景。影響：表格本體底色、Card 底色、頁面上的白底區塊 */
  colorBgContainer: '#ffffff',
  /** 浮層背景。影響：篩選下拉、Dropdown、Tooltip 之外的浮層、日期面板 */
  colorBgElevated: '#ffffff',
  /** 填充-更淺。影響：表頭預設背景（headerBg 未覆寫時就是它）、排序中欄位的底色來源 */
  colorFillAlter: '#f5f7fa',

  /** 主要文字。影響：儲存格文字、表頭文字 */
  colorText: '#1c2430',
  /** 次要文字。影響：表格 footer、部分說明文字、ProTable 工具列圖示 */
  colorTextSecondary: '#5a6676',
  /** 第三階文字。影響：空資料提示文字、placeholder、排序箭頭未啟用色 */
  colorTextTertiary: '#8d98a8',
  /** 停用文字。影響：停用按鈕、停用選項 */
  colorTextDisabled: '#b4bcc8',

  /** 成功色。影響：success 類 Tag/Badge/Alert、Result success */
  colorSuccess: '#2ba471',
  /** 警告色。影響：warning 類 Tag/Badge/Alert */
  colorWarning: '#e37318',
  /** 錯誤色。影響：error 類 Tag/Badge/Alert、Result 403/500 圖示、表單錯誤 */
  colorError: '#d54941',

  // ── 密度 ──────────────────────────────────────────────────────────────
  /** 控制項高度。影響：Button/Input/Select 高度，連帶影響表頭上方工具列的高度 */
  controlHeight: 32,
  /** 小尺寸控制項高度。影響：size="small" 的按鈕與輸入框、ProTable 密度=緊湊時的工具列 */
  controlHeightSM: 24,
  /** 基準內距。影響：Card 內距、Modal 內距；表格儲存格內距另由 Table token 控制 */
  padding: 16,
  /** 小內距。影響：小尺寸元件內距、分頁項目間距 */
  paddingSM: 12,
  /** 極小內距。影響：Tag 內距、表頭篩選圖示周邊留白 */
  paddingXS: 8,
  /** 基準外距。影響：區塊之間的距離、表格與分頁之間的距離 */
  margin: 16,
  /** 極小外距。影響：Space 預設間距、圖示與文字間距 */
  marginXS: 8,

  // ── 字 ────────────────────────────────────────────────────────────────
  /** 基準字級。影響：儲存格文字、表頭文字（Table cellFontSize 未覆寫時） */
  fontSize: 14,
  /** 小字級。影響：size="small" 的表格文字、輔助說明 */
  fontSizeSM: 12,
  /** H5 字級。影響：ProTable 的 headerTitle、Card title */
  fontSizeHeading5: 16,
  /** 行高。影響：儲存格實際列高（列高 ≈ fontSize × lineHeight + cellPaddingBlock × 2） */
  lineHeight: 1.5714285714285714,

  // ── 形狀 ──────────────────────────────────────────────────────────────
  /** 基準圓角。影響：Button/Input/Card 圓角、表格外框圓角 */
  borderRadius: 6,
  /** 小圓角。影響：Tag 圓角、小尺寸控制項 */
  borderRadiusSM: 4,
  /** 線寬。影響：所有邊框粗細，包含表格格線（只能是 1 或 2，給 0 會讓格線整個消失） */
  lineWidth: 1,
};

/* ---------------------------------------------------------------------------
 * 2. Table 元件層 token（theme.components.Table）★ 這一組最重要 ★
 * ------------------------------------------------------------------------
 *  這些是 antd Table 唯一「不用寫 CSS 就推得動」的東西。
 *  推不動的部分寫在 FINDINGS.md。
 * ------------------------------------------------------------------------ */
export const tableComponentTokens = {
  // ── 表頭 ──────────────────────────────────────────────────────────────
  /** 表頭背景色 */
  headerBg: '#f2f5f9',
  /** 表頭文字色 */
  headerColor: '#1c2430',
  /** 表頭欄與欄之間那條短分隔線的顏色（只有 bordered=false 時看得到） */
  headerSplitColor: '#dfe5ed',
  /** 表頭圓角（左上右上角） */
  headerBorderRadius: 6,
  /** 表頭被排序時的背景色 */
  headerSortActiveBg: '#e6ecf6',
  /** 表頭被排序且滑鼠移上去時的背景色 */
  headerSortHoverBg: '#dde5f2',
  /** 固定表頭（sticky）時，排序中表頭的背景色 */
  fixedHeaderSortActiveBg: '#e6ecf6',
  /** 表頭篩選漏斗圖示 hover 時的背景色 */
  headerFilterHoverBg: 'rgba(0, 0, 0, 0.06)',

  // ── 列狀態底色 ────────────────────────────────────────────────────────
  /** 列 hover 底色 ← 最常被設計師點名要改的一個 */
  rowHoverBg: '#f5f8ff',
  /** 列被勾選時的底色 */
  rowSelectedBg: '#e9f0ff',
  /** 列被勾選且 hover 時的底色 */
  rowSelectedHoverBg: '#dde8ff',
  /** 展開列（expandedRowRender 內容）的背景色 */
  rowExpandedBg: '#fafbfd',
  /** 正在排序的那一整欄，儲存格的底色 */
  bodySortBg: '#fafbfd',

  // ── 儲存格內距（＝列高的主要來源）────────────────────────────────────
  /** 儲存格上下內距（size="large"／預設大尺寸） */
  cellPaddingBlock: 12,
  /** 儲存格左右內距（size="large"／預設大尺寸） */
  cellPaddingInline: 16,
  /** 儲存格上下內距（size="middle"） */
  cellPaddingBlockMD: 8,
  /** 儲存格左右內距（size="middle"） */
  cellPaddingInlineMD: 12,
  /** 儲存格上下內距（size="small"） */
  cellPaddingBlockSM: 6,
  /** 儲存格左右內距（size="small"） */
  cellPaddingInlineSM: 8,

  // ── 儲存格字級 ────────────────────────────────────────────────────────
  /** 儲存格字級（大尺寸） */
  cellFontSize: 14,
  /** 儲存格字級（middle） */
  cellFontSizeMD: 14,
  /** 儲存格字級（small） */
  cellFontSizeSM: 13,

  // ── 邊框 ──────────────────────────────────────────────────────────────
  /** 表格格線顏色（列分隔線、bordered 模式的直線都吃這個） */
  borderColor: '#e8ecf2',

  // ── 其他 ──────────────────────────────────────────────────────────────
  /** 勾選欄的寬度 */
  selectionColumnWidth: 40,
  /** 展開箭頭按鈕的背景色 */
  expandIconBg: '#ffffff',
  /** 表格 footer 背景色 */
  footerBg: '#f5f7fa',
  /** 表格 footer 文字色 */
  footerColor: '#5a6676',
  /** 篩選下拉浮層背景色 */
  filterDropdownBg: '#ffffff',
  /** 篩選下拉選單項目背景色 */
  filterDropdownMenuBg: '#ffffff',
  /** sticky 模式下那條假捲軸的顏色 */
  stickyScrollBarBg: 'rgba(0, 0, 0, 0.25)',
  /** sticky 模式下那條假捲軸的圓角 */
  stickyScrollBarBorderRadius: 100,
};

/* ---------------------------------------------------------------------------
 * 3. 其他元件的元件層 token
 * ------------------------------------------------------------------------
 *  只放表格頁面真的會看到的幾個，避免這個檔案失焦。
 * ------------------------------------------------------------------------ */
export const otherComponentTokens = {
  /** 狀態標籤：表格裡每一列都有，所以拉出來 */
  Tag: {
    /** 標籤字級 */
    fontSize: 12,
    /** 標籤行高（等同高度） */
    lineHeight: 1.6666666666666667,
    /** 標籤預設背景（無 color 時） */
    defaultBg: '#f2f5f9',
    /** 標籤預設文字色 */
    defaultColor: '#5a6676',
  },
  /** 分頁：跟表格綁在一起 */
  Pagination: {
    itemSize: 32,
    itemActiveBg: '#2f6bff',
  },
  /** 空資料圖示區的文字色 */
  Empty: {},
};

/* ---------------------------------------------------------------------------
 * 4. 組成最終 ConfigProvider theme
 * ------------------------------------------------------------------------ */
export const ourTheme = {
  token: globalTokens,
  components: {
    Table: tableComponentTokens,
    ...otherComponentTokens,
  },
};

/** 「Ant 預設值」= 完全不傳 theme，讓 antd 用原廠 seed token */
export const antdDefaultTheme = {};
