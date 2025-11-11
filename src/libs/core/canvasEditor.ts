import { CanvasEditor as CanvasEditorTypes } from "./canvasEditor.d"


export default class CanvasEditor {
  private ctx: CanvasRenderingContext2D | null
  private nodes: CanvasEditorTypes.BaseNode[] = []
  private nodeType: CanvasEditorTypes.NodeType = CanvasEditorTypes.NodeType.EMPTY;
  private canvasMode: CanvasEditorTypes.CanvasMode = CanvasEditorTypes.CanvasMode.SELECT;
  private dpr: number = window.devicePixelRatio || 1
  private draggingNode: CanvasEditorTypes.DraggingNode | null = null
  private selectionRect: { startX: number, startY: number, endX: number, endY: number } | null = null
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = this.canvas.getContext('2d')
    this.dpr = window.devicePixelRatio || 1
    this.resize()
    const tmp = new CanvasEditorNode({
      index: 0,
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fillStyle: 'black',
    })
    this.addNode(tmp)
    this.draw()
  }

  setDraggingNode(node: CanvasEditorTypes.BaseNode | null, pos: { x: number, y: number }) {
    if (node === null) {
      this.draggingNode = null
    } else {
      
      this.draggingNode = { node: node as CanvasEditorTypes.BaseNode, pos }
    }
  }
  getDraggingNode() {
    return this.draggingNode
  }

  changeDraggingNode(e:PointerEvent) {
    if (this.draggingNode) {
      const pos = this.getPos(e)
      this.draggingNode.node.setX(pos.x - this.draggingNode.pos.x)
      this.draggingNode.node.setY(pos.y - this.draggingNode.pos.y)
      this.draw()
    }
  }

  setSelectedNode(e: MouseEvent) {
    const nodes = this.getNodes()
    const pos = this.getPos(e)
    let foundNode: CanvasEditorTypes.BaseNode | null = null

    // 먼저 모든 노드의 선택 상태를 해제
    for (const node of nodes) {
      (node as CanvasEditorNode).setSelected(false)
    }
    // 클릭한 위치에 노드가 있는지 확인
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      const path = (node as CanvasEditorNode).drawPath(this.ctx!, node)
      const isPointInPath = this.ctx?.isPointInPath(path, pos.x, pos.y) || false
      if (isPointInPath) {
        (node as CanvasEditorNode).setSelected(true)

        foundNode = node
        break;
      }
    }

    // 노드를 찾지 못한 경우 드래깅 노드 초기화
    if (!foundNode) {
      this.setDraggingNode(null, { x: 0, y: 0 })
    }

    this.draw()
    return foundNode
  }

  getSelectedNode() {
    return this.nodes.find(node => (node as CanvasEditorNode).isSelected())
  }


  handleDrop(e: DragEvent) {
    e.preventDefault()
    const dataTransfer = e.dataTransfer
    const pos = this.getPos(e)

    const json = dataTransfer?.getData('application/json');
    if (json) {
      const data = JSON.parse(json);
      const node = new CanvasEditorNode({
        index: this.nodes.length,
        type: data.type,
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        fillStyle: 'red',
      })
      this.addNode(node)
      this.draw() // 노드 추가 후 다시 그리기
    }
  }

  static handleDragStart(e: DragEvent) {
    const { target } = e
    const type = (target as HTMLElement).dataset.type
    e.dataTransfer?.setData('application/json', JSON.stringify({ type }))
    e.dataTransfer!.effectAllowed = 'move'
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth * this.dpr
    this.canvas.height = this.canvas.clientHeight * this.dpr
    this.ctx?.resetTransform()// ✅ 좌표계 리셋 + scale 한 번만
    this.draw()
  }

  draw() {
    if (!this.ctx) return
    const width = this.canvas.width || this.canvas.clientWidth
    const height = this.canvas.height || this.canvas.clientHeight
    this.ctx.clearRect(0, 0, width, height)
    this.nodes.forEach(node => {
      node.draw(this.ctx!)
    })
    // 선택 영역 그리기
    if (this.selectionRect) {
      this.drawSelectionRect()
    }
  }

  setSelectionRect(startX: number, startY: number, endX: number, endY: number | null) {
    if (endX === null || endY === null) {
      this.selectionRect = null
    } else {
      this.selectionRect = { startX, startY, endX, endY }
    }
  }

  getSelectionRect() {
    return this.selectionRect
  }

  clearSelectionRect() {
    this.selectionRect = null
  }

  private drawSelectionRect() {
    if (!this.ctx || !this.selectionRect) return
    
    const { startX, startY, endX, endY } = this.selectionRect
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const width = Math.abs(endX - startX)
    const height = Math.abs(endY - startY)

    // 블루 계열 투명 채우기
    this.ctx.fillStyle = 'rgba(100, 150, 255, 0.3)'
    this.ctx.fillRect(x, y, width, height)
    
    // 테두리
    this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, width, height)
  }


  getPos(e: MouseEvent) {
    const rect = this.getRect()
    const dpr = window.devicePixelRatio || 1
    return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr }
  }
  setNodes(nodes: CanvasEditorTypes.BaseNode[]) {
    this.nodes = nodes
  }

  getNodes() {
    return this.nodes
  }

  getCtx() {
    return this.ctx
  }
  addNode(node: CanvasEditorTypes.BaseNode) {
    node.setIndex(this.nodes.length)
    this.nodes.push(node)
  }
  removeNode(node: CanvasEditorTypes.BaseNode) {
    this.nodes = this.nodes.filter(n => n.getId() !== node.getId())
  }
  updateNode(node: CanvasEditorTypes.BaseNode) {
    this.nodes = this.nodes.map(n => n.getId() === node.getId() ? node : n)
  }

  getRect() {
    return this.canvas.getBoundingClientRect() as DOMRect
  }
}


/**
 * 
 * Node class
 */
export class CanvasEditorNode extends CanvasEditorTypes.BaseNode {
  private fillStyle: string = 'transparent'

  constructor(config: CanvasEditorTypes.NodeProps) {
    super(config)
    this.fillStyle = config.fillStyle || 'transparent'
  }


  setFillStyle(fillStyle: string) {
    this.fillStyle = fillStyle
  }
  getFillStyle(): string {
    return this.fillStyle
  }
  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.getFillStyle() || 'transparent'
    ctx.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight())
    ctx.strokeStyle = 'black'
    ctx.strokeRect(this.getX(), this.getY(), this.getWidth(), this.getHeight())

    // Path2D 업데이트 (나중에 isPointInPath 체크에 사용)
    const path = new Path2D()
    path.rect(this.getX(), this.getY(), this.getWidth(), this.getHeight())
    this.setPath(path)

    // 선택된 노드 하이라이트
    if (this.isSelected()) {
      ctx.strokeStyle = 'purple'
      ctx.lineWidth = 2
      ctx.strokeRect(this.getX(), this.getY(), this.getWidth(), this.getHeight())
    }
  }
}