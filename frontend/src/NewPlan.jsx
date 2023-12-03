import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MapWithMarkers from './components/EmbededMap';
import Bar from './components/Bar';
import { Box } from '@chakra-ui/react';
import Fuse from 'fuse.js';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

function NewPlan() {
  const location = useLocation();
  const [locationData, setLocationData] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null)
  const [locationsMapping, setLocationsMapping] = useState({})
  const [fuse, setFuse] = useState(null);  // Add this line

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

  const url = `https://api.geoapify.com/v1/batch/geocode/search?apiKey=${geoapifyKey}`;

  function getBodyAndStatus(response) {
    return response.json().then(responceBody => {
      return {
        status: response.status,
        body: responceBody
      }
    });
  }

  function getAsyncResult(url, timeout, maxAttempt) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        repeatUntilSuccess(resolve, reject, 0)
      }, timeout);
    });

    function repeatUntilSuccess(resolve, reject, attempt) {
      console.log("Attempt: " + attempt);
      fetch(url)
        .then(getBodyAndStatus)
        .then(result => {
          if (result.status === 200) {
            resolve(result.body);
          } else if (attempt >= maxAttempt) {
            reject("Max amount of attempts achieved");
          } else if (result.status === 202) {
            // Check again after timeout
            setTimeout(() => {
              repeatUntilSuccess(resolve, reject, attempt + 1)
            }, timeout);
          } else {
            // Something went wrong
            reject(result.body)
          }
        })
        .catch(err => reject(err));
    };
  }

  async function fetchData() {
    try {
      const result = await fetch(url, {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uniqueLocations)
      }).then(getBodyAndStatus);

      if (result.status !== 202) {
        throw result;
      }

      console.log("Job ID: " + result.body.id);
      console.log("Job URL: " + result.body.url);

      const queryResult = await getAsyncResult(`${url}&id=${result.body.id}`, 1 * 1000 /*check every second*/, 100 /*max number of attempts*/);

      // console.log(queryResult);

      // Do something with queryResult, you can assign it to a state variable or use it as needed
      // For example, setQueryResult(queryResult);

      return queryResult; // Return the queryResult here
    } catch (err) {
      console.log(err);
      throw err; // Rethrow the error if needed
    }
  }

  // Call the function and handle the returned value
  useEffect(() => {
    fetchData()
      .then((result) => {
        const locations = result.map((location) => ({
          name: location.formatted,
          coordinates: [location.lon, location.lat]
        }));

        setLocationData(locations.map(loc => loc.coordinates));
        // console.log(locationData);

        const mapping = {};
        locations.forEach(loc => {
          mapping[loc.name] = loc.coordinates;
        })
        setLocationsMapping(mapping);

        const fuseInstance = new Fuse(locations, {
          keys: ['name'],
        });
        setFuse(fuseInstance);
      })
      .catch((error) => {
        // Handle errors here
      });
  }, []); // Empty dependency array to run the effect only once

  // Render only when locationData is loaded
  if (!locationData) {
    return <p>Loading...</p>;
  }

  const handleLocationNameClick = (locationName) => {
    if (fuse) {
      const searchResults = fuse.search(locationName);
      if (searchResults.length > 0) {
        const coordinates = searchResults[0].item.coordinates;
        setActiveLocation(coordinates);
      }
    }
  }

  return (
    <div id="new-plan">
      <Bar />
      <MapWithMarkers destinations={locationData} activeLocation={activeLocation} />
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
                <p onClick={() => handleLocationNameClick(itinerary[date][time].location)} style={{ cursor: "pointer" }}>
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

