import { EnumerateAndSearchRequest } from 'litegraphdb/dist/types/types';
import React from 'react';
import LitegraphButton from '../base/button/Button';
import LitegraphText from '../base/typograpghy/Text';
import { CloseOutlined } from '@ant-design/icons';
import LitegraphFlex from '../base/flex/Flex';
import LitegraphTag from '../base/tag/Tag';
import LitegraphDivider from '../base/divider/Divider';

const AppliedFilter = ({
  searchParams,
  totalRecords,
  entityName = 'record(s)',
  onClear,
}: {
  searchParams: EnumerateAndSearchRequest;
  totalRecords: number;
  entityName?: string;
  onClear: () => void;
}) => {
  return (
    <>
      {Boolean(Object.keys(searchParams).length) && (
        <LitegraphFlex gap={10} align="center">
          <LitegraphText>
            {totalRecords} {entityName} found
          </LitegraphText>
          <LitegraphDivider type="vertical" className="ant-divider-vertical" />
          {Boolean(searchParams.Labels?.length) && (
            <>
              <LitegraphText>
                <strong>Label: </strong>
                {searchParams.Labels?.map((label) => <LitegraphTag label={label} />)}
              </LitegraphText>
              <LitegraphDivider type="vertical" className="ant-divider-vertical" />
            </>
          )}
          <LitegraphButton className="pl-0" icon={<CloseOutlined />} type="link" onClick={onClear}>
            Clear
          </LitegraphButton>{' '}
        </LitegraphFlex>
      )}
    </>
  );
};

export default AppliedFilter;
