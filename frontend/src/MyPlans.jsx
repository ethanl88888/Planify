import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bar from './components/Bar';
import { Box, Heading, VStack, Text, Button, Image, Flex } from '@chakra-ui/react';
import axios from 'axios';
import { ChakraProvider } from "@chakra-ui/react";

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
        console.log(response.data.itineraries)
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

  const handleDelete = async (itineraryId) => {
    try {
      const response = await axios.delete('http://localhost:3003/delete-itinerary', {
        data: {
          token: localStorage.getItem('token'),
          id: itineraryId,
        },
      });
  
      console.log(response.data); // Log success message or handle accordingly
  
      // Fetch and update the itineraries list after deletion
      const updatedItineraries = await axios.get(`http://localhost:3003/user-itineraries?token=${localStorage.getItem('token')}`);
      setItineraries(updatedItineraries.data.itineraries);
      
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      // Handle the error, show a toast or any other appropriate action
    }
  };
  
  const handleSubmit = async (itinerary_name) => {
    try {
      const response = await axios.get(`http://localhost:3003/user-itineraries?token=${token}`);

      // Find the itinerary with the matching itinerary_name
      const selectedItinerary = response.data.itineraries.find(
        (itinerary) => itinerary.itinerary_name === itinerary_name
      );

      const plan = selectedItinerary.plan;
      const locationsMapping = selectedItinerary.locationsMapping;
      const id = selectedItinerary.id;
      const image_url = selectedItinerary.image_url;
      const name = selectedItinerary.itinerary_name;

      if (plan) {
        navigate('/plan', { state: { assistantMessage: plan, mapping: locationsMapping, id: id, image_url: image_url, name: name } });

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
        <Flex padding = "30px" direction="row" flexWrap="wrap" justifyContent="space-evenly" marginTop="45px">
          {sortedItineraries.map((itinerary) => {
            //format date 
            const dateModified = new Date(itinerary.date_modified);
            const formattedDate = `${dateModified.getFullYear()}-${(dateModified.getMonth() + 1).toString().padStart(2, '0')}-${dateModified.getDate().toString().padStart(2, '0')} ${dateModified.getHours().toString().padStart(2, '0')}:${dateModified.getMinutes().toString().padStart(2, '0')}:${dateModified.getSeconds().toString().padStart(2, '0')}`;

            return (
              <Box
                key={itinerary.itinerary_name}
                display="flex"
                flexDirection="column"
                alignItems="center"
                margin={5}
              >
              <Box
                borderWidth="2px"
                borderRadius="15px"
                borderColor= "#209fb5"
                p={4}
                width="400px"
                height="500px"
                justifyContent="space-between"
                display = "flex"
                flexDirection = "column"
                alignItems = "center"
                padding="25px"
              >
                <Text fontWeight="bold" fontSize="30px">{itinerary.itinerary_name}</Text>
                <Image borderRadius="10px" marginTop="10px" src={itinerary.image_url} objectFit="scale-down" maxWidth="80%" maxHeight="80%" />
                <Text marginTop="15px">Last Modified: {formattedDate}</Text>
                <Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
                  <Button flex="1" padding="20px" color = "#209fb5"onClick={() => handleSubmit(itinerary.itinerary_name)} marginTop="15px" marginRight = "20px">
                    Edit
                  </Button>
                  <Button flex="1" padding="20px" onClick={() => handleDelete(itinerary.id)} marginTop="15px" marginLeft ="20px" color="#209fb5">
                    Delete
                  </Button>
                </Box>
              </Box>
            </Box>
            );
          })}
        </Flex>
      </Box>
    </>
  );
};

export default MyPlans;
