import React, { useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import PropTypes from 'prop-types';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MapWithMarkers = ({ destinations }) => {
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
        // Fetch geolocation data for the first destination
        const geocodeResponse = await axios.get('https://api.geoapify.com/v1/geocode/search', {
          params: {
            text: destinations[0],
            apiKey: geoapifyKey,
            limit: 1,
          },
        });

        if (geocodeResponse.data.features && geocodeResponse.data.features.length > 0) {
          const { coordinates } = geocodeResponse.data.features[0].geometry;

          // Initialize the map with the center set to the coordinates of the first destination
          const initialMap = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyKey}`,
            center: offsetCoordinate(coordinates),
            zoom: 10, // You can adjust the zoom level as needed
          });

          initialMap.on('load', () => {
            setMap(initialMap);
          });

          // Add markers for all destinations
          destinations.forEach(async (destination) => {
            try {
              const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
                params: {
                  text: destination,
                  apiKey: geoapifyKey,
                  limit: 1,
                },
              });

              if (response.data.features && response.data.features.length > 0) {
                const { coordinates } = response.data.features[0].geometry;
                const marker = new maplibregl.Marker().setLngLat(coordinates).addTo(initialMap);

                // Add a click event listener for each marker
                marker.getElement().addEventListener('click', () => {
                  // Trigger the provided onLocationClick function with the coordinates
                  onLocationClick(coordinates);
                });
              }
            } catch (error) {
              console.error('Error geocoding destination:', error);
            }
          });
        }
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
  destinations: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MapWithMarkers;
