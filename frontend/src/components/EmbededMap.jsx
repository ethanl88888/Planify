import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropTypes from 'prop-types';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MapWithMarkers = ({ destinations, activeLocation }) => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [markers, setMarkers] = useState([]);

  const offsetCoordinate = (coordinates, zoom) => {
    const offsetXPercent = 1 + (3 * (10 ** (-zoom / 3)));
    const [x, y] = coordinates;
    const offsetX = x * offsetXPercent;
    return [offsetX, y];
  };

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Initialize the map with the center set to the coordinates of the first destination
        const initialMap = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyKey}`,
          center: offsetCoordinate(Object.values(destinations)[0], 10),
          zoom: 10,
        });

        const removeMarkers = () => {
          // Remove markers from the map
          initialMap.getStyle().layers.forEach((layer) => {
            if (layer.id.includes('marker')) {
              initialMap.removeLayer(layer.id);
              initialMap.removeSource(layer.id);
            }
          });
        };

        initialMap.on('load', () => {
          if (isMounted) {
            setMap(initialMap);
          }
        });


        const markersArray = [];
        Object.values(destinations).forEach((destination) => {
          const marker = new maplibregl.Marker()
            .setLngLat(destination)
            .addTo(initialMap)
            .setPopup(new maplibregl.Popup().setHTML(`<p>${Object.keys(destinations).find(key => destinations[key] == destination)}</p>`));
          markersArray.push(marker)
        });
        setMarkers(markersArray);

        // Clean up markers and map on component unmount
        return () => {
          isMounted = false;
          removeMarkers();
          initialMap.remove();
        };
      } catch (error) {
        console.error('Error fetching geocode data:', error);
      }
    };

    if (mapContainer.current && !map) {
      initializeMap();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations, activeLocation]);

  useEffect(() => {
    if (map && activeLocation) {
      let chosenMarker;
      for (const marker of markers) {
        const markerLngLat = marker._lngLat;
        if (
          markerLngLat &&
          markerLngLat.lng == activeLocation[0] &&
          markerLngLat.lat == activeLocation[1]
        ) {
          chosenMarker = marker;
        } else {
          marker.getPopup().remove();
        }
      }
      map.flyTo({
        center: offsetCoordinate(activeLocation, 12),
        zoom: 12,
        speed: 1,
        essential: true,
      });
      chosenMarker.togglePopup();
    }
  }, [map, activeLocation, destinations, markers]);

  return <div ref={mapContainer} style={{ height: '100vh', width: '100vw' }} />;
};

MapWithMarkers.propTypes = {
  destinations: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  activeLocation: PropTypes.arrayOf(PropTypes.number),
  flyToLocation: PropTypes.func,
};

export default MapWithMarkers;
