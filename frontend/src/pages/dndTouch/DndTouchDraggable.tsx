import {
  DragAbortEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragPendingEvent,
  DragStartEvent,
  useDndMonitor,
  useDraggable
} from '@dnd-kit/core'
import './dnd.css'

interface DraggableProps {
  id: string
}

const Draggable: React.FC = () => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-item',
  });

  const positionY = 100;
  // Apply vertical-only transformation
  // works on mobile
  // const style: React.CSSProperties = {
  //   transform: transform ? `translateY(${transform.y}px)` : undefined,
  //   position: 'absolute',
  //   left: '50%',
  //   top: `${positionY}px`,
  //   width: '200px',
  //   height: '50px',
  //   backgroundColor: 'skyblue',
  //   cursor: 'row-resize',
  //   textAlign: 'center',
  //   lineHeight: '50px',
  // };

  // doesn't work on mobile
  /*
  const style: React.CSSProperties = {
    height: '10px',
    backgroundColor: '#ccc',
    cursor: 'row-resize',
    textAlign: 'center',
    lineHeight: '10px',
    userSelect: 'none',

  };
  */

  const style: React.CSSProperties = {
    height: '10px',
    backgroundColor: '#ccc',
    cursor: 'row-resize',
    textAlign: 'center',
    lineHeight: '10px',
    userSelect: 'none',

    transform: transform ? `translateY(${transform.y}px)` : undefined,
    position: 'absolute',
    left: '50%',
    top: `${positionY}px`,
    width: '200px', // width of the draggable handle - failure to include this breaks it
  };

  //       Drag Me Vertically

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
    </div>
  );
};

export default Draggable;
