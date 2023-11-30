import React from 'react';
import { useLocation } from 'react-router-dom';

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

  return (
    <div id="new-plan">
      <h1>Generated Itinerary</h1>
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
    </div>
  );
}

export default NewPlan;

