import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Button,
} from '@chakra-ui/react';
import LocationInput from './components/LocationInput';

const chatGPTKey = import.meta.env.VITE_CHATGPT_API_KEY;

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
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([{ id: 1, value: '', dateVisiting: '' }]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstDay, setFirstDay] = useState();
  const [lastDay, setLastDay] = useState();
  const [budget, setBudget] = useState();
  const [numPeople, setNumPeople] = useState();

  const updateDestinationName = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { id: index + 1, value, dateVisiting: destinations[index].dateVisiting };
    setDestinations(newDestinations);
  };

  const updateDestinationDate = (index, dateVisiting) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { id: index + 1, value: destinations[index].value, dateVisiting };
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
      // Construct the data object to send to the server
      const dataForDatabase = {
        token: localStorage.getItem('token'),
        destinations: destinations,
        firstDay: firstDay,
        lastDay: lastDay,
        budget: budget,
        numPeople: numPeople,
        activities: selectedActivities,
      };

      console.log('Sending data:', dataForDatabase); // Log the data being sent
      // Make a POST request to the server
      axios
        .post('http://localhost:3003/create-itinerary', dataForDatabase, {
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then((response) => {
          console.log('Server response:', response.data); // Log the server response
          // Handle any additional logic or UI updates as needed
        })
        .catch((error) => {
          console.error('Error submitting itinerary:', error);
          // Handle errors or display an error message to the user
        });

      const dataForGPT = `
        Guaranteed Planned Destinations With Dates (ignore id field): ${JSON.stringify(destinations)},
        First Day of Overall Trip: ${firstDay},
        Last Day of Overall Trip: ${lastDay},
        Overall Budget of Trip: ${budget},
        Number of People in this Trip: ${numPeople},
        General Activities Looking Forward to in this Trip: ${selectedActivities}
      `

      let inputForGPT = JSON.stringify({
        "model": "gpt-4-1106-preview",
        "messages": [
          {
            "role": "system",
            "content": `You are given the following user input: ${dataForGPT}.`
          },
          {
            "role": "user",
            "content": `Based on the data I gave you, generate an itinerary strictly in JSON format, without any additional text or markdown.
                        If the dateVisiting field of a destination is empty, assume it is up to you to decide when to visit that corresponding destination and how long to stay there. 
                        The initial groups should be dates represented in yyyy-mm-dd format.
                        Each of these groups will contain multiple subgroups with each key being the time (represented with H:M PM/AM) and the content inside being the event and location of an activity. Be specific with locations.
                        You are to go into detail for each activity's event field based on the general activities given to you in the user input.
                        For example, this would be part of an output where the user input's number of people is one and a general activity is culinary tours.
                        { "yyyy-mm-dd": { "hh:mm AM/PM": { "event": "Event description", "location": "street address, neighborhood, city, county, state, postcode, country" } }
                        The event should be descriptive, and the location should follow the following format: street address, neighborhood, city, county, state, postcode, country.
                        If you are unable to give the full address of a location, you do not need to fill out the first portion of the location format.
                      `
          }
        ]
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chatGPTKey}`,
        },
        data: inputForGPT
      };

      axios.request(config)
      .then((response) => {
        const assistantMessage = response.data.choices[0].message.content;
    
        // Split the message into lines
        const lines = assistantMessage.split('\n');
    
        // Remove the first and last lines
        const modifiedAssistantMessage = lines.slice(1, -1).join('\n');
    
        console.log(modifiedAssistantMessage); // Log the modified message
    
        // Update the state or perform any other actions with the modified message
        navigate('/new-plan', { state: { assistantMessage: modifiedAssistantMessage } });
      })
      .catch((error) => {
        console.log(error);
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
                <LocationInput onChange={(value) => updateDestinationName(index, value)} />
                <Flex flexDirection="column" ml={20} mt={-5}>
                  <Text>Date visiting (optional)</Text>
                  <Input type="date" onChange={(value) => updateDestinationDate(index, value.target.value)} />
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
                <Input placeholder="First Day" type="date" value={firstDay} onChange={(e) => setFirstDay(e.target.value)} />
              </Flex>
              <Flex flexDirection="column" flex="1" p={5}>
                <Text>Last Day</Text>
                <Input placeholder="Last Day" type="date" value={lastDay} onChange={(e) => setLastDay(e.target.value)} />
              </Flex>
            </Flex>
            <Flex id="budget-input" flexDirection="column" mt={-5} p={5}>
              <Text>Budget</Text>
              <NumberInput min={0} value={budget} onChange={(e) => setBudget(parseFloat(e))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Flex id="num-people-input" flexDirection="column" mt={-5} p={5}>
              <Text>Number of People</Text>
              <NumberInput min={0} value={numPeople} onChange={(e) => setNumPeople(parseInt(e))}>
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
              <Button
                mb={6}
                bg="#209fb5"
                onClick={handleSubmit}
              >
                Submit Itinerary
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
}

export default Home;

