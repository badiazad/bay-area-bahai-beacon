import { useState, useEffect } from "react";
import EventMiniMap from "./EventMiniMap";

interface EventLocationSectionProps {
  location: string;
  address?: string;
  className?: string;
}

const EventLocationSection = ({ location, address, className = "" }: EventLocationSectionProps) => {
  const [shouldShowLocation, setShouldShowLocation] = useState(false);

  useEffect(() => {
    // Check if we have a valid location that's more than just a generic term
    const searchLocation = address || location;
    const isValidLocation = searchLocation && 
      searchLocation.trim().length >= 5 && 
      !searchLocation.toLowerCase().includes('tbd') &&
      !searchLocation.toLowerCase().includes('to be determined') &&
      searchLocation.toLowerCase() !== 'online' &&
      searchLocation.toLowerCase() !== 'virtual';
    
    setShouldShowLocation(!!isValidLocation);
  }, [location, address]);

  if (!shouldShowLocation) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium">Location</h4>
      <EventMiniMap 
        location={location} 
        address={address}
        className="w-full h-24"
      />
    </div>
  );
};

export default EventLocationSection;