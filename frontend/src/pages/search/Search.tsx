import React, { useState, useRef } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';

import '../../styles/searchStyles.css';

interface ResizableContainerProps {
  initialTopDivHeight?: number;
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({ initialTopDivHeight = 141 }) => {
  const [topDivHeight, setTopDivHeight] = useState<number>(initialTopDivHeight);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleDrag = (event: DraggableEvent, draggableData: DraggableData) => {

    const { y, deltaY, lastY } = draggableData;
    console.log('DraggableData');
    console.log(y, deltaY, lastY);

    
    const topContainerHeight = 300;
    const handleHeight = handleRef.current!.offsetHeight;

    console.log('calculate new top div height');
    console.log('topContainerHeight', topContainerHeight);
    console.log('handleHeight', handleHeight);
    console.log('y', y);
    const newTopDivHeight = (topContainerHeight / 2) - (handleHeight / 2) + y ;
    console.log('newTopDivHeight', newTopDivHeight);
    setTopDivHeight(newTopDivHeight);
  };

  console.log('topDivHeight', topDivHeight);
  console.log(topDivHeight.toString() + 'px');
  console.log((300 - 18 - topDivHeight).toString() + 'px')

  return (
    <div id='top-container' className="container">
      <div id='top-div' className="top-div" style={{ height: topDivHeight.toString() + 'px' }} />
      <Draggable
        axis="y"
        onDrag={handleDrag}
        handle=".handle"
      >
        <div ref={handleRef} className="handle">||</div>
      </Draggable>
      <div id='bottom-div' className="bottom-div" style={{ height: (300-18-topDivHeight).toString() + 'px' }} />
    </div>
  );
};

export default ResizableContainer;
