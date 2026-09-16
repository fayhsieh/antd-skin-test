/** Select 能力盤點。每一格上面的說明就是四分類的依據。 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Card, Col, Empty, Row, Select, Space, Spin, Tag, Typography } from 'antd';
import {
  CHANNEL_OPTIONS,
  GROUPED_CHANNELS,
  SKU_OPTIONS,
  fakeRemoteSearch,
  type SkuOption,
} from './formData';

const { Text } = Typography;

function Field({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 4 }}>
        <Text strong>{title}</Text>
      </div>
      {children}
      <div style={{ marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {note}
        </Text>
      </div>
    </div>
  );
}

export function SelectLab() {
  /* ── 遠端搜尋 ─────────────────────────────────────────────────────
   * antd 沒有內建 debounce，也沒有「查詢中 / 查無結果」的狀態機，
   * 只給 onSearch + notFoundContent + loading 三個鉤子，其餘自己寫。
   * ------------------------------------------------------------- */
  const [remoteOpts, setRemoteOpts] = useState<SkuOption[]>([]);
  const [fetching, setFetching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const onSearch = useCallback((kw: string) => {
    window.clearTimeout(timer.current);
    if (!kw.trim()) {
      setRemoteOpts([]);
      setSearched(false);
      setFetching(false);
      return;
    }
    setFetching(true);
    const my = ++seq.current;
    timer.current = window.setTimeout(async () => {
      const res = await fakeRemoteSearch(kw);
      if (my !== seq.current) return; // 競態：舊的回應要丟掉，antd 不管這件事
      setRemoteOpts(res);
      setSearched(true);
      setFetching(false);
    }, 350);
  }, []);

  /** 1,200 筆選項 */
  const bigOptions = useMemo(
    () => SKU_OPTIONS.map((s) => ({ label: `${s.sku}　${s.name}`, value: s.sku })),
    [],
  );

  return (
    <Card size="small" title="Select">
      <Row gutter={24}>
        <Col span={12}>
          <Field title="單選" note="內建。allowClear + showSearch 都是 prop。">
            <Select
              style={{ width: '100%' }}
              placeholder="請選擇通路"
              options={CHANNEL_OPTIONS}
              allowClear
              showSearch
            />
          </Field>

          <Field
            title="多選"
            note="內建。maxTagCount='responsive' 會自動收成「+N」，這個行為是 antd 給的。"
          >
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              placeholder="可複選"
              options={CHANNEL_OPTIONS}
              maxTagCount="responsive"
              allowClear
            />
          </Field>

          <Field
            title="分組選項"
            note="內建。options 裡放 { label, options } 就會分組，不用額外元件。"
          >
            <Select
              style={{ width: '100%' }}
              placeholder="依通路類型分組"
              options={GROUPED_CHANNELS}
              allowClear
            />
          </Field>

          <Field
            title="標籤模式（可自由輸入）"
            note="內建。mode='tags'，按 Enter 就會變成新標籤。tokenSeparators 可設定用逗號切。"
          >
            <Select
              style={{ width: '100%' }}
              mode="tags"
              placeholder="輸入後按 Enter 直接新增"
              tokenSeparators={[',', '，']}
              options={CHANNEL_OPTIONS}
            />
          </Field>
        </Col>

        <Col span={12}>
          <Field
            title="遠端搜尋（輸入後延遲查詢）"
            note="⚠ 半內建。antd 只給 onSearch / loading / notFoundContent 三個鉤子；debounce、競態處理（舊回應丟棄）、「還沒查」與「查無結果」的區分，全部要自己寫。輸入 zz 可看查無結果。"
          >
            <Select
              style={{ width: '100%' }}
              showSearch
              placeholder="輸入 SKU 或品名（假後端，延遲 600ms）"
              filterOption={false}
              onSearch={onSearch}
              loading={fetching}
              notFoundContent={
                fetching ? (
                  <div style={{ padding: 12, textAlign: 'center' }}>
                    <Spin size="small" /> <Text type="secondary">查詢中…</Text>
                  </div>
                ) : searched ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="查無符合的商品"
                    style={{ margin: '12px 0' }}
                  />
                ) : (
                  <div style={{ padding: 12, textAlign: 'center' }}>
                    <Text type="secondary">請輸入關鍵字</Text>
                  </div>
                )
              }
              options={remoteOpts.map((s) => ({
                label: `${s.sku}　${s.name}`,
                value: s.sku,
              }))}
            />
          </Field>

          <Field
            title="大量選項（1,200 筆）"
            note="內建。rc-virtual-list 是 Select 的預設行為，不用設定；實測捲動順暢，DOM 只留可視項。"
          >
            <Select
              style={{ width: '100%' }}
              showSearch
              placeholder="1,200 筆商品，直接捲"
              options={bigOptions}
              optionFilterProp="label"
            />
          </Field>

          <Field
            title="自訂選項呈現（編號 ＋ 名稱 ＋ 規格）"
            note="內建。optionRender 換選項列、labelRender 換選完之後輸入框裡的樣子，兩個是分開的 prop，都要傳。"
            >
            <Select
              style={{ width: '100%' }}
              showSearch
              placeholder="選項裡同時顯示編號和名稱"
              optionFilterProp="label"
              options={SKU_OPTIONS.slice(0, 300).map((s) => ({
                label: `${s.sku} ${s.name} ${s.spec}`,
                value: s.sku,
                data: s,
              }))}
              optionRender={(opt) => {
                const d = (opt.data as any).data as SkuOption;
                return (
                  <Space size={8}>
                    <Text code style={{ fontSize: 11 }}>
                      {d.sku}
                    </Text>
                    <span>{d.name}</span>
                    <Tag style={{ marginInlineEnd: 0 }}>{d.spec}</Tag>
                  </Space>
                );
              }}
              labelRender={(item) => {
                const d = SKU_OPTIONS.find((s) => s.sku === item.value);
                return d ? `${d.sku}　${d.name}` : item.label;
              }}
            />
          </Field>
        </Col>
      </Row>
    </Card>
  );
}
