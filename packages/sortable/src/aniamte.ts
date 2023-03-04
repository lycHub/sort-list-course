
import type { AnimationState, SortableTarget } from "./typings";
import { getRect, isRectEqual } from "./utils";
import type { SortableOptions } from "./typings";

export class AnimationManager {
    #animationStates: AnimationState[] = [];

    constructor(readonly container: HTMLElement, readonly options: Required<SortableOptions>) {}

    captureAnimationState() {
        this.#animationStates = [];
        const nodes = this.container!.querySelectorAll(this.options.dragSelector) as NodeListOf<HTMLElement>;
        if (nodes.length) {
            nodes.forEach(child => {
                this.#animationStates.push({
                    target: child,
                    fromRect: getRect(child)
                });
            });
        }
        // console.log('animationStates', this.#animationStates);
    }


    animateAll() {
        this.#animationStates.forEach((state) => {
            let
                target = state.target,
                fromRect = state.fromRect,
                toRect = getRect(target);
            if (!isRectEqual(toRect, fromRect)) {
                this.animate(
                    target,
                    fromRect,
                    toRect
                );
            }
        });
    }

    animate(target: SortableTarget, fromRect: DOMRect, toRect: DOMRect) {
        const { animation } = this.options;
        if (animation) {
            /*
              本来应该是 to - from
              但实际dom已经换过来了
              所以相当于先回到原来的位置，再到最新的位置(from -> to)
            */
            const
                translateX = (fromRect.left - toRect.left),
                translateY = (fromRect.top - toRect.top);

            target.sortableAnimation = target.animate(
                {
                    transform: [
                        `translate(${translateX}px, ${translateY}px)`,
                        `translate(0, 0)`
                    ]
                },
                animation
            );
        }
    }
}