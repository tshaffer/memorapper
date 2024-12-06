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
    const containerHeight: number = (event.target as HTMLElement).offsetHeight;
    const sensitivityFactor = 0.5; // Adjust sensitivity as needed

    const newTopDivHeight = `${Math.min(Math.max(0, ui.y * sensitivityFactor), containerHeight - handleRef.current!.offsetHeight)} / containerHeight * 100}%`;
    setTopDivHeight(newTopDivHeight);
  };

  return (
    <div className="container">
      <div className="top-div" style={{ height: topDivHeight }} />
      <Draggable
        axis="y"
        onDrag={handleDrag}
        handle=".handle"
        position={{ x: 0, y: parseFloat(topDivHeight) }} // Adjust position based on topDivHeight
      >
        <div ref={handleRef} className="handle">||</div>
      </Draggable>
      <div className="bottom-div" style={{ height: `calc(100% - ${topDivHeight})` }} />
    </div>
  );
};

export default ResizableContainer;
