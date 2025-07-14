import { useEffect, useRef } from "react";

interface EventMiniMapProps {
  location: string;
  address?: string;
  className?: string;
}

const EventMiniMap = ({ location, address, className = "" }: EventMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !(window as any).google?.maps) {
        console.log("Google Maps not available");
        return;
      }

      const geocoder = new (window as any).google.maps.Geocoder();
      const searchLocation = address || location;

      geocoder.geocode({ address: searchLocation }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const position = results[0].geometry.location;
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(position);
            // Clear existing markers
            if (mapInstanceRef.current.marker) {
              mapInstanceRef.current.marker.setMap(null);
            }
          } else {
            // Create new map
            mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
              zoom: 15,
              center: position,
              disableDefaultUI: true,
              zoomControl: false,
              scrollwheel: false,
              draggable: false,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            });
          }

          // Add marker
          mapInstanceRef.current.marker = new (window as any).google.maps.Marker({
            position: position,
            map: mapInstanceRef.current,
            title: location,
          });
        } else {
          console.error('Geocoding failed:', status);
        }
      });
    };

    // Check if Google Maps is loaded
    if ((window as any).google?.maps) {
      initMap();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      // Clean up after 10 seconds
      setTimeout(() => clearInterval(checkGoogleMaps), 10000);
    }

    return () => {
      if (mapInstanceRef.current?.marker) {
        mapInstanceRef.current.marker.setMap(null);
      }
    };
  }, [location, address]);

  return (
    <div 
      ref={mapRef} 
      className={`rounded-md bg-muted ${className}`}
      style={{ minHeight: '120px' }}
    />
  );
};

export default EventMiniMap;