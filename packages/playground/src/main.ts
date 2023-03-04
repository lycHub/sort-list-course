import { Sortable } from '@ysx/sortable';
import './style.css';

const sortable = new Sortable({
    container: '.drag-list',
    dragSelector: '.drag-item'
});