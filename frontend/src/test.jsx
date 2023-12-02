import React from 'react';
import { useLocation } from 'react-router-dom';
import MapWithMarkers from './components/ArrayMap'; // Make sure this component is the one we previously discussed
import 'maplibre-gl/dist/maplibre-gl.css';


function Test() {
  const location = useLocation();
  const assistantMessage = location.state?.assistantMessage || null;

  const itinerary = JSON.parse(assistantMessage);

  // Set up the destinations you want to display on the map
  const destinations = ['New York, USA', 'Paris, France', 'Shanghai, China'];

  return (
    <div id="new-plan">
      <div> {/* Set a height for the map container */}
        <MapWithMarkers destinations={destinations} />
      </div>
      {/* Rest of your itinerary display */}
      {/* {Object.keys(itinerary).map((date) => (
        <div key={date}>
          <h2>{date}</h2>
          {Object.keys(itinerary[date]).map((time) => (
            <div key={time}>
              <h3>{time}</h3>
              <p>
                <strong>Event:</strong> {itinerary[date][time].event}
              </p>
              <p>
                <strong>Location:</strong> {itinerary[date][time].location}
              </p>
            </div>
          ))}
        </div>
      ))} */}
    </div>
  );
}

export default Test;