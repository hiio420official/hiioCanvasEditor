import { v4 as uuidv4 } from 'uuid'
export namespace CanvasEditor {
    export interface NodeProps {
        index: number
        type: string
        x: number
        y: number
        width: number
        height: number
        fillStyle?: string
    }

    export abstract class BaseNode implements NodeProps {
        private id: string = uuidv4()
        private type: string
        private x: number
        private y: number
        private width: number
        private height: number
        private index: number = 0
        private path: Path2D = new Path2D()
        private selected: boolean = false
        constructor(config: NodeProps) {
            this.type = config.type
            this.x = config.x
            this.y = config.y
            this.width = config.width
            this.height = config.height
        }

        public abstract draw(ctx: CanvasRenderingContext2D): void;


        public drawPath(ctx: CanvasRenderingContext2D, node: BaseNode): Path2D {
            // 매번 새로운 Path2D를 생성하여 누적 방지
            const path = new Path2D();
            path.rect(node.getX(), node.getY(), node.getWidth(), node.getHeight());
            // 노드의 내부 path도 업데이트 (나중에 사용할 수 있도록)
            this.setPath(path);
            return path;
        }

        public isHighlighted(): boolean {
            return this.selected
        }

        public isSelected(): boolean {
            return this.selected
        }
        
        public setSelected(selected: boolean): void {
            this.selected = selected
        }

        public getPath(): Path2D {
            return this.path
        }
        public setPath(path: Path2D): void {
            this.path = path
        }

        public getIndex(): number {
            return this.index
        }
        public setIndex(index: number): void {
            this.index = index
        }

        public getId(): string {
            return this.id
        }

        public getX(): number {
            return this.x
        }

        public getY(): number {
            return this.y
        }

        public getWidth(): number {
            return this.width
        }

        public getHeight(): number {
            return this.height
        }

        public setX(x: number): void {
            this.x = x
        }

        public setY(y: number): void {
            this.y = y
        }

        public setWidth(width: number): void {
            this.width = width
        }

        public setHeight(height: number): void {
            this.height = height
        }
    }

    export interface DraggingNode {
        node: BaseNode
        pos: { x: number, y: number }
    }

    export enum NodeType {
        RECTANGLE = 'rectangle',
        CIRCLE = 'circle',
        TRIANGLE = 'triangle',
        ELLIPSE = 'ellipse',
        POLYGON = 'polygon',
        PATH = 'path',
        TEXT = 'text',
        IMAGE = 'image',
        EMPTY = 'empty',
    }
    export enum CanvasMode {
        SELECT = 'select',
        MOVE = 'move',
        RESIZE = 'resize',
        ROTATE = 'rotate',
        SCALE = 'scale',
        DELETE = 'delete',
    }
}