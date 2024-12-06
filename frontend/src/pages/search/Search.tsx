import React, { useState } from 'react';

const Search = () => {
  const [searchArea, setSearchArea] = useState('Current Location');
  const [overlayHeight, setOverlayHeight] = useState(300); // Initial height of overlayed UI

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const startY = event.clientY;
    const startHeight = overlayHeight;

    const handleMouseMove = (event: MouseEvent) => {
      const newHeight = startHeight + startY - event.clientY;
      handleDrag(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  const handleDrag = (newHeight: number) => {
    setOverlayHeight(newHeight);
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Map Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        {/* Replace with your map component */}
        {/* <MapComponent /> */}
        pizza
      </div>

      {/* Search Area UI */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, background: '#fff', padding: '16px' }}>
        <input
          type="text"
          value={searchArea}
          onChange={(e) => setSearchArea(e.target.value)}
          placeholder="Search area"
        />
        <button onClick={() => setSearchArea('Current Location')}>Current Location</button>
      </div>

      {/* Overlayed UI */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${overlayHeight}px`,
          zIndex: 2,
          background: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
      >
        <div style={{ height: '40px', cursor: 'grab', textAlign: 'center' }} onMouseDown={handleMouseDown}>
          <span>•••</span> {/* Drag Handle */}
        </div>
        <div>
          {/* Filters */}
          <div>Filter Row (Add filters here)</div>

          {/* List of Restaurants */}
          <div>Restaurant List (Add list items here)</div>
        </div>
      </div>
    </div>
  );
};

export default Search;
