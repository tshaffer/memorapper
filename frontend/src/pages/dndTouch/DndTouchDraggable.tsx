import {
  useDraggable} from '@dnd-kit/core'
import './dnd.css'

interface DraggableProps {
  id: string
}

const Draggable = function Draggable({ id }: DraggableProps) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id })

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
          Draggable {id}
      </div>
  )
}

export default Draggable;
