import type {PointMeta} from "./typings";

enum Direction {
    Up,
    Down,
    Left,
    Right,
    Unknown
}

function dragDirection(start: PointMeta, end: PointMeta): [Direction, Direction] {
    if (start && end) {
        const horizontal = start.x - end.x > 0 ? Direction.Left : Direction.Right;
        const vertical = start.y - end.y > 0 ? Direction.Up : Direction.Down;
        return [horizontal, vertical];
    }
    return [Direction.Unknown, Direction.Unknown];
}

function closest(el: HTMLElement, selector: string) {
    let result = null;
    while (el && !result) {
        if (el?.matches && el.matches(selector)) {
            result = el;
        }
        el = el.parentNode as HTMLElement;
    }
    return result;
}

function getRect(target: HTMLElement) {
    return target.getBoundingClientRect();
}

function beyondBoundary(target: HTMLElement, container: HTMLElement): {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
} {
    const targetRect = getRect(target);
    const containerRect = getRect(container);
    return {
        left: targetRect.left - containerRect.left < 0,
        right: targetRect.right - containerRect.right > 0,
        top: targetRect.top - containerRect.top < 0,
        bottom: targetRect.bottom - containerRect.bottom > 0,
    }
}


export {
    Direction,
    dragDirection,
    closest,
    getRect,
    beyondBoundary
}