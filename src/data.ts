/**
 * 假資料產生器。刻意不接 API，資料一次算好放記憶體。
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picking'
  | 'shipped'
  | 'completed'
  | 'onhold'
  | 'exception'
  | 'cancelled'
  | 'returning';

/** 狀態 → 顯示文字 + Tag 顏色。顏色用 antd preset，方便看「不調任何東西」時長什麼樣 */
export const STATUS_META: Record<
  OrderStatus,
  { text: string; color: string }
> = {
  pending: { text: '待處理', color: 'default' },
  confirmed: { text: '已確認', color: 'blue' },
  picking: { text: '備貨中', color: 'cyan' },
  shipped: { text: '已出貨', color: 'geekblue' },
  completed: { text: '已完成', color: 'success' },
  onhold: { text: '暫停', color: 'warning' },
  exception: { text: '異常', color: 'error' },
  cancelled: { text: '已取消', color: 'default' },
  returning: { text: '退貨中', color: 'volcano' },
};

export const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'picking',
  'shipped',
  'completed',
  'onhold',
  'exception',
  'cancelled',
  'returning',
];

export const CHANNELS = [
  'momo購物網',
  'PChome 24h',
  'Shopee 蝦皮',
  '官網直營',
  'LINE 購物',
  'Yahoo 奇摩',
  '媽媽經社團團購',
];

export const WAREHOUSES = [
  '台北內湖倉',
  '桃園蘆竹倉',
  '台中大里倉',
  '台南永康倉',
  '高雄前鎮倉',
  '桃園保稅倉（跨境）',
];

const CARRIERS = ['SF', 'TCAT', 'HCT', 'PLX', 'KTJ'];

/** 短、中、長、超長都給一點，重點是看截斷 */
const CUSTOMER_NAMES = [
  '陳怡君',
  '林大文',
  '王小明',
  '張美玲',
  '黃冠宇',
  '吳佩珊',
  '蔡宗翰',
  '鄭雅婷',
  '許家豪',
  '劉品妤',
  '台灣積體電路製造股份有限公司採購二部',
  '財團法人工業技術研究院材料與化工研究所',
  '新北市政府教育局學前教育科幼兒園設備採購案',
  '好食在生鮮食品有限公司（原：好食在農產運銷合作社）',
  '香港商蝦皮娛樂電商有限公司台灣分公司物流部門',
  '高雄市立聯合醫院醫療器材暨衛材集中採購小組',
  'ABC',
  '林',
  'Jonathan Alexander Montgomery-Fitzgerald III',
];

/** 決定性偽亂數，換資料量時同一筆資料不會亂跳 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface OrderRow {
  key: string;
  /** 訂單編號 */
  orderNo: string;
  /** 通路 */
  channel: string;
  /** 客戶名稱 */
  customer: string;
  /** 狀態 */
  status: OrderStatus;
  /** 金額（新台幣，整數） */
  amount: number;
  /** 商品項數 */
  itemCount: number;
  /** 倉庫 */
  warehouse: string;
  /** 建立時間 ISO 字串 */
  createdAt: string;
  /** 預計出貨日 ISO 字串（yyyy-mm-dd） */
  shipBy: string;
  /** 物流單號；未出貨的給空字串，順便看 antd 對空值怎麼處理 */
  trackingNo: string;
  /** 展開列要看的備註 */
  note: string;
}

const BASE = Date.UTC(2026, 0, 1);

function makeRow(i: number): OrderRow {
  const rnd = mulberry32(i * 2654435761 + 7);
  const status = STATUS_ORDER[Math.floor(rnd() * STATUS_ORDER.length)];
  const createdMs = BASE + Math.floor(rnd() * 250) * 86400000 + Math.floor(rnd() * 86400000);
  const created = new Date(createdMs);
  const ship = new Date(createdMs + (1 + Math.floor(rnd() * 12)) * 86400000);
  const shipped = status === 'shipped' || status === 'completed' || status === 'returning';
  return {
    key: String(i),
    orderNo: `SO-2026${String(1000000 + i).slice(1)}`,
    channel: CHANNELS[Math.floor(rnd() * CHANNELS.length)],
    customer: CUSTOMER_NAMES[Math.floor(rnd() * CUSTOMER_NAMES.length)],
    status,
    amount: Math.floor(rnd() * 480000) + 120,
    itemCount: Math.floor(rnd() * 48) + 1,
    warehouse: WAREHOUSES[Math.floor(rnd() * WAREHOUSES.length)],
    createdAt: created.toISOString(),
    shipBy: ship.toISOString().slice(0, 10),
    trackingNo: shipped
      ? `${CARRIERS[Math.floor(rnd() * CARRIERS.length)]}${String(900000000 + i * 37).slice(0, 10)}`
      : '',
    note:
      rnd() > 0.5
        ? '客戶指定假日不收件，出貨前請先電話確認；此訂單包含冷藏品，需與常溫品分批出貨。'
        : '無特殊備註。',
  };
}

const cache = new Map<number, OrderRow[]>();

/** 取得 n 筆假訂單（有快取，切換資料量不會每次重算 20000 筆） */
export function getOrders(n: number): OrderRow[] {
  const hit = cache.get(n);
  if (hit) return hit;
  const rows = Array.from({ length: n }, (_, i) => makeRow(i));
  cache.set(n, rows);
  return rows;
}
