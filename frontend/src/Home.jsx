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
  const [destinations, setDestinations] = useState([{ id: 1, value: '', dateVisiting: '' }]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstDay, setFirstDay] = useState('');
  const [lastDay, setLastDay] = useState('');
  const [budget, setBudget] = useState('');
  const [numPeople, setNumPeople] = useState('');

  const handleDestinationChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { id: index + 1, value, dateVisiting: '' };
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
    setDestinations([...destinations, { id: destinations.length + 1, value: '', dateVisiting: '' }]);
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
    try {
      // Gather destination information
      const destinationsData = destinations.map((dest) => ({
        destination: dest.value,
        dateVisiting: dest.dateVisiting,
      }));
  
      // Gather other information
      const firstDayElement = document.getElementById('firstDay');
      const lastDayElement = document.getElementById('lastDay');
      const budgetElement = document.getElementById('budget');
      const numPeopleElement = document.getElementById('numPeople');
  
      const firstDay = firstDayElement ? firstDayElement.value : '';
      const lastDay = lastDayElement ? lastDayElement.value : '';
      const budget = budgetElement ? budgetElement.value : '';
      const people = numPeopleElement ? numPeopleElement.value : '';
  
      // Construct the data object to send to the server
      const data = {
        token: localStorage.getItem('token'),
        destinations: destinationsData,
        firstDay,
        lastDay,
        budget,
        people,
        activities: selectedActivities,
      };
  
      console.log('Sending data:', data); // Log the data being sent
  
      // Make a POST request to the server
      axios
        .post('http://localhost:3003/create-itinerary', data)
        .then((response) => {
          console.log('Server response:', response.data); // Log the server response
          // Handle any additional logic or UI updates as needed
        })
        .catch((error) => {
          console.error('Error submitting itinerary:', error);
          // Handle errors or display an error message to the user
        });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };
  
  

  return (
    <div id="home">
      <Flex direction="column" align="center">
        <Box position="relative" zIndex="1" width="100%">
          <Bar />
        </Box>
        <Heading textAlign="center" color="#209fb5" fontSize="55px" mt={79}>
          Let's Plan Your Next Trip!
        </Heading>
      </Flex>
      <Box id="home-container" position="absolute" top="40%" width="100%" display="flex" flexDirection="column" justifyContent="space-between">
        <Flex id="home-main" flexDirection="row" maxHeight="80%">
          <Flex
            id="home-main-left"
            position="relative"
            flexDirection="column"
            width="60%"
            max-height="40%"
            alignItems="center"
            justifyContent="center"
            margin-top = "-50px"
          >
            <Image src={home_cover} alt="Home Cover Image" boxSize="100%" objectFit="cover" height="100%" objectPosition="30 90%" zIndex="-1" marginTop="-20" marginRight= "-50"/>
          </Flex>
          <Flex id="home-main-right" margin="8%" height = "100%" width="65%" border="3px solid #209fb5" borderRadius="18px" flexDirection="column">
            {destinations.map((destination, index) => (
              <Flex key={destination.id} id={`destination-input-${destination.id}`} flexDirection="row" p={7}>
                <LocationInput onChange={(value) => handleDestinationChange(index, value)} />
                <Flex flexDirection="column" ml={20} mt={-5}>
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
            <Box align="center" justifyContent="center" >
              <button onClick={handleAddDestination}>Add Destination</button>
            </Box>
            <Flex flexDirection="row" id="dates-input">
              <Flex flexDirection="column" flex ="1" p={5}>
                <Text>First Day</Text>
                <Input placeholder="First Day" type="date" />
              </Flex>
              <Flex flexDirection="column" flex="1" p={5}>
                <Text>Last Day</Text>
                <Input placeholder="Last Day" type="date" />
              </Flex>
            </Flex>
            <Flex id="budget-input" flexDirection="column" mt={-5} p={5}>
              <Text>Budget</Text>
              <NumberInput min={0}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Flex id="num-people-input" flexDirection="column" mt={-5} p={5}>
              <Text>Number of People</Text>
              <NumberInput min={0}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Flex flexDirection="column" id="activities-dropdown" mt={-5} p={5}>
              <Text>Select Activities</Text>
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
            <Flex flexDirection="row" id="submit-button" justifyContent="center" p={5}>
              <button onClick={handleSubmit}>Submit Itinerary</button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
}

export default Home

