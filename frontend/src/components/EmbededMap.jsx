import React, { useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropTypes from 'prop-types';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MapWithMarkers = ({ destinations }) => {
  // console.log(destinations)
  const [map, setMap] = useState(null);
  const mapContainer = React.useRef(null);

  const offsetCoordinate = (coordinates) => {
    const offsetXPercent = 1.002;
    const [x, y] = coordinates;
    const offsetX = x * offsetXPercent;
    return [offsetX, y];
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Initialize the map with the center set to the coordinates of the first destination
        const initialMap = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyKey}`,
          center: offsetCoordinate(destinations[0]),
          zoom: 10, // You can adjust the zoom level as needed
        });

        initialMap.on('load', () => {
          setMap(initialMap);
        });

        destinations.forEach(destination => {
          const marker = new maplibregl.Marker().setLngLat(destination).addTo(initialMap);
        });
      } catch (error) {
        console.error('Error fetching geocode data:', error);
      }
    };

    if (mapContainer.current && !map) {
      initializeMap();
    }

    return () => map?.remove();
  }, [map, destinations]);

  return <div ref={mapContainer} style={{ height: '100vh', width: '100vw' }} />;
};

MapWithMarkers.propTypes = {
  destinations: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

export default MapWithMarkers;
