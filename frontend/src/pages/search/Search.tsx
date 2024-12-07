import React, { useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';

const VerticalResizer: React.FC = () => {
  const [topHeight, setTopHeight] = useState(200); // Initial height for the top div
  const [bottomHeight, setBottomHeight] = useState(200); // Initial height for the bottom div

  const containerHeight = 400; // Total height of the container

  const handleDrag: DraggableEventHandler = (_, data) => {
    const newTopHeight = Math.max(50, Math.min(topHeight + data.deltaY, containerHeight - 50));
    setTopHeight(newTopHeight);
    setBottomHeight(containerHeight - newTopHeight); // Adjust bottom height accordingly
  };

  return (
    <div
      style={{
        height: `${containerHeight}px`,
        border: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Div */}
      <div
        style={{
          height: `${topHeight}px`,
          background: '#f0f0f0',
          overflow: 'auto',
        }}
      >
        Top Content
      </div>

      {/* Drag Handle */}
      <DraggableCore onDrag={handleDrag}>
        <div
          style={{
            height: '10px',
            background: '#ccc',
            cursor: 'row-resize',
            userSelect: 'none',
          }}
        />
      </DraggableCore>

      {/* Bottom Div */}
      <div
        style={{
          height: `${bottomHeight}px`,
          background: '#e0e0e0',
          overflow: 'auto',
        }}
      >
        Bottom Content
      </div>
    </div>
  );
};

export default VerticalResizer;
