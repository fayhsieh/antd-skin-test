/** 表單區用的假資料與假後端。一樣不接 API。 */
import { CHANNELS, WAREHOUSES } from '../data';

/** 通路 → 可用倉庫。用來示範欄位連動 */
export const WAREHOUSE_BY_CHANNEL: Record<string, string[]> = {
  'momo購物網': ['台北內湖倉', '桃園蘆竹倉', '台中大里倉'],
  'PChome 24h': ['桃園蘆竹倉', '台南永康倉'],
  'Shopee 蝦皮': ['台中大里倉', '高雄前鎮倉'],
  '官網直營': WAREHOUSES,
  'LINE 購物': ['台北內湖倉', '高雄前鎮倉'],
  'Yahoo 奇摩': ['桃園蘆竹倉', '台中大里倉', '台南永康倉'],
  '媽媽經社團團購': ['桃園保稅倉（跨境）'],
};

export const CHANNEL_OPTIONS = CHANNELS.map((c) => ({ label: c, value: c }));

/** 分組選項：用「通路類型」分組 */
export const GROUPED_CHANNELS = [
  {
    label: '電商平台',
    options: ['momo購物網', 'PChome 24h', 'Shopee 蝦皮', 'Yahoo 奇摩'].map((c) => ({
      label: c,
      value: c,
    })),
  },
  {
    label: '自有通路',
    options: ['官網直營', 'LINE 購物'].map((c) => ({ label: c, value: c })),
  },
  {
    label: '其他',
    options: ['媽媽經社團團購'].map((c) => ({ label: c, value: c })),
  },
];

export interface SkuOption {
  sku: string;
  name: string;
  spec: string;
}

const NOUNS = ['純棉床包', '羽絨被', '記憶枕', '收納箱', '保溫瓶', '除濕機', '空氣清淨機', '料理鍋'];
const SPECS = ['單人 3.5尺', '雙人 5尺', '加大 6尺', 'S 號', 'M 號', 'L 號', '600ml', '1.2L'];

/** 1,200 筆商品，用來測大量選項 */
export const SKU_OPTIONS: SkuOption[] = Array.from({ length: 1200 }, (_, i) => ({
  sku: `SKU-${String(100000 + i).slice(1)}`,
  name: `${NOUNS[i % NOUNS.length]} ${Math.floor(i / NOUNS.length) + 1} 代`,
  spec: SPECS[i % SPECS.length],
}));

/** 假的遠端搜尋：延遲 600ms，輸入 "zz" 會回空陣列 */
export function fakeRemoteSearch(keyword: string): Promise<SkuOption[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!keyword.trim()) return resolve([]);
      if (keyword.toLowerCase().includes('zz')) return resolve([]);
      resolve(
        SKU_OPTIONS.filter(
          (s) =>
            s.name.includes(keyword) ||
            s.sku.toLowerCase().includes(keyword.toLowerCase()) ||
            s.spec.includes(keyword),
        ).slice(0, 30),
      );
    }, 600);
  });
}

export interface ServerError {
  field: string[];
  messages: string[];
}

/**
 * 假的後端驗證。故意回兩種錯：
 *  - 欄位層級（對得上某個 Form.Item）
 *  - 表單層級（對不上任何欄位，只能放在總結裡）
 */
export function fakeSubmit(values: any): Promise<{
  ok: boolean;
  fieldErrors: ServerError[];
  formErrors: string[];
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fieldErrors: ServerError[] = [];
      const formErrors: string[] = [];

      if (values.orderNo && !/^SO-\d{10}$/.test(values.orderNo)) {
        fieldErrors.push({
          field: ['orderNo'],
          messages: ['訂單編號格式不符，應為 SO- 加 10 碼數字（後端規則）'],
        });
      }
      if (values.receiver?.phone && !/^09\d{8}$/.test(values.receiver.phone)) {
        fieldErrors.push({
          field: ['receiver', 'phone'],
          messages: ['手機號碼需為 09 開頭的 10 碼數字'],
        });
      }
      if (values.channel === '媽媽經社團團購') {
        formErrors.push('此通路本月配額已用完，請改用其他通路或聯絡業務窗口。');
      }
      if (!values.items?.length) {
        formErrors.push('訂單至少要有一筆商品明細。');
      }
      resolve({
        ok: fieldErrors.length === 0 && formErrors.length === 0,
        fieldErrors,
        formErrors,
      });
    }, 700);
  });
}
