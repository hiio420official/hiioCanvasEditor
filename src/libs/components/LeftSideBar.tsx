import CanvasEditor from "@libs/core/canvasEditor"

export default function LeftSideBar() {
  return <aside>
    <div draggable={true} onDragStart={(e) => CanvasEditor.handleDragStart(e as unknown as DragEvent)} data-type="rectangle" >
        <h2 >Rectangle</h2>
    </div>
  </aside>
}