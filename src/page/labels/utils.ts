import { NodeType } from '@/types/types';
import { getNodeNameByGUID } from '../edges/utils';

import { getEdgeNameByGUID } from '../tags/utils';
import { LabelMetadata } from 'litegraphdb/dist/types/types';
import { EdgeType } from '@/types/types';
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

export const getNodeAndEdgeGUIDsByLabelList = (labelsList: LabelMetadata[]) => {
  const nodeGUIDs = labelsList.map((label) => label.NodeGUID);
  const edgeGUIDs = labelsList.map((label) => label.EdgeGUID);
  return {
    nodeGUIDs: Array.from(new Set(nodeGUIDs)),
    edgeGUIDs: Array.from(new Set(edgeGUIDs)),
  };
};
