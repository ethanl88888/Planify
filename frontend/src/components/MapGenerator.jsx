import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropTypes from 'prop-types';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Function to initialize the map with markers
const initializeMap = (mapContainer, coordinates) => {
  if (coordinates.length === 0) {
    return null;
  }

  const initialMap = new maplibregl.Map({
    container: mapContainer,
    style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyKey}`,
    center: coordinates[0], // Center on the first location
    zoom: 10 // Zoom level can be adjusted as needed
  });

  coordinates.forEach(coord => {
    new maplibregl.Marker().setLngLat(coord).addTo(initialMap);
  });

  return initialMap;
};

const MapWithMarkers = ({ coordinates }) => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    if (mapContainer.current && !map) {
      const newMap = initializeMap(mapContainer.current, coordinates);
      setMap(newMap);
    }

    return () => map?.remove();
  }, [coordinates]);

  return <div ref={mapContainer} style={{ height: '100vh', width: '100vw' }} />;
};

MapWithMarkers.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
};

export default MapWithMarkers;