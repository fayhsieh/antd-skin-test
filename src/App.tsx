import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Card,
  ConfigProvider,
  Divider,
  Segmented,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import zhTW from 'antd/locale/zh_TW';
import 'dayjs/locale/zh-tw';
import { getOrders } from './data';
import { SKIN_LABEL, themeFor, type SkinKind } from './theme2';
import { deepComponentConfig } from './deep/deepConfig';
import { NativeDemo } from './NativeDemo';
import { ProDemo } from './ProDemo';
import { FormsDemo } from './FormsDemo';
import type { ComponentKind, DemoState, ViewOpts } from './shared';
import './deep/deep.css';

const { Text, Title } = Typography;

/** 每個狀態的實話實說。⚠ 開頭的都是 antd 沒給、我們自己補的 */
const STATE_NOTES: Record<DemoState, { type: 'info' | 'warning'; msg: React.ReactNode }> = {
  normal: {
    type: 'info',
    msg: '正常狀態。表頭可排序、可篩選；勾選後上方會出現批次操作列。',
  },
  loading: {
    type: 'info',
    msg: 'antd Table 內建 loading：用一層 Spin 蓋住整個表格容器，表頭仍在。ProTable 行為相同（它只是把 loading 透傳下去）。這是「內建」。',
  },
  empty: {
    type: 'info',
    msg: '這是 antd 的原廠空資料：沒有傳任何 locale.emptyText，看到的就是預設 <Empty />（灰色插畫 + 「暫無資料」）。',
  },
  noResult: {
    type: 'warning',
    msg: '⚠ antd 沒有「搜尋無結果」這個狀態 —— 預設跟上面的「空資料」長得一模一樣。你現在看到的差異（顯示關鍵字 + 清除按鈕）是我們自己傳 locale.emptyText 做出來的，不是 antd 給的。ProTable 也一樣沒有。',
  },
  error: {
    type: 'warning',
    msg: '⚠ antd Table 沒有錯誤狀態。這個 500 畫面是把 <Result status="500"> 塞進 locale.emptyText。ProTable 的 request 失敗時預設也只是變成空資料（只會多觸發一次 onRequestError），不會自己畫錯誤畫面。',
  },
  forbidden: {
    type: 'warning',
    msg: '⚠ antd 完全沒有「無權限」狀態，連概念都沒有。這裡是自己塞 <Result status="403">。真的要做，通常會在表格外層就攔掉，不會讓表格渲染。',
  },
};

