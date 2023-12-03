import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Bar from './components/Bar';
import { Box, Heading, VStack, Text, Button } from '@chakra-ui/react';
import axios from 'axios';

const MyPlans = () => {
  const [itineraries, setItineraries] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch user itineraries using the /user-itineraries endpoint
    const fetchItineraries = async () => {
      try {
        const response = await axios.get(`http://localhost:3003/user-itineraries?token=${token}`);
        console.log('API Response:', response.data); // Log the API response
        setItineraries(response.data.itineraries);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      }
    };

    fetchItineraries();
  }, [token]);

  console.log('Itineraries:', itineraries); // Log the itineraries array

  return (
    <>
      <Bar /> {/* Include the Bar component */}
      <Box p={4}>
        <Heading mb={4}>My Plans</Heading>
        <VStack spacing={4} align="start">
          {itineraries.map((itinerary) => (
            <Box key={itinerary.id} borderWidth="1px" borderRadius="md" p={4} width="100%">
              {/* Displaying information about each itinerary */}
              <Text fontWeight="bold">Itinerary #{itinerary.itinerary_name}</Text>
              <Text>First Day: {itinerary.firstDay}</Text>
              <Text>Last Day: {itinerary.lastDay}</Text>
              <Text>Budget: {itinerary.budget}</Text>
              <Text>Number of People: {itinerary.numPeople}</Text>

              {/* Displaying information about activities */}
              <Text>Activities:</Text>
              {itinerary.activities.map((activity, index) => (
                <Text key={index}>{activity}</Text>
              ))}

              {/* Displaying information about destinations */}
              <Text fontWeight="bold">Destinations:</Text>
              <VStack align="start" spacing={0}>
                {itinerary.destinations.map((destination, index) => (
                  <Text key={index}>
                    {destination.value} ({destination.dateVisiting})
                  </Text>
                ))}
              </VStack>

              {/* Additional details can be displayed based on your data structure */}
              <Text>Plan: {itinerary.plan}</Text>

              <Link to={`/itinerary/${itinerary.id}`}>
                <Button colorScheme="blue" mt={4}>
                  View Itinerary
                </Button>
              </Link>

            </Box>
          ))}
        </VStack>
      </Box>
    </>
  );
};

export default MyPlans;
