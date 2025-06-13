import { NodeType } from '@/lib/store/node/types';
import { getNodeNameByGUID } from '../edges/utils';

import { getEdgeNameByGUID } from '../tags/utils';
import { LabelMetadata } from 'litegraphdb/dist/types/types';
import { EdgeType } from '@/lib/store/edge/types';
import { LabelMetadataForTable } from './types';

export const transformLabelsDataForTable = (
  labelsList: LabelMetadata[],
  nodesList: NodeType[],
  edgesList: EdgeType[]
) => {
  return (
    labelsList?.map((data: LabelMetadata) => {
      return {
        ...data,
        NodeName: getNodeNameByGUID(data.NodeGUID, nodesList),
        EdgeName: getEdgeNameByGUID(data.EdgeGUID, edgesList),
        key: data.GUID,
      } as LabelMetadataForTable;
    }) || []
  );
};
