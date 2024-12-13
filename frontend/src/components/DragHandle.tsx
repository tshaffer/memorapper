import { DndContext, DragAbortEvent, DragCancelEvent, DragEndEvent, DragMoveEvent, DragOverEvent, DragPendingEvent, DragStartEvent, useDndMonitor, useDraggable } from '@dnd-kit/core';

const DragHandle = ({ onDrag }: { onDrag: (deltaY: number) => void }) => {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'drag-handle',
  });

  useDndMonitor({
    onDragAbort(event: DragAbortEvent) { console.log('onDragAbort', event) },
    onDragPending(event: DragPendingEvent) { console.log('onDragPending', event) },
    onDragStart(event: DragStartEvent) { console.log('onDragStart', event) },
    onDragMove(event: DragMoveEvent) { console.log('onDragMove', event) },
    onDragOver(event: DragOverEvent) { console.log('onDragOver', event) },
    onDragEnd(event: DragEndEvent) { console.log('onDragEnd', event) },
    onDragCancel(event: DragCancelEvent) { console.log('onDragCancel', event) },
  });

  // const handleDrag = () => {
  //   console.log('handleDrag');
  //   if (transform) {
  //     onDrag(transform.y);
  //   }
  // };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // onMouseMove={handleDrag} // Respond to drag movements
      // onTouchMove={handleDrag} // Handle touch events
      style={{
        height: '10px',
        background: '#ccc',
        cursor: 'row-resize',
        userSelect: 'none',
        touchAction: 'none',
      }}
    />
  );
};

export default DragHandle;