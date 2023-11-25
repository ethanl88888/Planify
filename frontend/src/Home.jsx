import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import Bar from './components/Bar';
import home_cover from '/home_cover.jpg';
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from '@chakra-ui/react';
import LocationInput from './components/LocationInput';

const activitiesOptions = [
  'Sightseeing',
  'Hiking',
  'Beach',
  'Water-based activities',
  'Cultural experiences',
  'Historical exploration',
  'Shopping',
  'Culinary tours',
  'Relaxation and spa',
  'Photography',
  'Festivals and events',
  'Snow-based activities',
  'Road trips',
  'Cruises',
  'Wine tours',
  'Volunteering',
  'Amusement parks',
  'Nightlife',
  'Camping',
];

function Home() {
  const [destinations, setDestinations] = useState([{ id: 1, isVisible: true }]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDestinationChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { id: index + 1, value, isVisible: true };
    setDestinations(newDestinations);
  };

  const handleRemoveDestination = (index) => {
    if (destinations.length > 1) {
      const newDestinations = [...destinations];
      newDestinations.splice(index, 1);
      setDestinations(newDestinations);
    }
  };

  const handleAddDestination = () => {
    setDestinations([...destinations, { id: destinations.length + 1, isVisible: true }]);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleActivityChange = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((selected) => selected !== activity));
    } else {
      setSelectedActivities([activity, ...selectedActivities]);
    }
  };

  const handleSubmit = () => {
    // Gather destination information
    const destinationsData = destinations.map((dest) => ({
      value: dest.value,
      dateVisiting: dest.dateVisiting,
    }));
  
    // Gather other information
    const firstDay = document.getElementById('firstDay').value;
    const lastDay = document.getElementById('lastDay').value;
    const budget = document.getElementById('budget').value;
    const people = document.getElementById('numPeople').value;
  
    // Construct the data object to send to the server
    const data = {
      destinations: destinationsData,
      firstDay,
      lastDay,
      budget,
      people,
      activities: selectedActivities,
    };
  
    // Make a POST request to the server
    axios
      .post('http://localhost:3003/create-itinerary', data)
      .then((response) => {
        console.log(response.data); // Log the server response
        // Handle any additional logic or UI updates as needed
      })
      .catch((error) => {
        console.error('Error submitting itinerary:', error);
        // Handle errors or display an error message to the user
      });
  };

  return (
    <div id="home">
      <Box position="relative" zIndex="1">
        <Bar />
      </Box>
      <Box id="home-container" position="absolute" top="7%" width="100%" display="flex" flexDirection="column" justifyContent="space-between">
        <Flex id="home-main" flexDirection="row" maxHeight="80%">
          <Flex
            id="home-main-left"
            position="relative"
            flexDirection="column"
            width="60%"
            max-height="30%"
            alignItems="center"
            justifyContent="center"
          >
            <Image src={home_cover} alt="Home Cover Image" boxSize="100%" objectFit="cover" height="88%" objectPosition="0 90%" zIndex="-1" />
            <Box position="absolute" top="17%" left="50%" transform="translate(-50%, -50%)">
              <Heading textAlign="center" color="#f49542" fontSize="55px">
                Let's Plan <br /> Your Next Trip.
              </Heading>
            </Box>
          </Flex>
          <Flex id="home-main-right" margin="7%" width="30%" border="3px solid #fec287" borderRadius="18px" flexDirection="column">
            {destinations.map((destination, index) => (
              <Flex key={destination.id} id={`destination-input-${destination.id}`} flexDirection="row">
                <LocationInput onChange={(value) => handleDestinationChange(index, value)} />
                <Flex flexDirection="column">
                  <Text>Date visiting (optional)</Text>
                  <Input type="date" />
                </Flex>
                {destinations.length > 1 && (
                  <Box>
                    <button onClick={() => handleRemoveDestination(index)}>Remove</button>
                  </Box>
                )}
              </Flex>
            ))}
            <Box>
              <button onClick={handleAddDestination}>Add Destination</button>
            </Box>
            <Flex flexDirection="row" id="dates-input">
              <Flex flexDirection="column">
                <Text>First Day</Text>
                <Input placeholder="First Day" type="date" />
              </Flex>
              <Flex flexDirection="column">
                <Text>Last Day</Text>
                <Input placeholder="Last Day" type="date" />
              </Flex>
            </Flex>
            <Flex id="budget-input" flexDirection="column">
              <Text>Budget</Text>
              <NumberInput min={0}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Flex id="num-people-input" flexDirection="column">
              <Text>Number of People</Text>
              <NumberInput min={0}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Flex flexDirection="row" id="activities-dropdown">
              <Select
                placeholder={selectedActivities.length > 0 ? selectedActivities.join(', ') : 'Select activities'}
                value={selectedActivities.join(', ')}
                onChange={(e) => handleActivityChange(e.target.value)}
                onClick={toggleDropdown}
                isOpen={isDropdownOpen}
              >
                {activitiesOptions.map((activity) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </Select>
            </Flex>
            <Flex flexDirection="row" id="submit-button" justifyContent="center" mt="4">
              <button onClick={handleSubmit}>Submit Itinerary</button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
}

export default Home

