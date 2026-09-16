/**
 * DatePicker 能力盤點 ＋ 三個語系實測。
 * zh-TW 的檢查結果另外寫在 FINDINGS-2.md。
 */
import { useState } from 'react';
import { Card, Col, ConfigProvider, DatePicker, Descriptions, Row, Segmented, Space, Typography } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);

const { Text } = Typography;
const { RangePicker } = DatePicker;

const LOCALES = {
  en: { antd: enUS, dayjs: 'en', label: 'en' },
  'zh-CN': { antd: zhCN, dayjs: 'zh-cn', label: 'zh-CN' },
  'zh-TW': { antd: zhTW, dayjs: 'zh-tw', label: 'zh-TW' },
} as const;

type LocaleKey = keyof typeof LOCALES;

/** 停用未來日期與週末 */
const disabledDate = (d: dayjs.Dayjs) =>
  d.isAfter(dayjs().add(60, 'day')) || d.day() === 0 || d.day() === 6;

const presets = [
  { label: '今天', value: dayjs() },
  { label: '本週一', value: dayjs().startOf('week').add(1, 'day') },
  { label: '本月一號', value: dayjs().startOf('month') },
];

const rangePresets = [
  { label: '今天', value: [dayjs().startOf('day'), dayjs().endOf('day')] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: '本週', value: [dayjs().startOf('week'), dayjs().endOf('week')] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] as [dayjs.Dayjs, dayjs.Dayjs] },
];

function Field({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
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

export function DatePickerLab() {
  const [loc, setLoc] = useState<LocaleKey>('zh-TW');
  const cfg = LOCALES[loc];

  // dayjs 的 locale 是全域的，切語系時要一起切，否則 antd 面板是中文、值卻是英文格式
  dayjs.locale(cfg.dayjs);

  const d = dayjs().locale(cfg.dayjs);

  return (
    <Card
      size="small"
      title="DatePicker"
      extra={
        <Space size={8}>
          <Text type="secondary">語系</Text>
          <Segmented
            size="small"
            value={loc}
            onChange={(v) => setLoc(v as LocaleKey)}
            options={(Object.keys(LOCALES) as LocaleKey[]).map((k) => ({
              label: LOCALES[k].label,
              value: k,
            }))}
          />
        </Space>
      }
    >
      {/* antd 的語系要靠 ConfigProvider locale 傳，dayjs 的要另外 dayjs.locale()，是兩套 */}
      <ConfigProvider locale={cfg.antd}>
        <Row gutter={24}>
          <Col span={12}>
            <Field title="單日" note="內建。">
              <DatePicker style={{ width: '100%' }} />
            </Field>
            <Field title="日期區間" note="內建。RangePicker 是獨立元件。">
              <RangePicker style={{ width: '100%' }} />
            </Field>
            <Field title="含時間" note="內建。showTime 一個 prop。">
              <DatePicker showTime style={{ width: '100%' }} />
            </Field>
            <Field title="區間 ＋ 含時間" note="內建。">
              <RangePicker showTime style={{ width: '100%' }} />
            </Field>
          </Col>
          <Col span={12}>
            <Field
              title="停用特定日期（週末 ＋ 60 天後）"
              note="內建。disabledDate 回傳 true 就停用；停用的樣式沒有獨立 token，要改只能寫 CSS。"
            >
              <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
            </Field>
            <Field title="快捷選項（單日）" note="內建。presets prop。">
              <DatePicker style={{ width: '100%' }} presets={presets} />
            </Field>
            <Field title="快捷選項（區間）" note="內建。presets 在 RangePicker 上會出現在面板左側。">
              <RangePicker style={{ width: '100%' }} presets={rangePresets} />
            </Field>

            {/* ── 語系實測結果，直接在畫面上量給你看 ─────────────────── */}
            <Descriptions
              size="small"
              bordered
              column={1}
              title={`${cfg.label} 實際值`}
              items={[
                {
                  key: 'w',
                  label: '一週從星期幾開始',
                  children: `${d.startOf('week').format('YYYY-MM-DD')}（${d.startOf('week').format('dddd')}）`,
                },
                { key: 'f', label: 'dayjs L 格式', children: d.format('L') },
                { key: 'd', label: '星期簡寫', children: d.localeData().weekdaysMin().join(' ') },
                { key: 'm', label: '月份', children: d.localeData().months().slice(0, 3).join(' / ') },
                {
                  key: 'p',
                  label: 'antd 面板用詞',
                  children: `${(cfg.antd as any).DatePicker?.lang?.today ?? '-'} / ${(cfg.antd as any).DatePicker?.lang?.now ?? '-'} / ${(cfg.antd as any).DatePicker?.lang?.ok ?? '-'}`,
                },
                {
                  key: 'ph',
                  label: 'placeholder',
                  children: `${(cfg.antd as any).DatePicker?.lang?.placeholder ?? '-'}`,
                },
              ]}
            />
          </Col>
        </Row>
      </ConfigProvider>
    </Card>
  );
}
