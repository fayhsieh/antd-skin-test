import { Resizable } from 'react-resizable';
import type { SyntheticEvent } from 'react';

/**
 * 欄寬拖曳用的表頭儲存格。
 * antd Table 沒有內建欄寬拖曳，官方文件的做法就是搭 react-resizable
 * 然後用 components.header.cell 換掉表頭 <th>。
 * 這個檔案 + 下面那段 CSS 就是「要寫 CSS 才做得到」的實際成本。
 */
export function ResizableTitle(props: any) {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      }
      onResize={onResize as (e: SyntheticEvent) => void}
      // 用 react-resizable 預設的 enableUserSelectHack(true)，否則拖曳時會把表頭文字選起來
      minConstraints={[60, 0]}
      maxConstraints={[600, 0]}
    >
      <th {...restProps} />
    </Resizable>
  );
}
