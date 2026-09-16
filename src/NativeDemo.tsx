import { useMemo, useState } from 'react';
import { Alert, Button, Segmented, Space, Table, Tooltip, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { ColumnHeightOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { buildNativeColumns } from './columns';
import type { OrderRow } from './data';
import {
  batchButtons,
  dataForState,
  emptyTextForState,
  expandedRowRender,
  type DemoState,
  type ViewOpts,
} from './shared';
import { ResizableTitle } from './ResizableTitle';
import { deepBatchButtons, deepPaginationProps } from './deep/DeepBits';
import type { SkinKind } from './theme2';

export function NativeDemo({
  rows,
  state,
  opts,
  skin,
  onSizeChange,
  onResetState,
}: {
  rows: OrderRow[];
  state: DemoState;
  opts: ViewOpts;
  skin: SkinKind;
  onSizeChange: (s: ViewOpts['size']) => void;
  onResetState: () => void;
}) {
  const deep = skin === 'deep';
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 欄寬拖曳：拖出來的寬度只能自己存 state，antd 不管
  const [widthOverride, setWidthOverride] = useState<Record<string, number>>({});

  const baseColumns = useMemo(
    () => buildNativeColumns({ fixedSides: opts.fixedSides, deep }),
    [opts.fixedSides, deep],
  );

  const columns = useMemo<TableColumnsType<OrderRow>>(() => {
    const withWidth = baseColumns.map((c) => {
      const key = String((c as any).key ?? (c as any).dataIndex);
      return widthOverride[key] ? { ...c, width: widthOverride[key] } : c;
    });
    if (!opts.resizable) return withWidth;
    return withWidth.map((c) => {
      const key = String((c as any).key ?? (c as any).dataIndex);
      return {
        ...c,
        onHeaderCell: (col: any) => ({
          width: col.width,
          onResize: (_e: unknown, { size }: { size: { width: number } }) => {
            setWidthOverride((prev) => ({ ...prev, [key]: size.width }));
          },
        }),
      };
    }) as TableColumnsType<OrderRow>;
  }, [baseColumns, opts.resizable, widthOverride]);

  const data = dataForState(rows, state);
  const emptyText = emptyTextForState(state, onResetState, deep);

  // virtual 模式下 scroll.x 必須把「勾選欄」和「展開欄」的寬度也算進去，
  // 否則 antd 會把這兩欄壓成 1px（非虛擬模式不會）。
  const totalWidth =
    columns.reduce((s, c) => s + (Number((c as any).width) || 120), 0) +
    (opts.expandable ? 48 : 0) +
    48;

  return (
    <div>
      {/* 工具列：原生 Table 完全沒有工具列，這整條是手刻的 */}
      <div className="toolbar">
        <Typography.Title level={5} style={{ margin: 0 }}>
          訂單列表（原生 antd Table）
        </Typography.Title>
        <Space size={8}>
          <Tooltip title="原生 Table 沒有密度切換 UI，但有 size prop，所以這個 Segmented 是手刻接上去的">
            <Segmented
              size="small"
              value={opts.size}
              onChange={(v) => onSizeChange(v as ViewOpts['size'])}
              options={[
                { label: '寬鬆', value: 'large', icon: <ColumnHeightOutlined /> },
                { label: '中等', value: 'middle' },
                { label: '緊湊', value: 'small' },
              ]}
            />
          </Tooltip>
          <Tooltip title="原生 Table 沒有欄位顯示切換，要自己做一個 Dropdown + Checkbox 清單並自行過濾 columns">
            <Button size="small" icon={<SettingOutlined />} disabled>
              欄位顯示（原生無）
            </Button>
          </Tooltip>
          <Tooltip title="原生 Table 沒有重新整理按鈕">
            <Button size="small" icon={<ReloadOutlined />} disabled />
          </Tooltip>
        </Space>
      </div>

      {/* 批次操作列：原生 Table 沒有內建，這條 Alert 是手刻的 */}
      {selectedRowKeys.length > 0 && deep && (
        <div className="deep-batchbar">
          <span>
            已選 <strong>{selectedRowKeys.length}</strong> 筆
          </span>
          {deepBatchButtons(() => setSelectedRowKeys([]))}
        </div>
      )}
      {selectedRowKeys.length > 0 && !deep && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          title={
            <Space wrap>
              <span>
                已選 <strong>{selectedRowKeys.length}</strong> 筆
              </span>
              {batchButtons(() => setSelectedRowKeys([]))}
            </Space>
          }
        />
      )}

      <Table<OrderRow>
        rowKey="key"
        columns={columns}
        dataSource={data}
        loading={state === 'loading'}
        size={opts.size}
        bordered={opts.bordered}
        sticky={opts.sticky ? { offsetHeader: 0 } : false}
        virtual={opts.virtual}
        scroll={{ x: totalWidth, y: opts.virtual || opts.sticky ? 520 : undefined }}
        components={opts.resizable ? { header: { cell: ResizableTitle } } : undefined}
        locale={emptyText ? { emptyText } : undefined}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          // 全選只會選到「目前這一頁」，跨頁全選要自己做
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        }}
        expandable={
          opts.expandable
            ? { expandedRowRender, rowExpandable: () => true }
            : undefined
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
    </div>
  );
}
