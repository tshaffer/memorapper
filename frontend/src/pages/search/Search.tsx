import React, { useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

const Search = () => {
  const [overlayHeight, setOverlayHeight] = useState(300); // Initial overlay height
  const [maxHeight, setMaxHeight] = useState(window.innerHeight - 100); // Dynamic maximum height
  const minHeight = 100; // Minimum overlay height

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

    // Update maxHeight dynamically if the window resizes
    useEffect(() => {
      const handleResize = () => setMaxHeight(window.innerHeight - 100);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    // Handle drag event to adjust overlay height
    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
      const newHeight = overlayHeight - data.deltaY;
  
      // Clamp the height within bounds
      const clampedHeight = Math.min(maxHeight, Math.max(minHeight, newHeight));
  
      // Log diagnostics
      console.log(`Current overlayHeight: ${overlayHeight}`);
      console.log(`deltaY: ${data.deltaY}`);
      console.log(`Calculated newHeight: ${newHeight}`);
      console.log(`Clamped newHeight: ${clampedHeight}`);
  
      setOverlayHeight(clampedHeight);
    };
  
  
    return (
      <div style={{ height: '100vh', position: 'relative' }}>
        {/* Map Layer */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, background: '#e0e0e0' }}>
          <div>Map Placeholder</div>
        </div>
  
        {/* Search Area UI */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, background: '#fff', padding: '16px' }}>
          <input
            type="text"
            placeholder="Search area"
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <button onClick={() => console.log('Reset to Current Location')}>Current Location</button>
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
            display: 'flex',
            flexDirection: 'column',
            transition: 'height 0.1s ease-out', // Smooth transition for better UI experience
          }}
        >
          {/* Drag Handle */}
          <Draggable
            axis="y"
            bounds={{
              top: -(overlayHeight - minHeight),
              bottom: maxHeight - overlayHeight,
            }}
            onDrag={handleDrag}
          >
            <div
              style={{
                height: '40px',
                background: '#ddd',
                cursor: 'ns-resize',
                textAlign: 'center',
                lineHeight: '40px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                userSelect: 'none',
              }}
            >
              •••
            </div>
          </Draggable>
  
          {/* Overlay Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <div>Filters go here</div>
            <ul>
              <li>Restaurant 1</li>
              <li>Restaurant 2</li>
              <li>Restaurant 3</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

export default Search;
