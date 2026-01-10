interface INodeData {
  label: string;
  description?: string;
  bgClass?: string;
}

export interface INodeProps {
  id: string;
  data?: INodeData;
  onRequestNewNode?: (sourceId: string, handleId: string) => void;
}
