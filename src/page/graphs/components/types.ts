export interface VectorIndexData {
    VectorIndexType: string;
    VectorIndexFile: string;
    VectorIndexThreshold: number | null;
    VectorDimensionality: number;
    VectorIndexM: number;
    VectorIndexEf: number;
    VectorIndexEfConstruction: number;
}

export interface EnableVectorIndexModalProps {
    isEnableVectorIndexModalVisible: boolean;
    setIsEnableVectorIndexModalVisible: (visible: boolean) => void;
    graphId: string;
    onSuccess: () => void;
    viewMode?: boolean;
}