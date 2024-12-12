import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';

import Droppable from './Droppable';
import Draggable from './Draggable';

function DndProto() {

  const [isDropped, setIsDropped] = useState(false);

  const draggableMarkup = (
    <Draggable>Drag me</Draggable>
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {!isDropped ? draggableMarkup : null}
      <Droppable>
        {isDropped ? draggableMarkup : 'Drop here'}
      </Droppable>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    if (event.over && event.over.id === 'droppable') {
      setIsDropped(true);
    }
  }
}

export default DndProto;