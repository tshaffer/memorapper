import { DndContext, useDraggable } from '@dnd-kit/core';

const DragHandle = ({ onDrag }: { onDrag: (deltaY: number) => void }) => {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'drag-handle',
  });

  const handleDrag = () => {
    if (transform) {
      onDrag(transform.y);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseMove={handleDrag} // Respond to drag movements
      onTouchMove={handleDrag} // Handle touch events
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