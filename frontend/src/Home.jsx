import React, { useState } from 'react';
import React, { useState } from 'react';
import Bar from './components/Bar';
import home_cover from '/home_cover.jpg';
import { Box, Flex, Heading, Image, Button, Text, Input } from '@chakra-ui/react';
import LocationInput from './components/LocationInput';

function Home() {
  const [userData, setUserData] = useState({
    destination: '',
    days: '',
    budget: '',
    people: '',
    activities: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = () => {
    // You can use userData for further processing, such as sending it to an API or storing it in the component's state.
    console.log(userData);
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
          <Box id="home-main-right" margin="7%" width="30%" border="3px solid #fec287" borderRadius="18px">
            <LocationInput />
            <Input
              type="text"
              name="destination"
              placeholder="Destination"
              value={userData.destination}
              onChange={handleInputChange}
            />
            <Input
              type="number"
              name="days"
              placeholder="Number of Days"
              value={userData.days}
              onChange={handleInputChange}
            />
            <Input
              type="number"
              name="budget"
              placeholder="Budget"
              value={userData.budget}
              onChange={handleInputChange}
            />
            <Input
              type="number"
              name="people"
              placeholder="Number of People"
              value={userData.people}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              name="activities"
              placeholder="Activities (comma-separated)"
              value={userData.activities}
              onChange={handleInputChange}
            />
            <Button onClick={handleSubmit}>Submit</Button>
          </Box>
        </Flex>
      </Box>
    </div>
  );
}

export default Home

