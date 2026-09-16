import { useState } from 'react';
import {
  Button,
  DatePicker,
  Dropdown,
  InputNumber,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ProColumns } from '@ant-design/pro-components';
import { StatusChip, DeepRowActions, deepSortIcon, deepFilterIcon } from './deep/DeepBits';
import {
  CHANNELS,
  STATUS_META,
  STATUS_ORDER,
  WAREHOUSES,
  type OrderRow,
} from './data';

const { Text } = Typography;

/** 狀態標籤。顏色一律用 antd preset color，不自己調色 —— 要看的就是 antd 原本的樣子 */
export function StatusTag({ status }: { status: OrderRow['status'] }) {
  const meta = STATUS_META[status];
  return <Tag color={meta.color}>{meta.text}</Tag>;
}

const twd = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
});

export function renderAmount(v: number) {
  return <Text style={{ fontVariantNumeric: 'tabular-nums' }}>{twd.format(v)}</Text>;
}

/** 每列最右邊的操作欄 */
export function RowActions() {
  return (
    <Space size={4}>
      <Button type="link" size="small" style={{ paddingInline: 0 }}>
        檢視
      </Button>
      <Button type="link" size="small" style={{ paddingInline: 0 }}>
        編輯
      </Button>
      <Dropdown
        menu={{
          items: [
            { key: 'copy', label: '複製訂單編號' },
            { key: 'print', label: '列印出貨單' },
            { type: 'divider' as const },
            { key: 'cancel', label: '取消訂單', danger: true },
          ],
        }}
      >
        <Button type="text" size="small" icon={<EllipsisOutlined />} />
      </Dropdown>
    </Space>
  );
}

/* ---------------------------------------------------------------------------
 * 原生 Table 用的自訂 filterDropdown：金額範圍
 * antd 內建 filters 只有「多選清單」一種，範圍篩選必須自己畫面板。
 * ------------------------------------------------------------------------ */
function AmountFilterDropdown(props: any) {
  const { setSelectedKeys, selectedKeys, confirm, clearFilters } = props;
  const cur = (selectedKeys[0] as [number | null, number | null]) ?? [null, null];
  const [min, setMin] = useState<number | null>(cur[0]);
  const [max, setMax] = useState<number | null>(cur[1]);
  return (
    <div style={{ padding: 8 }}>
      <Space>
        <InputNumber placeholder="最低" value={min} onChange={setMin} style={{ width: 110 }} />
        <span>~</span>
        <InputNumber placeholder="最高" value={max} onChange={setMax} style={{ width: 110 }} />
      </Space>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          type="link"
          onClick={() => {
            setMin(null);
            setMax(null);
            clearFilters?.();
            confirm();
          }}
        >
          重設
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setSelectedKeys(min == null && max == null ? [] : [[min, max] as any]);
            confirm();
          }}
        >
          篩選
        </Button>
      </div>
    </div>
  );
}

/** 原生 Table 用的自訂 filterDropdown：日期區間 */
function DateRangeFilterDropdown(props: any) {
  const { setSelectedKeys, selectedKeys, confirm, clearFilters } = props;
  const cur = (selectedKeys[0] as [string, string]) ?? null;
  return (
    <div style={{ padding: 8 }}>
      <DatePicker.RangePicker
        value={cur ? [dayjs(cur[0]), dayjs(cur[1])] : null}
        onChange={(v) =>
          setSelectedKeys(
            v && v[0] && v[1]
              ? [[v[0].format('YYYY-MM-DD'), v[1].format('YYYY-MM-DD')] as any]
              : [],
          )
        }
      />
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          type="link"
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
        >
          重設
        </Button>
        <Button size="small" type="primary" onClick={() => confirm()}>
          篩選
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 原生 antd Table 欄位
 * ------------------------------------------------------------------------ */
export function buildNativeColumns(opts: {
  fixedSides: boolean;
  /** 深度客製：換排序／篩選圖示、狀態標籤、操作欄 */
  deep: boolean;
}): TableColumnsType<OrderRow> {
  const { fixedSides, deep } = opts;
  // column.sortIcon / column.filterIcon 都只有「逐欄」這一種傳法，沒有全域設定
  const deepCol = deep
    ? { sortIcon: deepSortIcon as any, filterIcon: deepFilterIcon as any }
    : {};
  const cols: TableColumnsType<OrderRow> = [
    {
      title: '訂單編號',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      fixed: fixedSides ? 'left' : undefined,
      sorter: (a, b) => a.orderNo.localeCompare(b.orderNo),
      render: (v: string) => <a>{v}</a>,
    },
    {
      title: '通路',
      dataIndex: 'channel',
      key: 'channel',
      width: 140,
      // 多選篩選：antd 內建，filterSearch 讓選項多時可搜尋
      filters: CHANNELS.map((c) => ({ text: c, value: c })),
      filterSearch: true,
      onFilter: (value, r) => r.channel === value,
      ellipsis: true,
    },
    {
      title: '客戶名稱',
      dataIndex: 'customer',
      key: 'customer',
      width: 200,
      // ellipsis + showTitle：antd 只給「單行 CSS 截斷 + title 提示」，沒有多行截斷
      ellipsis: { showTitle: true },
      sorter: (a, b) => a.customer.localeCompare(b.customer, 'zh-Hant'),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      // 狀態用多選篩選
      filters: STATUS_ORDER.map((s) => ({ text: STATUS_META[s].text, value: s })),
      filterMode: 'menu',
      onFilter: (value, r) => r.status === value,
      render: (s: OrderRow['status']) =>
        deep ? <StatusChip status={s} /> : <StatusTag status={s} />,
    },
    {
      title: '金額',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      filterDropdown: (p: any) => <AmountFilterDropdown {...p} />,
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? undefined : 'inherit' }} />
      ),
      onFilter: (value, r) => {
        const [min, max] = value as unknown as [number | null, number | null];
        if (min != null && r.amount < min) return false;
        if (max != null && r.amount > max) return false;
        return true;
      },
      render: renderAmount,
    },
    {
      title: '商品項數',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.itemCount - b.itemCount,
    },
    {
      title: '倉庫',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 160,
      filters: WAREHOUSES.map((w) => ({ text: w, value: w })),
      onFilter: (value, r) => r.warehouse === value,
      ellipsis: true,
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend',
      filterDropdown: (p: any) => <DateRangeFilterDropdown {...p} />,
      onFilter: (value, r) => {
        const [from, to] = value as unknown as [string, string];
        const d = r.createdAt.slice(0, 10);
        return d >= from && d <= to;
      },
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '預計出貨日',
      dataIndex: 'shipBy',
      key: 'shipBy',
      width: 130,
      sorter: (a, b) => a.shipBy.localeCompare(b.shipBy),
    },
    {
      title: '物流單號',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      width: 150,
      // 空值時原生 Table 就是留白，什麼都不給
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: fixedSides ? 'right' : undefined,
      render: () => (deep ? <DeepRowActions /> : <RowActions />),
    },
  ];
  // sortIcon / filterIcon 只能逐欄掛，所以最後統一 map 一次
  return cols.map((c) => ({ ...c, ...deepCol }));
}

