import {create} from 'zustand'
import type { CanvasEditor as CanvasEditorTypes } from "./canvasEditor.d"

interface NodeState {
  nodes: CanvasEditorTypes.BaseNode[]
  setNodes: (nodes: CanvasEditorTypes.BaseNode[]) => void
  addNode: (node: CanvasEditorTypes.BaseNode) => void
  removeNode: (node: CanvasEditorTypes.BaseNode) => void
  updateNode: (node: CanvasEditorTypes.BaseNode) => void
  getNode: (id: string) => CanvasEditorTypes.BaseNode | undefined
  getNodes: () => CanvasEditorTypes.BaseNode[]
  getNodeCount: () => number
  getNodeById: (id: string) => CanvasEditorTypes.BaseNode | undefined
  getNodesById: (ids: string[]) => CanvasEditorTypes.BaseNode[]
}

export const useNodeState = create<NodeState>((set, get) => ({
  nodes: [],
  setNodes: (nodes: CanvasEditorTypes.BaseNode[]) => set({ nodes }),
  addNode: (node: CanvasEditorTypes.BaseNode) => set((state) => ({ nodes: [...state.nodes, node] })),
  removeNode: (node: CanvasEditorTypes.BaseNode) => set((state) => ({ nodes: state.nodes.filter((n) => n.getId() !== node.getId()) })),
  updateNode: (node: CanvasEditorTypes.BaseNode) => set((state) => ({ nodes: state.nodes.map((n) => n.getId() === node.getId() ? node : n) })),
  getNode: (id: string) => get().nodes.find((n) => n.getId() === id),
  getNodes: () => get().nodes,
  getNodeCount: () => get().nodes.length,
  getNodeById: (id: string) => get().nodes.find((n) => n.getId() === id),
  getNodesById: (ids: string[]) => get().nodes.filter((n) => ids.includes(n.getId())),
}))