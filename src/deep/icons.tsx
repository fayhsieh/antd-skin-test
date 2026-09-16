/**
 * 深度客製用的 icon 組。整組換成 Lucide（lucide-react 1.46.0），
 * 目的不是選 icon，是量「把 AntD 的 icon 全部換掉要動幾個地方」。
 *
 * 分三類（結論寫在 FINDINGS-2.md）：
 *   A. ConfigProvider 一次換掉        —— select / datePicker / spin / empty / table.expandable
 *   B. 只能逐個元件、逐欄傳 prop      —— 排序箭頭、篩選漏斗、分頁箭頭
 *   C. 沒有 API，只能用 CSS 蓋        —— 勾選框的勾、Radio 的點
 */
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
  Eye,
  Inbox,
  LoaderCircle,
  Minus,
  PencilLine,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react';

/** Lucide 預設 stroke 是 2，對 12–16px 的表格 icon 太粗，統一調細 */
const base = { size: 14, strokeWidth: 1.75, absoluteStrokeWidth: false } as const;

export const DeepIcon = {
  sortNone: (p?: { color?: string }) => <ArrowUpDown {...base} size={12} {...p} />,
  sortAsc: (p?: { color?: string }) => <ArrowUp {...base} size={12} {...p} />,
  sortDesc: (p?: { color?: string }) => <ArrowDown {...base} size={12} {...p} />,
  filter: () => <SlidersHorizontal {...base} size={13} />,
  expand: () => <Plus {...base} size={13} />,
  collapse: () => <Minus {...base} size={13} />,
  chevronDown: () => <ChevronDown {...base} />,
  chevronLeft: () => <ChevronLeft {...base} />,
  chevronRight: () => <ChevronRight {...base} />,
  jumpPrev: () => <ChevronsLeft {...base} />,
  jumpNext: () => <ChevronsRight {...base} />,
  calendar: () => <CalendarDays {...base} />,
  clear: () => <X {...base} size={12} />,
  loading: () => <LoaderCircle {...base} size={16} className="deep-spin" />,
  empty: () => <Inbox strokeWidth={1.25} size={40} />,
  view: () => <Eye {...base} />,
  edit: () => <PencilLine {...base} />,
  more: () => <Ellipsis {...base} />,
};
