type TypeWithNull<T> = T | null;
type SortableEvent = MouseEvent | PointerEvent | DragEvent;

interface SortableOptions {
    container: string | HTMLElement;
    dragSelector?: string;
    supportPointer?: boolean;
}

interface PointMeta {
    x: number;
    y: number;
}

interface AnimationState {
    target: HTMLElement;
    fromRect: DOMRect;
}

export {
    TypeWithNull,
    PointMeta,
    SortableOptions,
    AnimationState,
    SortableEvent,
}