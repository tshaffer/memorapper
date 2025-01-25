import { LoadScript } from '@react-google-maps/api';

const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  console.log('GoogleMapsProvider: googleMapsApiKey:', import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!);
  console.log('GoogleMapsProvider: all environment properties:', import.meta.env);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!}
      libraries={['places']}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
