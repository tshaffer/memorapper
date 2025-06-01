import { useState } from 'react';
import '../styles/multiPanelStyles.css';
import { useMediaQuery } from "@mui/material";
import { useParams } from 'react-router-dom';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlaceType, MrPlace, MrPlaceWithGooglePlace } from '../types';
import MrPlaceEditor from './MrPlaceEditor';

const MrPlaceForm = () => {

  const { _id } = useParams<{ _id: string }>();
  console.log('NewPlaceForm _id:', _id);

  const [placeName, setPlaceName] = React.useState('');

  const initialPlaceData: MrPlace = {
    _idPlace: _id,
    placeId: uuidv4(),
    googlePlaceId: '',
    placeType: PlaceType.Restaurant,
    placeComments: '',
    mrPlaceReviews: [],
    mrPlaceSpecificities: {} as any, // Adjust this type as needed
  };

  const [place, setPlace] = useState<MrPlace>(initialPlaceData);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  interface MealAvailability {
    openForBreakfast: boolean;
    openForLunch: boolean;
    openForDinner: boolean;
  }

  const handleAddPlace = async (newPlace: MrPlaceWithGooglePlace): Promise<void> => {

    setIsLoading(true);

    try {
      console.log('handleAddPlace:', newPlace);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting place:', error);
      setIsLoading(false);
    }
  };

  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : 'auto',
        padding: '1rem',
      }}
    >
      <MrPlaceEditor
        onSubmit={ (place: MrPlaceWithGooglePlace) => {
          return handleAddPlace(place);
        }}
        onCancel={function () {
          console.log('Add place cancelled.');
        }}
      >
      </MrPlaceEditor>
    </div>
  );
};

export default MrPlaceForm;
