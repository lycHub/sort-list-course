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

export {
    Direction,
    dragDirection,
}