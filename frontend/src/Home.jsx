import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Bar from './components/Bar';
import home_cover from '/home_cover.jpg';
import home_cover2 from '/home_cover2.jpg';
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
  useToast,
  Spinner
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
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const updateDestinationName = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { id: index + 1, value, dateVisiting: destinations[index].dateVisiting };
    setDestinations(newDestinations);
  };

  const updateDestinationDate = (index, dateVisiting) => {
    // Check if firstDay and lastDay are set
    if (firstDay && lastDay) {
      const newDestinations = [...destinations];
      newDestinations[index] = { id: index + 1, value: destinations[index].value, dateVisiting };
      setDestinations(newDestinations);
    } else {
      // Show a toast notification
      toast.error("Please set your trip's first and last day before updating each destination's date.", {
        position: "top-center",
        autoClose: 3000, // milliseconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
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

  const handleLastDayChange = (e) => {
    const newLastDay = e.target.value;

    // Perform the validation check
    if (!firstDay || new Date(newLastDay) > new Date(firstDay)) {
      setLastDay(newLastDay);
    } else {
      setLastDay('');
      if (!toast.isActive('error-last-day')) {
        toast({
          id: 'error-last-day',
          title: "Error: Please set your Last Day later than your First Day.",
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
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

  const handleSubmit = async () => {
    if (firstDay == null || lastDay == null || budget == null || numPeople == null || selectedActivities == null || destinations == null) {
      toast({
        title: 'Error: Please fill in all fields before submitting.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } else if (firstDay > lastDay) {
      toast({
        title: "Error: Your Last Day's date must be later than your First Day's.",
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } else {
      const isDateVisitingValid = destinations.every(
        (destination) =>
          destination.dateVisiting === '' ||
          (destination.dateVisiting >= firstDay && destination.dateVisiting <= lastDay)
      );

      if (!isDateVisitingValid) {
        toast({
          title: 'Error: Make sure each date visiting is within your First Day and Last Day.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return; // Stop further processing if dateVisiting is not valid
      }

      async function makeChatGPTRequest(startDate, endDate) {
        const dataForGPT = `
          Guaranteed Planned Destinations With Dates (ignore id field): ${JSON.stringify(destinations)},
          First Day Trip Duration: ${startDate},
          Last Day of Trip Duration: ${endDate},
          Overall Budget of Trip: ${budget},
          Number of People in this Trip: ${numPeople},
          General Activities Looking Forward to in this Trip: ${selectedActivities}
        `

        let inputForGPT = JSON.stringify({
          // "model": "gpt-3.5-turbo",
          "model": "gpt-4-1106-preview",
          // "response_format": { "type": "json_object" },
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
                          Because I have divided each trip's overall duration into multiple time periods for multiple instances of you to respond to, you to ignore the First Day of Trip Duration and Last Day of Trip Duration in most scenarios. However, if the First Day of Trip Duration is ${firstDay}, you must include flight arrival on ${firstDay}. Likewise, if the Last Day of Trip Duration is ${lastDay}, you must include flight departure on ${lastDay}.
                          Each event should be as descriptive as possible (at least 15 words excluding arrival and departure), but no more than 40 words, and the location should follow the following format: street address, neighborhood, city, county, state, postcode, country.
                          If you are unable to give the full address of a location, you can choose to cut out as much of the left portion of the location format. However, you must provide city, county, state, postcode, country as a bare minimum.
                          You are to generate at most 3 or 4 times and their events per date.
                        `
            }
          ]
        });

        try {
          const response = await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${chatGPTKey}`,
            },
            data: inputForGPT
          });

          // Resolve the promise with the response data
          return { quarter: `${startDate} to ${endDate}`, data: response.data };
        } catch (error) {
          // Reject the promise with the error
          console.error(error);
          throw error;
        }
      }

      async function fetchDataForQuarters() {
        setIsLoading(true);
        const [startYear, startMonth, startDay] = firstDay.split('-');
        const [endYear, endMonth, endDay] = lastDay.split('-');

        const tripStartDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0));
        const tripEndDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 0, 0, 0));

        // Handle invalid dates
        if (isNaN(tripStartDate.getTime()) || isNaN(tripEndDate.getTime())) {
          setIsLoading(false);
          console.error('Error: Invalid date format.');
          return;
        }

        const tripLength = Math.ceil((tripEndDate - tripStartDate) / (1000 * 60 * 60 * 24)) + 1;

        const quarters = tripLength < 4 ? tripLength : 4;
        const quarterLength = Math.max(Math.ceil(tripLength / quarters), 1);

        const promises = [];
        let currentStartDate = new Date(tripStartDate); // Create a new Date object to avoid mutation

        for (let i = 0; i < quarters; i++) {
          const currentEndDate = new Date(currentStartDate);
          currentEndDate.setDate(currentEndDate.getDate() + quarterLength - 1);

          // Handle the case where the currentEndDate exceeds the tripEndDate
          if (currentEndDate > tripEndDate) {
            currentEndDate.setDate(tripEndDate.getDate());
          }

          promises.push(makeChatGPTRequest(currentStartDate.toISOString().split('T')[0], currentEndDate.toISOString().split('T')[0]));

          // Set the new currentStartDate to the day after the currentEndDate
          currentStartDate = new Date(currentEndDate);
          currentStartDate.setDate(currentStartDate.getDate() + 1);
        }

        try {
          // Wait for all requests to complete
          const responses = await Promise.all(promises);

          // Initialize combinedData as an empty object
          const combinedData = {};

          // Iterate over each response
          responses.forEach(response => {
            const { quarter, data } = response;
            const lines = data.choices[0].message.content.split('\n');
            const quarterAssistantMessage = lines[0] == '```json' ? lines.slice(1, -1).join('\n') : data.choices[0].message.content;
            const quarterItinerary = JSON.parse(quarterAssistantMessage);

            const quarterStartStr = quarter.split(' to ')[0];
            const quarterEndStr = quarter.split(' to ')[1];
            const [quarterStartYear, quarterStartMonth, quarterStartDay] = quarterStartStr.split('-');
            const [quarterEndYear, quarterEndMonth, quarterEndDay] = quarterEndStr.split('-');

            const quarterStart = new Date(Date.UTC(quarterStartYear, quarterStartMonth - 1, quarterStartDay, 0, 0, 0));
            const quarterEnd = new Date(Date.UTC(quarterEndYear, quarterEndMonth - 1, quarterEndDay, 0, 0, 0));
            const dateRange = [];
            while (quarterStart <= quarterEnd) {
              dateRange.push(new Date(quarterStart));
              quarterStart.setDate(quarterStart.getDate() + 1);
            }

            dateRange.forEach(date => {
              const dateStr = date.toISOString().split('T')[0];
              combinedData[dateStr] = quarterItinerary[dateStr];
            });
          });

          // Do something with the combined data (e.g., setIsLoading(false), navigation)
          return(JSON.stringify(combinedData));
        } catch (error) {
          // Handle errors
          console.error('Error fetching data:', error);
          // Handle error state (e.g., setIsLoading(false), show error message)
        }
      }
      const loadingMessages = [
        'Generating plan...',
        'Finding the best places...',
        'Optimizing the route...',
        'Considering budget constraints...',
        'Making your trip more fun...',
        'Exploring hidden gems...',
        'Selecting top-notch accommodations...',
        'Creating photo-worthy moments...',
        'Assembling a diverse itinerary...',
        'Navigating logistical challenges...',
        'More loading text because I got no more ideas'
      ];

      let responseReceived = false;
      // Function to display loading toast with different messages
      const displayLoadingToast = (index) => {
        if (!responseReceived) {
          toast.closeAll();
          toast({
            title: loadingMessages[index],
            status: 'loading',
            duration: 6000,
            isClosable: true,
          });

          if (index === loadingMessages.length - 1) {
            index = -1;
          }

          setTimeout(() => {
            displayLoadingToast(index + 1);
          }, 6000);
        }
      };

      displayLoadingToast(0);
      const assistantMessage = await fetchDataForQuarters();
      responseReceived = true;
      toast.closeAll();
      setIsLoading(false);
      navigate('/plan', { state: { assistantMessage: assistantMessage } });
    }
  };

  return (
    <div id="home">
      <Bar />
      <Heading zIndex="-1" textAlign="center" color="#209fb5" fontSize="55px" position="absolute" top="90px" width="100%">
        Let's Plan Your Next Trip.
      </Heading>
      <Box id="home-container" paddingRight="3%" position="absolute" top="180px" width="100%" display="flex" flexDirection="row" justifyContent="center" flex="1">
        <Image
          src={home_cover2}
          alt="Home Image"
          zIndex="1"
          objectFit="contain"
          height="80vh"
          flex="1"
        />
        <Flex id="home-main-right" flex="1" height="100%" border="3px solid #209fb5" borderRadius="18px" flexDirection="column">
          <Flex flexDirection="row" id="dates-input">
            <Flex flexDirection="column" flex="1" p={5}>
              <Text>First Day</Text>
              <Input placeholder="First Day" type="date" value={firstDay} onChange={(e) => setFirstDay(e.target.value)} />
            </Flex>
            <Flex flexDirection="column" flex="1" p={5}>
              <Text>Last Day</Text>
              <Input placeholder="Last Day" type="date" value={lastDay} onChange={handleLastDayChange} disabled={!firstDay}/>
            </Flex>
          </Flex>
          {destinations.map((destination, index) => (
            <Flex key={destination.id} id={`destination-input-${destination.id}`} flexDirection="row" p={7} justifyContent="center">
              <LocationInput onChange={(value) => updateDestinationName(index, value)} />
              <Flex flexDirection="column" ml={20} mt={-5}>
                <Text>Date visiting (optional)</Text>
                <Input type="date" onChange={(value) => updateDestinationDate(index, value.target.value)} />
              </Flex>
              {destinations.length > 1 && (
                <Button
                  mb={6}
                  bg="red.400"
                  margin="4px"
                  onClick={() => handleRemoveDestination(index)}
                >
                  Remove
                </Button>
              )}
            </Flex>
          ))}
          <Box align="center" justifyContent="center" >
            <Button
              mb={6}
              bg="#209fb5"
              onClick={handleAddDestination}
            >
              Add Destination
            </Button>
          </Box>
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
          <Flex flexDirection="row" id="submit-button" justifyContent="center" p={5} style={{ backdropFilter: isLoading ? 'blur(5px)' : 'none' }}>
            <Button
              mb={6}
              bg="green.400"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              {isLoading ? 'Loading' : 'Generate Itinerary'}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
}

export default Home;

