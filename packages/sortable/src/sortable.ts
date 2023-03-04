import type {PointMeta, SortableEvent, SortableOptions, TypeWithNull} from "./typings";
import {beyondBoundary, closest, Direction, dragDirection, getRect} from "./utils";

const SortablePreset = {
    containerCls: 'sortable-container',
    previewCls: 'sortable-preview',
    previewStyles: `
          position: fixed;
          left: 0;
          top: 0;
          box-shadow: 4px 4px 8px 0px rgba(97,133,123,1);
          pointer-events: none;
    `,
    transition: 'transform .2s ease-in-out',
    fixScrollRatio: 1.1
}

const SupportDraggable = document && 'draggable' in document.createElement('div');

class Sortable {
    readonly container: TypeWithNull<HTMLElement> = null;
    options!: Required<SortableOptions>;

    #previewEl: TypeWithNull<HTMLElement> = null;
    #dragEl: TypeWithNull<HTMLElement> = null;
    #startMeta: TypeWithNull<PointMeta & { dragEl: DOMRect; }> = null;
    #lastPosition: TypeWithNull<PointMeta> = null;

    constructor(options: SortableOptions) {
        this.container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
        if (this.container) {
            this.container.classList.add(SortablePreset.containerCls);
            this.#mergeOptions(options);
            this.#initEvents();
        }
    }

    #mergeOptions(options: SortableOptions) {
        this.options = Object.assign({
            dragSelector: '>li',
            supportPointer: false
        }, options);
    }

    #initEvents() {
        if (this.options.supportPointer) {
            this.container!.addEventListener('pointerdown', this.#handleStart);
        } else {
            this.container!.addEventListener('mousedown', this.#handleStart);
        }
    }

    #handleStart = (event: SortableEvent) => {
        // const target = event.target as HTMLElement;
        const target = closest(event.target as HTMLElement, this.options.dragSelector);
        // console.log('target', target, event.target);
        if (target) {
            this.#startMeta = {
                x: event.clientX,
                y: event.clientY,
                dragEl: getRect(target)
            }


            if (SupportDraggable) {
                target.setAttribute('draggable', 'true');
                this.container!.addEventListener('dragenter', this.#handleMove);
                this.container!.addEventListener('dragover', this.#handleMove);
                this.container!.addEventListener('drop', this.#handleUp);
                target.addEventListener('dragend', this.#handleUp);
            }

            if (this.options.supportPointer) {
                document.addEventListener('pointermove', this.#handleMove);
                document.addEventListener('pointerup', this.#handleUp);
            } else {
                document.addEventListener('mousemove', this.#handleMove);
                document.addEventListener('mouseup', this.#handleUp);
            }
            this.#dragEl = target;
        }
    }

    #setPreview() {
        this.#previewEl = this.#dragEl!.cloneNode(true) as HTMLElement;
        this.#previewEl.className = SortablePreset.previewCls;
        const styles = getComputedStyle(this.#dragEl!);
        this.#previewEl.style.cssText = `
            width: ${styles.width};
            height: ${styles.height};
            line-height: ${styles.lineHeight};
            padding: ${styles.padding};
            ${SortablePreset.previewStyles}
        `;

        const { x, y, dragEl } = this.#startMeta!;
        const left = x - (x - dragEl.x);
        const top = y - (y - dragEl.y);
        this.#previewEl!.setAttribute('start-left', `${left}`);
        this.#previewEl!.setAttribute('start-top', `${top}`);
        this.#setPreviewPosition({ x: left, y: top });
        document.body.appendChild(this.#previewEl);
    }

    #setPreviewPosition(position: PointMeta) {
        this.#previewEl!.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }

    #handleMove = (event: SortableEvent) => {
        if (event instanceof DragEvent && event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        event.preventDefault();
        event.stopPropagation();

        if (!this.#previewEl) {
            this.#setPreview();
            this.#dragEl!.style.visibility = 'hidden';
        }


        const target = closest(event.target as HTMLElement, this.options.dragSelector);

        const currentPosition = {
            x: event.clientX,
            y: event.clientY
        }

        const delta = {
            x: currentPosition.x - this.#startMeta!.x,
            y: currentPosition.y - this.#startMeta!.y
        }

        const startLeft = this.#previewEl!.getAttribute('start-left') || '';
        const startTop = this.#previewEl!.getAttribute('start-top') || '';

        this.#setPreviewPosition({
            x: +startLeft + delta.x,
            y: +startTop + delta.y,
        });



        if (target) {
            if (this.#dragEl!.contains(target)) {
                return;
            }


            const [_, vertical] = dragDirection(this.#lastPosition!, currentPosition);


            if (!SupportDraggable) {
                this.#fixScroll(target || this.#dragEl);
            }

            const nextSibling = target.nextElementSibling;
            if (nextSibling) {
                this.container!.insertBefore(this.#dragEl!, vertical === Direction.Down ? nextSibling : target);
            } else {
                this.container!.appendChild(this.#dragEl!);
            }
        }

        this.#lastPosition = {
            x: event.clientX,
            y: event.clientY
        }
    }

    #fixScroll(target: HTMLElement) {
        if (target) {
            const boundary = beyondBoundary(target, this.container!);
            if (boundary.top) {
                this.container!.scrollBy({
                    top: -target.clientHeight * SortablePreset.fixScrollRatio
                });
            }
            if (boundary.bottom) {
                this.container!.scrollBy({
                    top: target.clientHeight * SortablePreset.fixScrollRatio
                });
            }

            if (boundary.left) {
                this.container!.scrollBy({
                    left: -target.clientHeight * SortablePreset.fixScrollRatio
                });
            }

            if (boundary.right) {
                this.container!.scrollBy({
                    left: target.clientHeight * SortablePreset.fixScrollRatio
                });
            }
        }
    }

    #handleUp = () => {
        this.#offEvents();

        const currentDragRect = getRect(this.#dragEl!);
        // const startLeft = this.#previewEl!.getAttribute('start-left') || '';
        // const startTop = this.#previewEl!.getAttribute('start-top') || '';
        if (this.#previewEl) {
            this.#previewEl.style.transition = SortablePreset.transition;
            this.#setPreviewPosition({
                x: currentDragRect.x,
                y: currentDragRect.y,
            });

            const handleTransitionEnd = () => {
                this.#previewEl!.removeEventListener('transitionend', handleTransitionEnd);
                this.#clear();
            }

            this.#previewEl.addEventListener('transitionend', handleTransitionEnd);
        }
    }

    #clear() {
        this.#previewEl?.remove();
        this.#previewEl = null;
        this.#dragEl!.style.visibility = 'visible';
        this.#dragEl = null;
        this.#lastPosition = null;
    }

    #offEvents() {
        this.container!.removeEventListener('dragenter', this.#handleMove);
        this.container!.removeEventListener('dragover', this.#handleMove);
        this.container!.removeEventListener('drop', this.#handleUp);
        this.#dragEl!.removeEventListener('dragend', this.#handleUp);

        document.removeEventListener('pointermove', this.#handleMove);
        document.removeEventListener('pointerup', this.#handleUp);
        document.removeEventListener('mousemove', this.#handleMove);
        document.removeEventListener('mouseup', this.#handleUp);
    }


}

export {
    Sortable
}