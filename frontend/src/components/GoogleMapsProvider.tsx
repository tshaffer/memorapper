import { LoadScript } from '@react-google-maps/api';

const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  console.log('GoogleMapsProvider, key:');
  console.log(import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY);
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
