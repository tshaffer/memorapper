import { LoadScript } from '@react-google-maps/api';

const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
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