export default function App() {
  const [section, setSection] = useState<'table' | 'form'>('table');
  const [comp, setComp] = useState<ComponentKind>('native');
  const [skin, setSkin] = useState<SkinKind>('antd');
  const [count, setCount] = useState<50 | 20000>(50);
  const [state, setState] = useState<DemoState>('normal');

  const [opts, setOpts] = useState<ViewOpts>({
    virtual: false,
    fixedSides: true,
    sticky: true,
    expandable: true,
    resizable: false,
    size: 'middle',
    pagination: true,
    bordered: false,
  });

  const rows = useMemo(() => getOrders(count), [count]);
  const theme = themeFor(skin);
  const deep = skin === 'deep';
  const note = STATE_NOTES[state];

  // 浮層（Select 下拉、日期面板、Dropdown）走 portal 掛在 <body> 底下，
  // .page 的 scope 蓋不到，只能在 body 上掛 class。這是深度客製的固定成本之一。
  useEffect(() => {
    document.body.classList.toggle('deep-skin', deep);
    return () => document.body.classList.remove('deep-skin');
  }, [deep]);

  const set = <K extends keyof ViewOpts>(k: K, v: ViewOpts[K]) =>
    setOpts((p) => ({ ...p, [k]: v }));

  return (
    // key 讓切換主題時整棵樹重建，避免 cssinjs 快取讓差異看起來不夠明顯
    <ConfigProvider
      key={skin}
      locale={zhTW}
      theme={theme}
      {...(deep ? deepComponentConfig : {})}
    >
      <div className="page" data-skin={skin}>
        <Title level={4} style={{ marginTop: 0 }}>
          AntD 表格換膚評估
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 12 }}>
            antd 6.6.2 ・ @ant-design/pro-components 3.1.14-7 (beta)
          </Text>
        </Title>

        {/* ── 常駐列：區塊 ＋ 三層主題（兩個區塊共用）───────────────── */}
        <Card size="small" styles={{ body: { paddingBlock: 12 } }}>
          <Space size={24} wrap>
            <Space size={8}>
              <Text type="secondary">區塊</Text>
              <Segmented
                value={section}
                onChange={(v) => setSection(v as 'table' | 'form')}
                options={[
                  { label: '表格', value: 'table' },
                  { label: '表單／Select／DatePicker', value: 'form' },
                ]}
              />
            </Space>
            <Space size={8}>
              <Text type="secondary">主題</Text>
              <Segmented
                value={skin}
                onChange={(v) => setSkin(v as SkinKind)}
                options={(
                  ['antd', 'token', 'deep'] as SkinKind[]
                ).map((k) => ({ label: SKIN_LABEL[k], value: k }))}
              />
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {skin === 'antd' && '完全不傳 theme，這是 antd 原廠長相。'}
              {skin === 'token' &&
                '只套一份既有專案的 theme（借用的測試值，不是本產品的品牌色），沒有覆寫任何樣式。未定義的 token 一律留 antd 預設值。'}
              {skin === 'deep' &&
                '同一份 token ＋ ConfigProvider 元件層設定 ＋ 自訂 render ＋ CSS 覆寫。成本記在 FINDINGS-2.md。'}
            </Text>
          </Space>
        </Card>

        {section === 'form' && <FormsDemo skin={skin} />}

        {section === 'table' && (
        <>
        {/* ── 主控制列 ───────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { paddingBlock: 12 } }} style={{ marginTop: 12 }}>
          <Space size={24} wrap>
            <Space size={8}>
              <Text type="secondary">元件</Text>
              <Segmented
                value={comp}
                onChange={(v) => setComp(v as ComponentKind)}
                options={[
                  { label: '原生 Table', value: 'native' },
                  { label: 'ProTable', value: 'pro' },
                ]}
              />
            </Space>

            <Space size={8}>
              <Text type="secondary">資料量</Text>
              <Segmented
                value={count}
                onChange={(v) => setCount(v as 50 | 20000)}
                options={[
                  { label: '50 筆', value: 50 },
                  { label: '20,000 筆', value: 20000 },
                ]}
              />
            </Space>

            <Space size={8}>
              <Text type="secondary">狀態</Text>
              <Segmented
                value={state}
                onChange={(v) => setState(v as DemoState)}
                options={[
                  { label: '正常', value: 'normal' },
                  { label: '載入中', value: 'loading' },
                  { label: '空資料', value: 'empty' },
                  { label: '搜尋無結果', value: 'noResult' },
                  { label: '錯誤', value: 'error' },
                  { label: '無權限', value: 'forbidden' },
                ]}
              />
            </Space>
          </Space>

          <Divider style={{ marginBlock: 12 }} />

          {/* ── 次控制列：要實際看到的表格能力 ─────────────────────── */}
          <Space size={20} wrap>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.virtual}
                onChange={(v) => set('virtual', v)}
              />
              <Text type="secondary">虛擬捲動</Text>
            </Space>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.sticky}
                onChange={(v) => set('sticky', v)}
              />
              <Text type="secondary">固定表頭</Text>
            </Space>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.fixedSides}
                onChange={(v) => set('fixedSides', v)}
              />
              <Text type="secondary">固定左右欄</Text>
            </Space>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.expandable}
                onChange={(v) => set('expandable', v)}
              />
              <Text type="secondary">展開列</Text>
            </Space>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.pagination}
                disabled={opts.virtual}
                onChange={(v) => set('pagination', v)}
              />
              <Text type="secondary">分頁</Text>
            </Space>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.bordered}
                onChange={(v) => set('bordered', v)}
              />
              <Text type="secondary">外框線</Text>
            </Space>
            <Space size={6}>
              <Switch
                size="small"
                checked={opts.resizable}
                disabled={comp === 'pro'}
                onChange={(v) => set('resizable', v)}
              />
              <Text type="secondary">
                欄寬拖曳{' '}
                <Tag color="orange" style={{ marginInlineEnd: 0 }}>
                  react-resizable
                </Tag>
              </Text>
            </Space>
          </Space>
        </Card>

        {/* ── 狀態說明 ─────────────────────────────────────────────── */}
        <Alert
          style={{ marginBlock: 12 }}
          type={note.type}
          showIcon
          title={
            <>
              {note.msg}
              {deep && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    （深度客製層：空狀態已被 ConfigProvider.renderEmpty 換掉，上面那句描述的是 antd
                    原廠長相，切回「Ant 預設值」才看得到。）
                  </Text>
                </div>
              )}
            </>
          }
        />

        {opts.virtual && (
          <Alert
            style={{ marginBottom: 12 }}
            type="info"
            showIcon
            title="虛擬捲動開啟：antd Table 的 virtual 需要 scroll.y、每一欄都要有固定 width，且 scroll.x 必須把勾選欄與展開欄也算進去（不算會被壓成 1px）。開啟時分頁會被關掉（一次渲染全部資料，但 DOM 只留可視列）。已實測：虛擬模式下「展開列」點了沒反應 —— antd 的 virtual 不支援 expandedRowRender。"
          />
        )}

        {count === 20000 && !opts.virtual && (
          <Alert
            style={{ marginBottom: 12 }}
            type={opts.pagination ? "warning" : "error"}
            showIcon
            title={
              opts.pagination
                ? "先提醒：目前是 20,000 筆且沒開虛擬捲動。如果現在把「分頁」關掉，antd 會一次把 20,000 個 tr 塞進 DOM —— 實測會讓整個分頁卡住一分鐘以上，等同當掉。要看這個極端值請有心理準備；要看流暢版本請先開「虛擬捲動」。"
                : "現在就是最慢的組合：20,000 筆 + 關閉分頁 + 沒有虛擬捲動。畫面若失去回應是預期中的，重新整理即可。"
            }
          />
        )}

        {comp === 'pro' && opts.resizable && (
          <Alert
            style={{ marginBottom: 12 }}
            type="warning"
            showIcon
            title="ProTable 的欄寬拖曳在此測試中未接：ProTable 會自行接管 components，外掛 react-resizable 需要另外處理。"
          />
        )}

        {/* ── 表格本體 ─────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: 12 } }}>
          {comp === 'native' ? (
            <NativeDemo
              rows={rows}
              state={state}
              opts={opts}
              skin={skin}
              onSizeChange={(s) => set('size', s)}
              onResetState={() => setState('normal')}
            />
          ) : (
            <ProDemo
              rows={rows}
              state={state}
              opts={opts}
              skin={skin}
              onResetState={() => setState('normal')}
            />
          )}
        </Card>
        </>
        )}
      </div>
    </ConfigProvider>
  );
}
