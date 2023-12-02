import React, { useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import PropTypes from 'prop-types';

const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MapWithMarkers = ({ destinations }) => {
  const mapContainer = React.useRef(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      const coordinates = [];

      for (let destination of destinations) {
        try {
          const response = await axios.get(`https://api.geoapify.com/v1/geocode/search`, {
            params: {
              text: destination,
              apiKey: geoapifyApiKey,
              limit: 1
            }
          });

          if (response.data.features && response.data.features.length > 0) {
            const coord = response.data.features[0].geometry.coordinates;
            coordinates.push(coord);
          }
        } catch (error) {
          console.error('Error geocoding destination:', error);
        }
      }

      if (coordinates.length > 0) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        // Initialize and set up the map
        const initialMap = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyApiKey}`,
          bounds: bounds,
          padding: 20
        });

        coordinates.forEach((coord) => {
          new maplibregl.Marker()
            .setLngLat(coord)
            .addTo(initialMap);
        });
      }
    };

    if (mapContainer.current) {
      fetchDestinations();
    }
  }, [destinations]);

  return <div ref={mapContainer} style={{ height: '100vh', width: '100vw' }} />;
};

MapWithMarkers.propTypes = {
  destinations: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default MapWithMarkers;
