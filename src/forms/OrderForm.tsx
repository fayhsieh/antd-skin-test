/**
 * 模擬「新增／編輯訂單」的長表單。
 * 每個能力旁邊都標了四分類，標註寫在 FINDINGS-2.md 第二段。
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { CHANNEL_OPTIONS, SKU_OPTIONS, WAREHOUSE_BY_CHANNEL, fakeSubmit } from './formData';

const { Text } = Typography;

export function OrderForm() {
  const [form] = Form.useForm();
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [mode, setMode] = useState<'edit' | 'disabled' | 'readonly'>('edit');
  const [guard, setGuard] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [fieldErrorSummary, setFieldErrorSummary] = useState<string[]>([]);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const channel = Form.useWatch('channel', form);

  /** 欄位連動：通路換了，倉庫選項跟著變，且要把已選的無效值清掉 */
  const warehouseOptions = useMemo(
    () => (channel ? WAREHOUSE_BY_CHANNEL[channel] ?? [] : []),
    [channel],
  );
  useEffect(() => {
    const cur = form.getFieldValue('warehouse');
    if (cur && !warehouseOptions.includes(cur)) {
      // antd 不會幫你清，要自己來
      form.setFieldValue('warehouse', undefined);
    }
  }, [warehouseOptions, form]);

  /** 未儲存變更防護：離開前攔截 */
  useEffect(() => {
    if (!guard || !dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [guard, dirty]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    setFormErrors([]);
    setFieldErrorSummary([]);
    setOkMsg(null);
    const res = await fakeSubmit(values);
    setSubmitting(false);
    if (res.ok) {
      setDirty(false);
      setOkMsg('送出成功（假後端）。未儲存變更防護已解除。');
      return;
    }
    // 欄位層級錯誤：用 setFields 塞回對應欄位
    form.setFields(
      res.fieldErrors.map((e) => ({ name: e.field, errors: e.messages })),
    );
    setFieldErrorSummary(res.fieldErrors.flatMap((e) => e.messages));
    setFormErrors(res.formErrors);
  };

  /** 表單層級錯誤總結：antd 沒有這個東西，要自己收集 */
  const onFinishFailed = ({ errorFields }: any) => {
    setFieldErrorSummary(errorFields.flatMap((f: any) => f.errors));
    setFormErrors([]);
    setOkMsg(null);
  };

  const readOnly = mode === 'readonly';
  const disabled = mode === 'disabled';

  return (
    <Card size="small" title="新增／編輯訂單">
      {/* ── 表單本身的開關 ─────────────────────────────────────────── */}
      <Space size={20} wrap style={{ marginBottom: 12 }}>
        <Space size={8}>
          <Text type="secondary">版面</Text>
          <Segmented
            size="small"
            value={layout}
            onChange={(v) => setLayout(v as any)}
            options={[
              { label: '標籤在左', value: 'horizontal' },
              { label: '標籤在上', value: 'vertical' },
            ]}
          />
        </Space>
        <Space size={8}>
          <Text type="secondary">狀態</Text>
          <Segmented
            size="small"
            value={mode}
            onChange={(v) => setMode(v as any)}
            options={[
              { label: '可編輯', value: 'edit' },
              { label: '停用', value: 'disabled' },
              { label: '唯讀', value: 'readonly' },
            ]}
          />
        </Space>
        <Space size={6}>
          <Switch size="small" checked={guard} onChange={setGuard} />
          <Text type="secondary">未儲存變更防護</Text>
          {dirty && guard && (
            <Text type="warning" style={{ fontSize: 12 }}>
              （已有變更，關分頁會被攔）
            </Text>
          )}
        </Space>
      </Space>

      {mode === 'readonly' && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          title="⚠ antd Form 沒有 readOnly。這裡的唯讀是自己做的：variant='borderless' + 每個欄位手動傳 readOnly / open={false}。跟 disabled 是兩套邏輯，得自己維護。"
        />
      )}

      {/* ── 表單層級錯誤總結：antd 沒有內建，自己收集後自己畫 ────────── */}
      {(formErrors.length > 0 || fieldErrorSummary.length > 0) && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          title={`表單有 ${formErrors.length + fieldErrorSummary.length} 個問題`}
          description={
            <ul style={{ margin: '4px 0 0', paddingInlineStart: 18 }}>
              {formErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
              {fieldErrorSummary.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          }
        />
      )}
      {okMsg && (
        <Alert type="success" showIcon style={{ marginBottom: 12 }} title={okMsg} />
      )}

      <Form
        form={form}
        layout={layout}
        labelCol={layout === 'horizontal' ? { flex: '110px' } : undefined}
        wrapperCol={layout === 'horizontal' ? { flex: 1 } : undefined}
        labelWrap
        disabled={disabled}
        variant={readOnly ? 'borderless' : 'outlined'}
        requiredMark
        scrollToFirstError
        onValuesChange={() => setDirty(true)}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ orderNo: 'SO-2026000001', priority: 'normal', items: [] }}
      >
        {/* ── 區塊 1：基本資料 ──────────────────────────────────────── */}
        <Divider titlePlacement="start" style={{ marginTop: 0 }}>
          基本資料
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="訂單編號"
              name="orderNo"
              rules={[{ required: true, message: '請輸入訂單編號' }]}
              extra="送出後端會再驗一次格式；輸入 abc 可看欄位層級的伺服器錯誤"
            >
              <Input readOnly={readOnly} placeholder="SO-0000000000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="通路"
              name="channel"
              rules={[{ required: true, message: '請選擇通路' }]}
              extra="選「媽媽經社團團購」可看表單層級錯誤"
            >
              <Select
                options={CHANNEL_OPTIONS}
                placeholder="請選擇"
                allowClear
                open={readOnly ? false : undefined}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="倉庫"
              name="warehouse"
              rules={[{ required: true, message: '請選擇倉庫' }]}
              extra={
                channel
                  ? `已依「${channel}」過濾出 ${warehouseOptions.length} 個倉庫`
                  : '先選通路，這一欄的選項才會出現'
              }
            >
              <Select
                disabled={disabled || !channel}
                options={warehouseOptions.map((w) => ({ label: w, value: w }))}
                placeholder={channel ? '請選擇' : '請先選通路'}
                open={readOnly ? false : undefined}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="預計出貨日" name="shipBy">
              <DatePicker style={{ width: '100%' }} inputReadOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        {/* ── 區塊 2：收件資訊 ──────────────────────────────────────── */}
        <Divider titlePlacement="start">收件資訊</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="收件人"
              name={['receiver', 'name']}
              rules={[{ required: true, message: '請輸入收件人' }]}
            >
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="手機"
              name={['receiver', 'phone']}
              rules={[{ required: true, message: '請輸入手機號碼' }]}
              extra="輸入 12345 可看巢狀欄位的伺服器錯誤"
            >
              <Input readOnly={readOnly} placeholder="09xxxxxxxx" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="地址" name={['receiver', 'address']}>
              <Input.TextArea rows={2} readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        {/* ── 區塊 3：商品明細（Form.List）───────────────────────────── */}
        <Divider titlePlacement="start">商品明細</Divider>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="top">
                  <Col span={11}>
                    <Form.Item
                      name={[field.name, 'sku']}
                      rules={[{ required: true, message: '請選商品' }]}
                    >
                      <Select
                        showSearch
                        placeholder="輸入 SKU 或品名"
                        optionFilterProp="label"
                        options={SKU_OPTIONS.slice(0, 200).map((s) => ({
                          label: `${s.sku}　${s.name}`,
                          value: s.sku,
                        }))}
                        open={readOnly ? false : undefined}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      name={[field.name, 'qty']}
                      rules={[{ required: true, message: '請輸入數量' }]}
                    >
                      <InputNumber min={1} placeholder="數量" style={{ width: '100%' }} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item name={[field.name, 'price']}>
                      <InputNumber min={0} placeholder="單價" style={{ width: '100%' }} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Button danger onClick={() => remove(field.name)} disabled={disabled || readOnly}>
                      移除
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button onClick={() => add()} disabled={disabled || readOnly} style={{ marginBottom: 12 }}>
                + 新增一列商品
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item label={layout === 'horizontal' ? ' ' : undefined} colon={false}>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={disabled || readOnly}>
              送出
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setDirty(false);
                setFormErrors([]);
                setFieldErrorSummary([]);
                setOkMsg(null);
              }}
            >
              重設
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
