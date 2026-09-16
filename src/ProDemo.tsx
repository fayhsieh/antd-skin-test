import { useMemo, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable, type ActionType } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { buildProColumns } from './columns';
import type { OrderRow } from './data';
import {
  batchButtons,
  dataForState,
  emptyTextForState,
  expandedRowRender,
  type DemoState,
  type ViewOpts,
} from './shared';
import { deepBatchButtons, deepPaginationProps } from './deep/DeepBits';
import type { SkinKind } from './theme2';

/** 把 ProTable 搜尋表單吐出來的 params 轉成本地過濾 */
function applySearch(rows: OrderRow[], params: Record<string, any>): OrderRow[] {
  const { status, channel, warehouse, amount, createdAt, orderNo, customer } = params;
  return rows.filter((r) => {
    if (status?.length && !status.includes(r.status)) return false;
    if (channel?.length && !channel.includes(r.channel)) return false;
    if (warehouse && r.warehouse !== warehouse) return false;
    if (orderNo && !r.orderNo.toLowerCase().includes(String(orderNo).toLowerCase()))
      return false;
    if (customer && !r.customer.includes(String(customer))) return false;
    if (Array.isArray(amount) && (amount[0] != null || amount[1] != null)) {
      if (amount[0] != null && r.amount < amount[0]) return false;
      if (amount[1] != null && r.amount > amount[1]) return false;
    }
    if (Array.isArray(createdAt) && createdAt[0] && createdAt[1]) {
      const d = dayjs(r.createdAt);
      if (d.isBefore(dayjs(createdAt[0]).startOf('day'))) return false;
      if (d.isAfter(dayjs(createdAt[1]).endOf('day'))) return false;
    }
    return true;
  });
}

export function ProDemo({
  rows,
  state,
  opts,
  skin,
  onResetState,
}: {
  rows: OrderRow[];
  state: DemoState;
  opts: ViewOpts;
  skin: SkinKind;
  onResetState: () => void;
}) {
  const deep = skin === 'deep';
  const actionRef = useRef<ActionType>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  const columns = useMemo(
    () => buildProColumns({ fixedSides: opts.fixedSides, deep }),
    [opts.fixedSides, deep],
  );

  const base = dataForState(rows, state);
  const data = useMemo(() => applySearch(base, searchParams), [base, searchParams]);
  const emptyText = emptyTextForState(state, onResetState, deep);

  // 同 NativeDemo：virtual 模式下要把勾選欄／展開欄的寬度算進 scroll.x
  const totalWidth =
    columns.reduce((s, c) => s + (Number(c.width) || 120), 0) +
    (opts.expandable ? 48 : 0) +
    48;

  return (
    <ProTable<OrderRow>
      actionRef={actionRef}
      rowKey="key"
      columns={columns}
      dataSource={data}
      loading={state === 'loading'}
      headerTitle="訂單列表（ProTable）"
      bordered={opts.bordered}
      sticky={opts.sticky ? { offsetHeader: 0 } : false}
      // virtual 不是 ProTable 自己的 prop，是透傳到底層 antd Table
      virtual={opts.virtual}
      scroll={{ x: totalWidth, y: opts.virtual || opts.sticky ? 520 : undefined }}
      defaultSize={opts.size}
      locale={emptyText ? { emptyText } : undefined}
      // 上方搜尋列：ProTable 內建，由 columns 的 valueType 自動長出來
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
        searchText: '查詢',
        resetText: '重設',
      }}
      onSubmit={(params) => setSearchParams(params as Record<string, any>)}
      onReset={() => setSearchParams({})}
      // 工具列右側按鈕：密度、欄位顯示、全螢幕、重新整理都是內建
      options={{
        density: true,
        fullScreen: true,
        reload: true,
        setting: { draggable: true, checkable: true },
      }}
      // 欄位顯示狀態（可受控、可持久化）
      columnsState={{ persistenceKey: 'antd-skin-test-cols', persistenceType: 'localStorage' }}
      toolBarRender={() => [
        <Button key="new" type="primary" icon={<PlusOutlined />}>
          新增訂單
        </Button>,
      ]}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
      }}
      // 批次操作列：ProTable 內建，只要給 rowSelection 就會出現
      tableAlertRender={({ selectedRowKeys: keys }) => (
        <span>
          已選 <strong>{keys.length}</strong> 筆
        </span>
      )}
      tableAlertOptionRender={() => (
        <Space>
          {(deep ? deepBatchButtons : batchButtons)(() => setSelectedRowKeys([]))}
        </Space>
      )}
      expandable={
        opts.expandable ? { expandedRowRender, rowExpandable: () => true } : undefined
      }
      pagination={
        opts.pagination && !opts.virtual
          ? {
              showSizeChanger: true,
              showQuickJumper: true,
              defaultPageSize: 20,
              showTotal: (t, r) => `第 ${r[0]}-${r[1]} 筆，共 ${t} 筆`,
              ...(deep ? deepPaginationProps : {}),
            }
          : false
      }
    />
  );
}
