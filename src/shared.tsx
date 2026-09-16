import { Button, Empty, Result, Typography } from 'antd';
import { DeepEmpty } from './deep/DeepBits';
import type { OrderRow } from './data';
import dayjs from 'dayjs';

export type DemoState =
  | 'normal'
  | 'loading'
  | 'empty'
  | 'noResult'
  | 'error'
  | 'forbidden';

export type ComponentKind = 'native' | 'pro';

export interface ViewOpts {
  /** 虛擬捲動（antd Table 內建 virtual，需搭 scroll.y 且每欄要有 width） */
  virtual: boolean;
  /** 固定左右欄 */
  fixedSides: boolean;
  /** 固定表頭（sticky） */
  sticky: boolean;
  /** 展開列 */
  expandable: boolean;
  /** 欄寬拖曳（只有原生版本有，靠 react-resizable） */
  resizable: boolean;
  /** 密度 */
  size: 'large' | 'middle' | 'small';
  /** 分頁；虛擬捲動時會被強制關掉 */
  pagination: boolean;
  /** 外框線 */
  bordered: boolean;
}

/** 搜尋無結果時，畫面上假裝使用者打了這個關鍵字 */
export const FAKE_KEYWORD = 'SO-2026999999';

/**
 * 六種狀態下要餵給表格的資料。
 * loading / error / forbidden 都是「沒有資料可以畫」，差別在提示長什麼樣。
 */
export function dataForState(rows: OrderRow[], state: DemoState): OrderRow[] {
  switch (state) {
    case 'normal':
      return rows;
    case 'loading':
      return [];
    case 'empty':
    case 'noResult':
    case 'error':
    case 'forbidden':
      return [];
  }
}

/**
 * 每個狀態要顯示的 emptyText。
 * - empty  ：完全不傳，讓 antd 用它的預設 <Empty />
 * - noResult：antd 沒有「搜尋無結果」這個狀態，預設跟空資料一模一樣，
 *             這裡是我們自己傳 locale.emptyText 才做出差異
 * - error / forbidden：antd Table 完全沒有這兩個狀態，只能自己塞 Result 進去
 */
export function emptyTextForState(
  state: DemoState,
  onReset: () => void,
  /** 深度客製：連空狀態的插畫一起換掉 */
  deep = false,
): React.ReactNode | undefined {
  switch (state) {
    case 'empty':
      // 不傳 → antd 預設（深度層由 ConfigProvider.renderEmpty 接手）
      return undefined;
    case 'noResult':
      if (deep)
        return (
          <div>
            <DeepEmpty text={`找不到符合「${FAKE_KEYWORD}」的訂單`} />
            <div style={{ textAlign: 'center', paddingBottom: 24 }}>
              <button type="button" className="deep-btn" onClick={onReset}>
                清除搜尋條件
              </button>
            </div>
          </div>
        );
      return (
        <div style={{ padding: '32px 0' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                找不到符合「<Typography.Text code>{FAKE_KEYWORD}</Typography.Text>」的訂單
              </span>
            }
          >
            <Button size="small" onClick={onReset}>
              清除搜尋條件
            </Button>
          </Empty>
        </div>
      );
    case 'error':
      return (
        <Result
          status="500"
          title="載入訂單失敗"
          subTitle="伺服器回應 500，請稍後再試或聯絡系統管理員。"
          extra={
            <Button type="primary" onClick={onReset}>
              重新載入
            </Button>
          }
        />
      );
    case 'forbidden':
      return (
        <Result
          status="403"
          title="沒有權限檢視訂單"
          subTitle="你的帳號未被授予「訂單管理」權限，請向管理員申請。"
          extra={<Button onClick={onReset}>回到一般狀態</Button>}
        />
      );
    default:
      return undefined;
  }
}

/** 展開列內容。原生與 ProTable 共用 */
export function expandedRowRender(r: OrderRow) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div>
        <strong>備註：</strong>
        {r.note}
      </div>
      <div>
        <strong>建立時間：</strong>
        {dayjs(r.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        {'　'}
        <strong>倉庫：</strong>
        {r.warehouse}
        {'　'}
        <strong>物流單號：</strong>
        {r.trackingNo || '尚未產生'}
      </div>
    </div>
  );
}

/** 批次操作按鈕，兩邊共用 */
export function batchButtons(onClear: () => void) {
  return [
    <Button key="export" size="small">
      匯出選取
    </Button>,
    <Button key="print" size="small">
      批次列印出貨單
    </Button>,
    <Button key="cancel" size="small" danger>
      批次取消
    </Button>,
    <Button key="clear" size="small" type="link" onClick={onClear}>
      取消選取
    </Button>,
  ];
}
