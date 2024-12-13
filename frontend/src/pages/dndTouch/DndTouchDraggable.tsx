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

// const Draggable = function Draggable({ id }: DraggableProps) {
//   const { setNodeRef, listeners, attributes, transform } = useDraggable({ id })

//   useDndMonitor({
//     onDragAbort(event: DragAbortEvent) { console.log('onDragAbort', event) },
//     onDragPending(event: DragPendingEvent) { console.log('onDragPending', event) },
//     onDragStart(event: DragStartEvent) { console.log('onDragStart', event) },
//     onDragMove(event: DragMoveEvent) { console.log('onDragMove', event) },
//     onDragOver(event: DragOverEvent) { console.log('onDragOver', event) },
//     onDragEnd(event: DragEndEvent) { console.log('onDragEnd', event) },
//     onDragCancel(event: DragCancelEvent) { console.log('onDragCancel', event) },
//   });
  
//   const style = transform
//       ? {
//             transform: `translate(${transform.x}px, ${transform.y}px)`
//         }
//       : undefined

//   return (
//       <div
//           className="draggable"
//           ref={setNodeRef}
//           style={style}
//           {...listeners}
//           {...attributes}
//       >
//           {/* Draggable {id} */}
//       </div>
//   )
// }

const Draggable: React.FC = () => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-item',
  });

  const positionY = 100;
  // Apply vertical-only transformation
  const style: React.CSSProperties = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    position: 'absolute',
    left: '50%',
    top: `${positionY}px`,
    width: '200px',
    height: '50px',
    backgroundColor: 'skyblue',
    cursor: 'row-resize',
    textAlign: 'center',
    lineHeight: '50px',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      Drag Me Vertically
    </div>
  );
};

export default Draggable;
