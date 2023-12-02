import React from 'react';
import { useLocation } from 'react-router-dom';
import MapWithMarkers from './components/ArrayMap';
import Bar from './components/Bar';
import { Box } from '@chakra-ui/react';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

function NewPlan() {
  const location = useLocation();
  const assistantMessage = location.state?.assistantMessage || null;
  if (assistantMessage == null) {
    return <p>Error: Itinerary not generated</p>
  }

  if (!assistantMessage) {
    return <p>Error: Itinerary not generated</p>;
  }

  const itinerary = JSON.parse(assistantMessage);
  const uniqueLocations = Array.from(
    new Set(
      Object.values(itinerary).flatMap((timeSlots) =>
        Object.values(timeSlots).map((event) => event.location)
      )
    )
  );

  return (
    <div id="new-plan">
      <Bar />
      <MapWithMarkers destinations={uniqueLocations} />
      <Box position="fixed" top="12%" right="2%" width="42%" height="83%" borderWidth="3px" borderRadius="12px" overflow="scroll" bgColor="white">
        {Object.keys(itinerary).map((date) => (
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
        ))}
      </Box>
    </div>
  );
}

export default NewPlan;

