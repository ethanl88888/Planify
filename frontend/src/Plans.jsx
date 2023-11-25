import React, { useEffect, useState } from 'react';
import Bar from './components/Bar';
import { Box, Heading, VStack, Text } from '@chakra-ui/react';
import axios from 'axios';

const MyPlans = () => {
  const [itineraries, setItineraries] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch user itineraries using the /user-itineraries endpoint
    const fetchItineraries = async () => {
      try {
        const response = await axios.get(`http://localhost:3003/user-itineraries?token=${token}`);
        setItineraries(response.data.itineraries);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      }
    };

    fetchItineraries();
  }, [token]);

  return (
    <>
      <Bar /> {/* Include the Bar component */}
      <Box p={4}>
        <Heading mb={4}>My Plans</Heading>
        <VStack spacing={4} align="start">
          {itineraries.map((itinerary) => (
            <Box key={itinerary.id} borderWidth="1px" borderRadius="md" p={4} width="100%">
              <Text fontWeight="bold">Destination: {itinerary.destination}</Text>
              <Text>Days: {itinerary.days}</Text>
              <Text>Budget: {itinerary.budget}</Text>
              <Text>People: {itinerary.people}</Text>
              <Text>Activities: {itinerary.activities}</Text>
              <Text>Plan: {itinerary.plan}</Text>
              {/* Additional details can be displayed based on your data structure */}
            </Box>
          ))}
        </VStack>
      </Box>
    </>
  );
};

export default MyPlans;
