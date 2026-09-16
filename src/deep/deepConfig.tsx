/**
 * 深度客製第一層機制：ConfigProvider 的「元件層設定」。
 *
 * antd 6 的 ConfigProvider 有 ConfigComponentProps，可以一次把某些元件的 icon 換掉，
 * 不用逐個元件傳 prop。這是換 icon 成本最低的一條路。
 *
 * 實測「能用這條路換掉的」只有下面這幾個。換不掉的請看 icons.tsx 的分類 B / C。
 */
import type { ConfigProviderProps } from 'antd';
import { DeepIcon } from './icons';
import { DeepEmpty } from './DeepBits';

export const deepComponentConfig: Partial<ConfigProviderProps> = {
  // A 類：ConfigProvider 一次換掉 ────────────────────────────────
  select: {
    suffixIcon: <DeepIcon.chevronDown />,
    clearIcon: <DeepIcon.clear />,
    removeIcon: <DeepIcon.clear />,
    // menuItemSelectedIcon 吃 RenderNode，傳 ReactNode 也可以
    menuItemSelectedIcon: <span className="deep-select-check" />,
  },
  datePicker: {
    suffixIcon: <DeepIcon.calendar />,
    clearIcon: <DeepIcon.clear />,
  },
  // ⚠ RangePickerConfig 只有 variant / separator，「沒有」suffixIcon、clearIcon。
  //   區間選擇器的日曆圖示換不掉 → 只能逐個 <DatePicker.RangePicker> 傳 prop。
  rangePicker: {
    separator: <span className="deep-range-sep">→</span>,
  },
  treeSelect: {
    switcherIcon: <DeepIcon.chevronDown />,
  },
  spin: {
    indicator: <DeepIcon.loading />,
  },
  empty: {
    image: <DeepIcon.empty />,
  },
  table: {
    expandable: {
      expandIcon: ({ expanded, onExpand, record, expandable }) =>
        expandable ? (
          <button
            type="button"
            className="deep-expand-btn"
            aria-label={expanded ? '收合' : '展開'}
            onClick={(e) => onExpand(record, e)}
          >
            {expanded ? <DeepIcon.collapse /> : <DeepIcon.expand />}
          </button>
        ) : null,
    },
  },
  // Empty 的整塊內容（不只圖）還是得逐處理 renderEmpty
  renderEmpty: () => <DeepEmpty />,
};
