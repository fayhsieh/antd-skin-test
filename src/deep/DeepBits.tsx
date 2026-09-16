/**
 * 深度客製第二層機制：把 antd 的「長相」用自訂 render 換掉。
 * 這裡每一個東西都對應 FINDINGS-2.md 第一段的一列。
 */
import { Button, Tooltip } from 'antd';
import type { PaginationProps } from 'antd';
import { DeepIcon } from './icons';
import { STATUS_META, type OrderStatus } from '../data';

/* ───────────────────────────────────────────────────────────────
 * 1. 狀態標籤：不用 <Tag>，整個自己畫
 *    形狀＝方角＋左側 3px 色條，底色＝同色系極淡，不用 antd preset
 * ─────────────────────────────────────────────────────────────── */

/** 九種狀態的色，自己定，跟 antd preset 無關 */
const CHIP: Record<OrderStatus, string> = {
  pending: '#8c8c8c',
  confirmed: '#4277cf',
  picking: '#27b7bb',
  shipped: '#2f6bff',
  completed: '#008d71',
  onhold: '#f38b18',
  exception: '#e34949',
  cancelled: '#bfbfbf',
  returning: '#a154c9',
};

export function StatusChip({ status }: { status: OrderStatus }) {
  const c = CHIP[status];
  return (
    <span className="deep-chip" style={{ '--chip': c } as React.CSSProperties}>
      <i />
      {STATUS_META[status].text}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
 * 2. 操作欄：藍色文字連結 → 圖示按鈕
 * ─────────────────────────────────────────────────────────────── */
export function DeepRowActions() {
  return (
    <span className="deep-actions">
      <Tooltip title="檢視">
        <button type="button" aria-label="檢視">
          <DeepIcon.view />
        </button>
      </Tooltip>
      <Tooltip title="編輯">
        <button type="button" aria-label="編輯">
          <DeepIcon.edit />
        </button>
      </Tooltip>
      <Tooltip title="更多">
        <button type="button" aria-label="更多">
          <DeepIcon.more />
        </button>
      </Tooltip>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
 * 3. 空狀態：不用 antd 的插畫
 * ─────────────────────────────────────────────────────────────── */
export function DeepEmpty({ text = '沒有資料' }: { text?: string }) {
  return (
    <div className="deep-empty">
      <DeepIcon.empty />
      <p>{text}</p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
 * 4. 排序指示：antd 預設是右側上下兩個小三角。
 *    改成「單一箭頭，放在標題文字左邊」。
 *    機制＝column.sortIcon（逐欄傳，沒有全域設定）
 * ─────────────────────────────────────────────────────────────── */
export function deepSortIcon({ sortOrder }: { sortOrder: 'ascend' | 'descend' | null }) {
  return (
    <span className={`deep-sort ${sortOrder ? 'on' : ''}`}>
      {sortOrder === 'ascend' ? (
        <DeepIcon.sortAsc />
      ) : sortOrder === 'descend' ? (
        <DeepIcon.sortDesc />
      ) : (
        <DeepIcon.sortNone />
      )}
    </span>
  );
}

/** 篩選入口：漏斗 → 滑桿圖示，機制＝column.filterIcon（一樣逐欄傳） */
export function deepFilterIcon(filtered: boolean) {
  return (
    <span className={`deep-filter ${filtered ? 'on' : ''}`}>
      <DeepIcon.filter />
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
 * 5. 分頁列：itemRender 換掉頁碼與箭頭，showTotal 換掉文字，
 *    排列順序用 CSS order 調（見 deep.css）
 * ─────────────────────────────────────────────────────────────── */
export const deepPaginationProps: Partial<PaginationProps> = {
  itemRender: (page, type, el) => {
    if (type === 'prev') return <span className="deep-pg-arrow"><DeepIcon.chevronLeft /></span>;
    if (type === 'next') return <span className="deep-pg-arrow"><DeepIcon.chevronRight /></span>;
    if (type === 'jump-prev') return <span className="deep-pg-jump"><DeepIcon.jumpPrev /></span>;
    if (type === 'jump-next') return <span className="deep-pg-jump"><DeepIcon.jumpNext /></span>;
    if (type === 'page') return <span className="deep-pg-page">{page}</span>;
    return el;
  },
  showTotal: (t, r) => (
    <span className="deep-pg-total">
      <b>{r[0]}</b>–<b>{r[1]}</b> / {t.toLocaleString('zh-TW')}
    </span>
  ),
  showQuickJumper: false,
};

/* ───────────────────────────────────────────────────────────────
 * 6. 批次操作列用的按鈕（深度版）
 * ─────────────────────────────────────────────────────────────── */
export function deepBatchButtons(onClear: () => void) {
  return [
    <button key="export" type="button" className="deep-btn">匯出選取</button>,
    <button key="print" type="button" className="deep-btn">批次列印</button>,
    <button key="cancel" type="button" className="deep-btn danger">批次取消</button>,
    <Button key="clear" type="link" size="small" onClick={onClear}>
      取消選取
    </Button>,
  ];
}
