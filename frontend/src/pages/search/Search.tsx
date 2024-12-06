import React, { useState, useRef } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';

import '../../styles/searchStyles.css';

interface ResizableContainerProps {
  initialTopDivHeight?: string;
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({ initialTopDivHeight = '50%' }) => {
  const [topDivHeight, setTopDivHeight] = useState<string>(initialTopDivHeight);
  const handleRef = useRef<HTMLDivElement>(null);

  const sensitivityFactor = 0.5; // Adjust sensitivity as needed

  const handleDrag = (event: DraggableEvent, ui: { y: number }) => {

    const containerId: string = (event.target as HTMLElement).id;
    const containerHeight: number = (event.target as HTMLElement).offsetHeight;

    console.log('container id and height:', containerId, containerHeight);
    console.log('handle offset height', handleRef.current!.offsetHeight);
    console.log('deltaY', ui.y);
    // console.log('sensitivityFactor', sensitivityFactor);

    const mathMax = Math.abs(ui.y * sensitivityFactor);
    const secondPart = containerHeight - handleRef.current!.offsetHeight;
    console.log('mathMax', mathMax);
    console.log('secondPart', secondPart);
    const denominator = containerHeight * 100;
    console.log('denominator', denominator);

    const numerator = Math.min(mathMax, secondPart);
    console.log('mathMin', numerator);

    const finalResult = numerator / denominator;
    console.log('finalResult', finalResult);

    // const newTopDivHeight = `${mathMin} / containerHeight * 100}%`;
    const newTopDivHeight = `${Math.min(Math.max(0, ui.y * sensitivityFactor), containerHeight - handleRef.current!.offsetHeight)} / containerHeight * 100}%`;
    // console.log('newTopDivHeight', newTopDivHeight);
    setTopDivHeight(newTopDivHeight);

    console.log('parseFloat(topDivHeight)', parseFloat(newTopDivHeight));

  };

  console.log('topDivHeight', topDivHeight);
  
  return (
    <div id='top-container' className="container">
      <div id='top-div' className="top-div" style={{ height: topDivHeight }} />
      <Draggable
        axis="y"
        onDrag={handleDrag}
        handle=".handle"
        position={{ x: 0, y: parseFloat(topDivHeight) }} // Adjust position based on topDivHeight
      >
        <div ref={handleRef} className="handle">||</div>
      </Draggable>
      <div id='bottom-div' className="bottom-div" style={{ height: `calc(100% - ${topDivHeight})` }} />
    </div>
  );
};

export default ResizableContainer;
