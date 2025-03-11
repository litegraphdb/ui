import React, { useState } from 'react';
import { Table, TableProps } from 'antd';
import { Resizable } from 'react-resizable';

const ResizableTitle = (props: any) => {
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
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const LitegraphTable = (props: TableProps) => {
  const { columns, ...rest } = props;
  const [columnsState, setColumnsState] = useState(columns);

  const handleResize =
    (index: number) =>
    (e: any, { size }: any) => {
      console.log(index, size);
      setColumnsState((prev: any) => {
        const nextColumns = [...prev];
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width,
        };
        return nextColumns;
      });
    };

  const columnsWithResizable = columnsState?.map((col: any, index: number) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));
  return (
    <Table
      {...rest}
      columns={columnsWithResizable}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
    />
  );
};

export default LitegraphTable;
