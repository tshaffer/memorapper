import React, { useState, useRef } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';

import '../../styles/searchStyles.css';

interface ResizableContainerProps {
  initialTopDivHeight?: string;
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({ initialTopDivHeight = '50%' }) => {
  const [topDivHeight, setTopDivHeight] = useState<string>(initialTopDivHeight);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleDrag = (event: DraggableEvent, ui: { y: number }) => {
    // const handleHeight: number = handleRef.current!.offsetHeight;
    const containerHeight: number = (event.target as HTMLElement).offsetHeight;
    const newTopDivHeight: string = `${(ui.y / containerHeight) * 100}%`;
    setTopDivHeight(newTopDivHeight);
};

  return (
    <div className="container">
      <div className="top-div" style={{ height: topDivHeight }} />
      <Draggable axis="y" onDrag={handleDrag} handle=".handle">
        <div ref={handleRef} className="handle">||</div>
      </Draggable>
      <div className="bottom-div" style={{ height: `calc(100% - ${topDivHeight})` }} />
    </div>
  );
};

export default ResizableContainer;