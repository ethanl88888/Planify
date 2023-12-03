import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bar from './components/Bar';
import { Box, Heading, VStack, Text, Button, Image } from '@chakra-ui/react';
import axios from 'axios';

const MyPlans = () => {
  const [itineraries, setItineraries] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch user itineraries using the /user-itineraries endpoint
    const fetchItineraries = async () => {
      try {
        const response = await axios.get(`http://localhost:3003/user-itineraries?token=${token}`);
        // console.log('API Response:', response.data); // Log the API response
        setItineraries(response.data.itineraries);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      }
    };

    fetchItineraries();
  }, [token]);

  // Sort itineraries by date_modified in descending order
  const sortedItineraries = [...itineraries].sort((a, b) => {
    const dateA = new Date(a.date_modified);
    const dateB = new Date(b.date_modified);
    return dateB - dateA;
  });

  const handleSubmit = async (itinerary_name) => {
    try {
      const response = await axios.get(`http://localhost:3003/user-itineraries?token=${token}`);

      // Find the itinerary with the matching itinerary_name
      const selectedItinerary = response.data.itineraries.find(
        (itinerary) => itinerary.itinerary_name === itinerary_name
      );

      const plan = selectedItinerary.plan;
      const locationsMapping = selectedItinerary.locationsMapping;

      if (plan) {
        navigate('/plan', { state: { assistantMessage: plan, mapping: locationsMapping } });

        // Now you can use the selectedPlan as needed
      } else {
        console.error('Itinerary not found for the given itinerary_name:', itinerary_name);
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      // Handle the error, show a toast or any other appropriate action
    }
  }

  return (
    <>
      <Bar />
      <Box p={4}>
        <VStack spacing={4} justifySelf="center" marginTop="80px">
          {sortedItineraries.map((itinerary) => (
            <Box
              display="flex"
              borderWidth="2px"
              borderRadius="15px"
              p={4}
              width="75%"
              height="200px"
              justifyContent="space-between"
              onClick={() => handleSubmit(itinerary.itinerary_name)}
              style={{ cursor: "pointer" }}
              key={itinerary.itinerary_name} // Added a key prop
              >
              <Text fontWeight="bold">{itinerary.itinerary_name}</Text>
              <Text>{itinerary.date_modified}</Text>
              <Image src={itinerary.image_url} objectFit="scale-down" />
            </Box>
          ))}
        </VStack>
      </Box>
    </>
  );
};

export default MyPlans;
