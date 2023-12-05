import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapWithMarkers from './components/EmbededMap';
import Bar from './components/Bar';
import { Box, Button, Input, useToast, IconButton, Text } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import Fuse from 'fuse.js';
import axios from 'axios';
import LocationInput from './components/LocationInput';

const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;

function Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const assistantMessage = location.state?.assistantMessage;
  const id = location.state?.id;
  const itineraryName = location.state?.name;

  if (assistantMessage == null) {
    return <p>Error: Itinerary not generated</p>
  }

  const [itinerary, setItinerary] = useState(JSON.parse(assistantMessage));
  const uniqueLocations = Array.from(
    new Set(
      Object.values(itinerary).flatMap((timeSlots) =>
        Object.values(timeSlots).map((event) => event.location)
      )
    )
  );
  const [locationData, setLocationData] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [locationsMapping, setLocationsMapping] = useState({});
  const [fuse, setFuse] = useState(null);
  const [itineraryDisplay, setItineraryDisplay] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [addingEvent, setAddingEvent] = useState(null);
  const [finishEditingClicked, setFinishEditingClicked] = useState(false);
  const [addEventClicked, setAddEventClicked] = useState(false);
  const [dateInput, setDateInput] = useState(null);
  const [timeInput, setTimeInput] = useState(null);
  const [changedTime, setChangedTime] = useState(null);
  const [changedEvent, setChangedEvent] = useState(null);
  const [changedLocation, setChangedLocation] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {

        if (location.state?.mapping != null) {
          const mappingToUse = JSON.parse(location.state?.mapping);
          const locations = Object.entries(mappingToUse).map(([name, coordinates]) => ({
            name,
            coordinates,
          }));

          setLocationData(locations.map((loc) => loc.coordinates));

          // const mapping = {};
          // locations.forEach((loc) => {
          //   mapping[loc.name] = loc.coordinates;
          // });
          setLocationsMapping(mappingToUse);

          const fuseInstance = new Fuse(locations, {
            keys: ['name'],
          });
          setFuse(fuseInstance)
        } else {
          if (!toast.isActive('map-loading')) {
            toast({
              id: 'map-loading',
              title: 'Plan successfully generated. Loading map...',
              status: 'loading',
              duration: null,
              isClosable: true,
            });
          }

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

          async function fetchData() {
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
          const queryResult = await fetchData();

          toast.closeAll();
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

  const handleAddClick = () => {
    setAddingEvent(!addingEvent);
    setEditingEvent(false);
  }

  useEffect(() => {
    if (addEventClicked) {
      if (changedTime == null || changedEvent == null || changedLocation == null) {
        setAddEventClicked(false);
        toast({
          title: 'Error: Please fill in all fields before adding event',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } else {
        setItinerary(() => {
          let updatedItinerary = { ...itinerary };
          console.log(changedTime)

          const [dateSplit, timeSplit] = changedTime.split('T');
          console.log(dateSplit)

          const [hours, minutes] = timeSplit.split(':');
          const time12 = new Date(0, 0, 0, hours, minutes);
          const options = { hour: 'numeric', minute: 'numeric', hour12: true };
          const newTime = time12.toLocaleTimeString('en-US', options);

          if (!updatedItinerary[dateSplit]) {
            updatedItinerary[dateSplit] = {};
          }

          updatedItinerary[dateSplit][newTime] = {
            event: changedEvent,
            location: changedLocation,
          };
          return updatedItinerary;
        });
        
        // Reset the editing state
        setAddingEvent(null);
        setChangedTime(null);
        setChangedEvent(null);
        setChangedLocation(null);
        setAddEventClicked(false);
        toast({
          title: 'Event sucessfully added.',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    }
  }, [addEventClicked, changedTime, changedEvent, changedLocation]);

  const handleEditClick = (date, time) => {
    setEditingEvent(!editingEvent)
    setAddingEvent(false);
    setEditingBox({ date, time });
  }

  useEffect(() => {
    if (finishEditingClicked) {
      setItinerary(() => {
        let updatedItinerary = { ...itinerary };
        let editedEvent = updatedItinerary[dateInput][timeInput];

        if (changedTime != null) {
          const [dateSplit, timeSplit] = changedTime.split('T');

          const [hours, minutes] = timeSplit.split(':');
          const time12 = new Date(0, 0, 0, hours, minutes);
          const options = { hour: 'numeric', minute: 'numeric', hour12: true };
          const newTime = time12.toLocaleTimeString('en-US', options);

          updatedItinerary[dateSplit] = { ...itinerary[dateSplit], [newTime]: editedEvent };
          
          const updatedDate = Object.keys(updatedItinerary[dateInput]).reduce((object, key) => {
            if (key !== timeInput) {
              object[key] = updatedItinerary[dateInput][key];
            }
            return object;
          }, {})

          updatedItinerary[dateInput] = updatedDate;

          if (Object.keys(updatedItinerary[dateInput]).length == 0) {
            delete updatedItinerary[dateInput]
          }
          editedEvent = updatedItinerary[dateSplit][newTime];
        }
        if (changedEvent != null) {
          editedEvent.event = changedEvent;
        }
        if (changedLocation != null) {
          editedEvent.location = changedLocation;
        }

        return updatedItinerary;
      });
      
      // Reset the editing state
      setEditingEvent(null);
      setEditingBox(null);
      setChangedTime(null);
      setChangedEvent(null);
      setChangedLocation(null);
      setFinishEditingClicked(false);
      toast({
        title: 'Event sucessfully edited.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }
  }, [finishEditingClicked, changedTime, changedEvent, changedLocation, dateInput, timeInput]);

  const handleDeleteClick = (date, time) => {
    // Create a copy of the itinerary
    let updatedItinerary = { ...itinerary };

    // Delete the specified item
    delete updatedItinerary[date][time];
    console.log(updatedItinerary[date])

    if (Object.keys(updatedItinerary[date]).length == 0) {
      delete updatedItinerary[date];
    }

    // Update the state to trigger a re-render
    setItinerary(updatedItinerary);
    toast({
      title: 'Event sucessfully deleted.',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  const handleSubmit = async () => {
    const itinerary_name = itineraryName == null ? document.getElementById('planNameInput').value : itineraryName;
    const storedToken = localStorage.getItem('token');
  
    if (!storedToken) {
      toast({
        title: 'Error: You must be logged in to save a plan',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    if (!itinerary_name) {
      toast({
        title: 'Error: Plan must have a name before saving',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
  
    if (location.state?.image_url == null) {
      try {
        let config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `https://api.pexels.com/v1/search?query=${uniqueLocations[0]}&orientation=square&per_page=20`,
          headers: {
            'Authorization': pexelsKey,
          }
        };
        axios.request(config)
          .then((response) => {
            const randomIndex = Math.floor(Math.random() * Math.min(response.data.total_results, 20)) - 1;
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
              locationsMapping: JSON.stringify(locationsMapping),
              id: id
            })
              .then((response) => {
                // Handle success
                toast({
                  title: 'Success',
                  description: 'Itinerary saved successfully.',
                  status: 'success',
                  duration: 3000,
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
                  duration: 3000,
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
          duration: 3000,
          isClosable: true
        });
      }
    } else {
      try {
        // Make the POST request without including the image_url
        const response = await axios.post('http://localhost:3003/create-itinerary', {
          token: storedToken,
          date_modified: new Date(),
          itinerary_name: itinerary_name,
          plan: JSON.stringify(itinerary),
          image_url: location.state?.image_url,
          locationsMapping: JSON.stringify(locationsMapping),
          id: id
        });

        // Handle success
        toast({
          title: 'Success',
          description: 'Itinerary saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        navigate('/my-plans');
      } catch (error) {
        // Handle errors from the server
        console.error('Error saving itinerary:', error);

        // Show an error toastEditingEvent
        toast({
          title: 'Error',
          description: 'An error occurred while saving the itinerary.',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    }
  }

  const addDisplay = () => {
    if (addingEvent) {
      return (
        <Box>
          <Input type="datetime-local" value={changedTime} onChange={(e) => setChangedTime(e.target.value)} />
          <Input placeholder="Event" value={changedEvent} onChange={(e) => setChangedEvent(e.target.value)} />
          <LocationInput value={changedLocation} onChange={(e) => setChangedLocation(e)} />
          <Button
            mb={6}
            bg="#209fb5"
            onClick={() => {
              setAddEventClicked(true)
            }
            }
          >
            Submit
          </Button>
        </Box>
      );
    } else {
      return <></>;
    }
  }

  const editDisplay = (date, time) => {
    if (editingEvent && editingBox && editingBox.date === date && editingBox.time === time) {
      return (
        <Box>
          <Input type="datetime-local" value={changedTime} onChange={(e) => setChangedTime(e.target.value)} />
          <Input placeholder="Event" value={changedEvent} onChange={(e) => setChangedEvent(e.target.value)} />
          <LocationInput value={changedLocation} onChange={(e) => setChangedLocation(e)} />
          <Button
            mb={6}
            bg="#209fb5"
            onClick={() => {
              setDateInput(date)
              setTimeInput(time)
              setFinishEditingClicked(true)
            }
            }
          >
            Finish edit
          </Button>
        </Box>
      );
    } else {
      return <></>;
    }
  }

  useEffect(() => {
    console.log(itinerary);
  }, [itinerary])

  useEffect(() => {
    setItineraryDisplay(() => {
      const sortedDates = Object.keys(itinerary).sort((a, b) => new Date(a) - new Date(b));
      const sortedItinerary = {};
  
      sortedDates.forEach((date) => {
        // Sort times for each date
        const sortedTimes = Object.keys(itinerary[date]).sort((a, b) => {
          // Custom sorting function to handle AM/PM correctly
          const timeA = new Date(`${date} ${a}`);
          const timeB = new Date(`${date} ${b}`);
          return timeA - timeB;
        });
  
        sortedItinerary[date] = {};
        sortedTimes.forEach((time) => {
          sortedItinerary[date][time] = itinerary[date][time];
        });
      });
  
      return (
        <Box>
          {sortedDates.map((date) => (
            <div key={date}>
              <Text marginTop="8px" marginBottom="8px">{date}</Text>
              {Object.keys(sortedItinerary[date]).map((time) => (
                <Box
                  key={time}
                  borderWidth="1px"
                  borderRadius="12px"
                  position="relative"
                  _hover={{ bgColor: 'gray.100' }}
                  height="auto"
                >
                  <h3>{time}</h3>
                  <p>
                    <strong>Event:</strong> {sortedItinerary[date][time].event}
                  </p>
                  <p onClick={() => handleLocationNameClick(sortedItinerary[date][time].location)} style={{ cursor: "pointer" }}>
                    <strong>Location:</strong> {sortedItinerary[date][time].location}
                  </p>
                  <Box display="flex" flexDir="column" height="100%" justifyContent="space-between" position="absolute" top="0" right="0" p="2">
                    <EditIcon
                      color="orange"
                      onClick={() => handleEditClick(date, time)}
                      style={{ cursor: "pointer" }}
                    />
                    <DeleteIcon
                      color="red"
                      onClick={() => handleDeleteClick(date, time)}
                      style={{ cursor: "pointer" }}
                    />
                  </Box>
                  {editDisplay(date, time)}
                </Box>
              ))}
            </div>
          ))}
        </Box>
      );
    });
  }, [itinerary, editingBox, fuse, editingEvent, addingEvent]);
  
  const heading = () => {
    if (itineraryName == null) {
      return <Input id="planNameInput" placeholder="Give your plan a name" />
    } else {
      return <Text fontWeight="bold" fontSize="35px">{itineraryName}</Text>
    }
  }
  
  return (
    <div id="new-plan">
      <Bar />
      <MapWithMarkers destinations={locationsMapping} activeLocation={activeLocation} />
      <Box display="flex" flexDir="column" padding="42px" position="fixed" top="12%" right="2%" width="42%" height="83%" borderWidth="3px" borderRadius="12px" overflow="scroll" bgColor="white">
        <Box display="flex" flexDir="row" justifyContent="space-between">
          {heading()}
          <Button
            mb={6}
            bg="#209fb5"
            padding="20px"
            onClick={handleSubmit}
          >
            Save Itinerary
          </Button>
        </Box>
        <Button
          mb={6}
          bg="green"
          // width="100px"
          alignSelf="center"
          margin="0px"
          padding="10px"
          onClick={handleAddClick}
        >
          Add Event
        </Button>
        {addDisplay()}
        {itineraryDisplay}
      </Box>
    </div>
  );
}

export default Plan;