/* ---------------------------------------------------------------------------
 * ProTable 欄位
 * 差別：多了 valueType / valueEnum / search，欄位定義同時驅動「上方搜尋表單」
 * ------------------------------------------------------------------------ */
export function buildProColumns(opts: {
  fixedSides: boolean;
  deep: boolean;
}): ProColumns<OrderRow>[] {
  const { fixedSides, deep } = opts;
  const deepCol = deep
    ? { sortIcon: deepSortIcon as any, filterIcon: deepFilterIcon as any }
    : {};
  const cols: ProColumns<OrderRow>[] = [
    {
      title: '訂單編號',
      dataIndex: 'orderNo',
      width: 160,
      fixed: fixedSides ? 'left' : undefined,
      sorter: (a, b) => a.orderNo.localeCompare(b.orderNo),
      copyable: true,
    },
    {
      title: '通路',
      dataIndex: 'channel',
      width: 140,
      ellipsis: true,
      valueType: 'select',
      fieldProps: { mode: 'multiple', allowClear: true },
      valueEnum: Object.fromEntries(CHANNELS.map((c) => [c, { text: c }])),
      filters: CHANNELS.map((c) => ({ text: c, value: c })),
      onFilter: (value, r) => r.channel === value,
    },
    {
      title: '客戶名稱',
      dataIndex: 'customer',
      width: 200,
      ellipsis: { showTitle: true },
      sorter: (a, b) => a.customer.localeCompare(b.customer, 'zh-Hant'),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      width: 110,
      // valueEnum 同時產生：表格內的標籤、篩選選單、搜尋表單的下拉
      valueType: 'select',
      fieldProps: { mode: 'multiple', allowClear: true },
      valueEnum: Object.fromEntries(
        STATUS_ORDER.map((s) => [s, { text: STATUS_META[s].text }]),
      ),
      filters: STATUS_ORDER.map((s) => ({ text: STATUS_META[s].text, value: s })),
      onFilter: (value, r) => r.status === value,
      render: (_, r) =>
        deep ? <StatusChip status={r.status} /> : <StatusTag status={r.status} />,
    },
    {
      title: '金額',
      dataIndex: 'amount',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      // ProTable 內建的數字區間搜尋
      valueType: 'digitRange',
      render: (_, r) => renderAmount(r.amount),
    },
    {
      title: '商品項數',
      dataIndex: 'itemCount',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.itemCount - b.itemCount,
      valueType: 'digit',
      search: false, // 注意：ProComponents 3.x beta 已移除 hideInSearch，改用 search: false
    },
    {
      title: '倉庫',
      dataIndex: 'warehouse',
      width: 160,
      ellipsis: true,
      valueType: 'select',
      valueEnum: Object.fromEntries(WAREHOUSES.map((w) => [w, { text: w }])),
      filters: WAREHOUSES.map((w) => ({ text: w, value: w })),
      onFilter: (value, r) => r.warehouse === value,
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      width: 170,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend',
      // ProTable 內建的日期區間搜尋
      valueType: 'dateRange',
      render: (_, r) => dayjs(r.createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '預計出貨日',
      dataIndex: 'shipBy',
      width: 130,
      valueType: 'date',
      search: false, // 注意：ProComponents 3.x beta 已移除 hideInSearch，改用 search: false
      sorter: (a, b) => a.shipBy.localeCompare(b.shipBy),
    },
    {
      title: '物流單號',
      dataIndex: 'trackingNo',
      width: 150,
      search: false, // 注意：ProComponents 3.x beta 已移除 hideInSearch，改用 search: false
      // ProTable 空值會自動顯示 columnEmptyText（預設 "-"），原生 Table 不會
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: fixedSides ? 'right' : undefined,
      valueType: 'option',
      render: () => (deep ? <DeepRowActions /> : <RowActions />),
    },
  ];
  return cols.map((c) => ({ ...c, ...deepCol }));
}
