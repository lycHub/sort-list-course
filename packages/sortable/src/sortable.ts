import type {PointMeta, SortableEvent, SortableOptions, TypeWithNull} from "./typings";
import {Direction, dragDirection} from "./utils";

const SortablePreset = {
    containerCls: 'sortable-container'
}

const SupportDraggable = document && 'draggable' in document.createElement('div');

class Sortable {
    readonly container: TypeWithNull<HTMLElement> = null;
    options!: Required<SortableOptions>;

    #dragEl: HTMLElement;
    #startMeta: PointMeta;
    #lastPosition: PointMeta;

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
        const target = event.target as HTMLElement;
        if (target?.matches(this.options.dragSelector)) {
            this.#startMeta = {
                x: event.clientX,
                y: event.clientY
            }


            if (SupportDraggable) {
                target.setAttribute('draggable', 'true');
                this.container!.addEventListener('dragenter', this.#handleMove);
                this.container!.addEventListener('dragover', this.#handleMove);
                this.container!.addEventListener('drop', this.#handleUp);
                target.addEventListener('dragend', this.#handleUp);
            }

            /*if (this.options.supportPointer) {
                document.addEventListener('pointermove', this.#handleMove);
                document.addEventListener('pointerup', this.#handleUp);
            } else {
                document.addEventListener('mousemove', this.#handleMove);
                document.addEventListener('mouseup', this.#handleUp);
            }*/
            this.#dragEl = target;
        }
    }

    #handleMove = (event: SortableEvent) => {

        if (event instanceof DragEvent && event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        event.preventDefault();
        event.stopPropagation();

        const target = event.target as HTMLElement;
        // console.log('handleMove', target);
        if (target?.matches(this.options.dragSelector)) {
            const currentPosition = {
                x: event.clientX,
                y: event.clientY
            }

            const [_, vertical] = dragDirection(this.#lastPosition, currentPosition);
            // console.log('vertical', vertical);

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

    #handleUp = (event: SortableEvent) => {
        console.log('handleUp');
        this.#offEvents();
    }

    #offEvents() {
        this.container!.removeEventListener('dragenter', this.#handleMove);
        this.container!.removeEventListener('dragover', this.#handleMove);
        this.container!.removeEventListener('drop', this.#handleUp);
        this.#dragEl.removeEventListener('dragend', this.#handleUp);

        // document.removeEventListener('pointermove', this.#handleMove);
        // document.removeEventListener('pointerup', this.#handleUp);
        // document.removeEventListener('mousemove', this.#handleMove);
        // document.removeEventListener('mouseup', this.#handleUp);
    }


}

export {
    Sortable
}