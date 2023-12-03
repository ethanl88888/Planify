import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropTypes from 'prop-types';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MapWithMarkers = ({ destinations, activeLocation }) => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (mapContainer.current && !map) {
      const initialMap = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyKey}`,
        center: destinations[0], // Assuming destinations array is not empty
        zoom: 10,
      });

      initialMap.on('load', () => {
        setMap(initialMap);
        // Once the map is loaded, add markers for all destinations
        destinations.forEach((destination) => {
          new maplibregl.Marker().setLngLat(destination).addTo(initialMap);
        });
      });
    }
  }, [map]); // Depend on map only to avoid re-running this effect unnecessarily

  useEffect(() => {
    // When the active location changes, fly to that location
    if (map && activeLocation) {
      map.flyTo({
        center: activeLocation,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        zoom: 14,
      });
    }
  }, [map, activeLocation]); // Depend on map and activeLocation

  return <div ref={mapContainer} style={{ height: '100vh', width: '100vw' }} />;
};

MapWithMarkers.propTypes = {
  destinations: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  activeLocation: PropTypes.arrayOf(PropTypes.number), // activeLocation is optional
};

export default MapWithMarkers;
