import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor
} from '@dnd-kit/core'
import './dnd.css'

import Draggable from './DndTouchDraggable';

function DndTouchProto() {
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)
  const keyboardSensor = useSensor(KeyboardSensor)

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor)

  return (
      <DndContext sensors={sensors}>
          <Draggable id="1" />
      </DndContext>
  )

}

export default DndTouchProto;