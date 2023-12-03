import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapWithMarkers from './components/EmbededMap';
import Bar from './components/Bar';
import { Box, Button, Input, useToast } from '@chakra-ui/react';
import Fuse from 'fuse.js';
import axios from 'axios';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;

function Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const assistantMessage = location.state?.assistantMessage;

  if (assistantMessage == null) {
    return <p>Error: Itinerary not generated</p>
  }

  const itinerary = JSON.parse(assistantMessage);
  const uniqueLocations = Array.from(
    new Set(
      Object.values(itinerary).flatMap((timeSlots) =>
        Object.values(timeSlots).map((event) => event.location)
      )
    )
  );

  const [locationData, setLocationData] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null)
  const [locationsMapping, setLocationsMapping] = useState({})
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let mappingToUse;

        if (location.state?.mapping != null) {
          mappingToUse = JSON.parse(location.state.mapping);
          const locations = Object.entries(mappingToUse).map(([name, coordinates]) => ({
            name,
            coordinates,
          }));

          setLocationData(locations.map((loc) => loc.coordinates));

          const mapping = {};
          locations.forEach((loc) => {
            mapping[loc.name] = loc.coordinates;
          });
          setLocationsMapping(mapping);

          const fuseInstance = new Fuse(locations, {
            keys: ['name'],
          });
          setFuse(fuseInstance);
        } else {
          const url = `https://api.geoapify.com/v1/batch/geocode/search?apiKey=${geoapifyKey}`;

          function getBodyAndStatus(response) {
            return response.json().then((responceBody) => {
              return {
                status: response.status,
                body: responceBody,
              };
            });
          }

          function getAsyncResult(url, timeout, maxAttempt) {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                repeatUntilSuccess(resolve, reject, 0);
              }, timeout);
            });

            function repeatUntilSuccess(resolve, reject, attempt) {
              console.log("Attempt: " + attempt);
              fetch(url)
                .then(getBodyAndStatus)
                .then((result) => {
                  if (result.status === 200) {
                    resolve(result.body);
                  } else if (attempt >= maxAttempt) {
                    reject("Max amount of attempts achieved");
                  } else if (result.status === 202) {
                    // Check again after timeout
                    setTimeout(() => {
                      repeatUntilSuccess(resolve, reject, attempt + 1);
                    }, timeout);
                  } else {
                    // Something went wrong
                    reject(result.body);
                  }
                })
                .catch((err) => reject(err));
            }
          }

          async function fetchData1() {
            try {
              const result = await fetch(url, {
                method: "post",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(uniqueLocations),
              }).then(getBodyAndStatus);

              if (result.status !== 202) {
                throw result;
              }

              console.log("Job ID: " + result.body.id);
              console.log("Job URL: " + result.body.url);

              const queryResult = await getAsyncResult(
                `${url}&id=${result.body.id}`,
                1 * 1000 /*check every second*/,
                100 /*max number of attempts*/
              );

              return queryResult;
            } catch (err) {
              console.log(err);
              throw err;
            }
          }

          // Fetch data using the geocoding API
          const queryResult = await fetchData1();

          const locations = queryResult.map((location) => ({
            name: location.formatted,
            coordinates: [location.lon, location.lat],
          }));

          setLocationData(locations.map((loc) => loc.coordinates));

          const mapping = {};
          locations.forEach((loc) => {
            mapping[loc.name] = loc.coordinates;
          });
          setLocationsMapping(mapping);

          const fuseInstance = new Fuse(locations, {
            keys: ["name"],
          });
          setFuse(fuseInstance);
        }
      } catch (error) {
        // Handle errors here
      }
    }

    fetchData();
  }, [location.state?.mapping]);

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

  const handleSubmit = async () => {
    const itinerary_name = document.getElementById('planNameInput').value;
    const storedToken = localStorage.getItem('token');
  
    if (!storedToken) {
      toast({
        title: 'Error: You must be logged in to save a plan',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    if (!itinerary_name) {
      toast({
        title: 'Error: Plan must have a name before saving',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
  
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.pexels.com/v1/search?query=${uniqueLocations[0]}&orientation=square&per_page=50`,
        headers: {
          'Authorization': pexelsKey,
        }
      };
    
      axios.request(config)
        .then((response) => {
          const randomIndex = Math.floor(Math.random() * Math.min(response.data.total_results, 50)) - 1;
          console.log(response.data)
          console.log(randomIndex)
          // Get the original image URL from the randomly selected photo
          const image_url = response.data.photos[randomIndex].src.original;
    
          // Use the image_url in the rest of your code
          console.log(image_url);
    
          // Now, you can use the image_url in the axios.post request
          axios.post('http://localhost:3003/create-itinerary', {
            token: storedToken,
            date_modified: new Date(),
            itinerary_name: itinerary_name,
            plan: JSON.stringify(itinerary),
            image_url: image_url,
            locationsMapping: JSON.stringify(locationsMapping)
          })
            .then((response) => {
              // Handle success
              toast({
                title: 'Success',
                description: 'Itinerary saved successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true
              });
    
              navigate('/my-plans');
            })
            .catch((error) => {
              // Handle errors from the server
              console.error('Error saving itinerary:', error);
    
              // Show an error toast
              toast({
                title: 'Error',
                description: 'An error occurred while saving the itinerary.',
                status: 'error',
                duration: 5000,
                isClosable: true
              });
            });
        })
        .catch((error) => {
          // Handle errors from the image request
          console.error('Error fetching image:', error);
    
          // Set a default image_url in case of an error
          const image_url = 'image_not_found.png';
    
          // Continue with the rest of the code
          console.log(image_url);
        });
    } catch (error) {
      // Handle errors from the server
      console.error('Error saving itinerary:', error);
  
      // Show an error toast
      toast({
        title: 'Error',
        description: 'An error occurred while saving the itinerary.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };  

  return (
    <div id="new-plan">
      <Bar />
      <MapWithMarkers destinations={locationData} activeLocation={activeLocation} />
      <Box display="flex" flexDir="column" padding="42px" position="fixed" top="12%" right="2%" width="42%" height="83%" borderWidth="3px" borderRadius="12px" overflow="scroll" bgColor="white">
        <Box display="flex" flexDir="row">
          <Input id="planNameInput" placeholder="Give your plan a name" />
          <Button
            mb={6}
            bg="#209fb5"
            onClick={handleSubmit}
          >
            Save Itinerary
          </Button>
        </Box>
        <Box>
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
      </Box>
    </div>
  );
}

export default Plan;

