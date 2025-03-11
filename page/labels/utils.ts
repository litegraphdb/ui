import { NodeType } from '@/lib/store/node/types';
import { getNodeNameByGUID } from '../edges/utils';
import { EdgeType } from '@/lib/store/edge/types';
import LabelMetadata from 'litegraphdb/types/models/LabelMetadata';
import { getEdgeNameByGUID } from '../tags/utils';

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
      } as LabelMetadata;
    }) || []
  );
};
