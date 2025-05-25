import Graph from 'litegraphdb/types/models/Graph';

export interface GraphData extends Graph {
  gexfContent?: string;
}
