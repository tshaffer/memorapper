import {
  DragAbortEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragPendingEvent,
  DragStartEvent,
  useDndMonitor,
  useDraggable} from '@dnd-kit/core'
import './dnd.css'

interface DraggableProps {
  id: string
}

const Draggable = function Draggable({ id }: DraggableProps) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id })

  useDndMonitor({
    onDragAbort(event: DragAbortEvent) { console.log('onDragAbort', event) },
    onDragPending(event: DragPendingEvent) { console.log('onDragPending', event) },
    onDragStart(event: DragStartEvent) { console.log('onDragStart', event) },
    onDragMove(event: DragMoveEvent) { console.log('onDragMove', event) },
    onDragOver(event: DragOverEvent) { console.log('onDragOver', event) },
    onDragEnd(event: DragEndEvent) { console.log('onDragEnd', event) },
    onDragCancel(event: DragCancelEvent) { console.log('onDragCancel', event) },
  });
  
  // onDragAbort?(event: DragAbortEvent): void;
  // onDragPending?(event: DragPendingEvent): void;
  // onDragStart?(event: DragStartEvent): void;
  // onDragMove?(event: DragMoveEvent): void;
  // onDragOver?(event: DragOverEvent): void;
  // onDragEnd?(event: DragEndEvent): void;
  // onDragCancel?(event: DragCancelEvent): void;

  const style = transform
      ? {
            transform: `translate(${transform.x}px, ${transform.y}px)`
        }
      : undefined

  return (
      <div
          className="draggable"
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
      >
          {/* Draggable {id} */}
      </div>
  )
}

export default Draggable;
