import { Graph } from 'litegraphdb/dist/types/types';

export interface GraphData extends Graph {
  gexfContent?: string;
}
