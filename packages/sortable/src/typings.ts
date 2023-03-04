type TypeWithNull<T> = T | null;
type SortableEvent = MouseEvent | PointerEvent | DragEvent;
type SortableTarget = HTMLElement & { sortableAnimation?: Animation; }

interface SortableOptions {
    container: string | HTMLElement;
    dragSelector?: string;
    supportPointer?: boolean;
    animation?: number;
}

interface PointMeta {
    x: number;
    y: number;
}

interface AnimationState {
    target: SortableTarget;
    fromRect: DOMRect;
}

export {
    TypeWithNull,
    PointMeta,
    SortableOptions,
    AnimationState,
    SortableEvent,
    SortableTarget
}