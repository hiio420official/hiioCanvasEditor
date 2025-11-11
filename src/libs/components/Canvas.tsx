import CanvasEditor, { CanvasEditorNode } from "@libs/core/canvasEditor"
import { useLayoutEffect, useRef } from "react"


export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasEditorRef = useRef<CanvasEditor | null>(null)


  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvasEditorRef.current = new CanvasEditor(canvas)

      const handleDrop = (e: DragEvent) => {
        canvasEditorRef.current?.handleDrop(e)
      }
      const handleResize = () => {
        canvasEditorRef.current?.resize()
      }
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      }

      const mouseMove = (e: PointerEvent) => {
        const pos = canvasEditorRef.current?.getPos(e)
        if (!pos) return
        const draggingNode = canvasEditorRef.current?.getDraggingNode()
        const selectionRect = canvasEditorRef.current?.getSelectionRect()

        if (draggingNode?.node) {
          canvasEditorRef.current?.changeDraggingNode(e)
        } else if (selectionRect) {
          // 선택 영역 그리기 중
          canvasEditorRef.current?.setSelectionRect(
            selectionRect.startX,
            selectionRect.startY,
            pos.x,
            pos.y
          )
          canvasEditorRef.current?.draw()
        }
      }
      const pointerDown = (e: PointerEvent) => {
        const selectedNode = canvasEditorRef.current?.setSelectedNode(e)
        const pos = canvasEditorRef.current?.getPos(e)
        
        if (selectedNode && pos) {
          // 노드를 클릭한 경우: 드래깅 모드
          // 마우스 클릭 위치와 노드 위치의 오프셋을 계산해서 저장
          const offset = {
            x: pos.x - selectedNode.getX(),
            y: pos.y - selectedNode.getY()
          }
          canvasEditorRef.current?.setDraggingNode(selectedNode, offset)
          canvasEditorRef.current?.clearSelectionRect()
        } else if (pos) {
          // 빈 공간을 클릭한 경우: 선택 영역 모드 시작
          canvasEditorRef.current?.setDraggingNode(null, { x: 0, y: 0 })
          canvasEditorRef.current?.setSelectionRect(pos.x, pos.y, pos.x, pos.y)
        }
        canvasEditorRef.current?.draw()
        canvasRef.current?.setPointerCapture(e.pointerId)
      }

      const pointerUp = (e: PointerEvent) => {
        const draggingNode = canvasEditorRef.current?.getDraggingNode()
        const selectionRect = canvasEditorRef.current?.getSelectionRect()
        const pos = canvasEditorRef.current?.getPos(e)

        if (draggingNode) {
          // 노드 드래깅 종료
          (draggingNode.node as CanvasEditorNode)?.setSelected(false)
          canvasEditorRef.current?.setDraggingNode(null, { x: 0, y: 0 })
        } else if (selectionRect && pos) {
          // 선택 영역 완성: 최종 사각형 그리기
          canvasEditorRef.current?.setSelectionRect(
            selectionRect.startX,
            selectionRect.startY,
            pos.x,
            pos.y
          )
          // 선택 영역은 그대로 유지 (사용자가 원하면 여기서 clear할 수 있음)
        }
        canvasEditorRef.current?.draw()
        canvasRef.current?.releasePointerCapture(e.pointerId)
      }
      canvas.addEventListener('drop', handleDrop)
      canvas.addEventListener('dragover', handleDragOver)
      window.addEventListener('resize', handleResize)
      canvas.addEventListener('pointerdown', pointerDown)
      canvas.addEventListener('pointerup', pointerUp)
      canvas.addEventListener('pointermove', mouseMove)
      return () => {
        canvas.removeEventListener('drop', handleDrop)
        canvas.removeEventListener('dragover', handleDragOver)
        window.removeEventListener('resize', handleResize)
        canvas.removeEventListener('pointerdown', pointerDown)
        canvas.removeEventListener('pointerup', pointerUp)
        canvas.removeEventListener('pointermove', mouseMove)
      }
    }
  }, [])
  return <canvas className="canvas" ref={canvasRef} />
}