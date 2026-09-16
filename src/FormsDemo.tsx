/** 第二部分：表單 / Select / DatePicker。三層主題共用同一個 skin。 */
import { Space } from 'antd';
import { OrderForm } from './forms/OrderForm';
import { SelectLab } from './forms/SelectLab';
import { DatePickerLab } from './forms/DatePickerLab';
import type { SkinKind } from './theme2';

export function FormsDemo({ skin }: { skin: SkinKind }) {
  return (
    <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 12 }}>
      <OrderForm key={skin} />
      <SelectLab />
      <DatePickerLab />
    </Space>
  );
}
