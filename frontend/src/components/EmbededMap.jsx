import React, { useState, useEffect } from 'react';
import ReactMapGL from 'react-map-gl';
import PropTypes from 'prop-types';
import axios from 'axios';

const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MapComponent = ({ inputDestination }) => {
  const [viewport, setViewport] = useState({
    latitude: 37.7577, // Default latitude
    longitude: -122.4376, // Default longitude
    zoom: 11,
    width: '100vw',
    height: '100vh'
  });

  const mapStyle = `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyApiKey}`;

  // Function to geocode the input destination
  const geocodeDestination = async (destination) => {
    try {
      const response = await axios.get(`https://api.geoapify.com/v1/geocode/search`, {
        params: {
          text: destination,
          apiKey: geoapifyApiKey,
          limit: 1
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const { lat, lon } = response.data.results[0];
        setViewport(prevViewport => ({
          ...prevViewport,
          latitude: lat,
          longitude: lon
        }));
      }
    } catch (error) {
      console.error('Error geocoding the destination:', error);
    }
  };

  // Effect to geocode when inputDestination changes
  useEffect(() => {
    if (inputDestination) {
      geocodeDestination(inputDestination);
    }
  }, [inputDestination]);

  return (
    <div style={{ width: '300px', height: '200px', border: '1px solid #ccc', position: 'relative' }}>
      <ReactMapGL {...viewport} mapStyle={mapStyle} onViewportChange={setViewport}>
        {/* Markers or other components */}
      </ReactMapGL>
    </div>
  );
};

// PropType validation
MapComponent.propTypes = {
    inputDestination: PropTypes.string.isRequired
  };

export default MapComponent;
