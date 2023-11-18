import React from "react";
import Bar from "./components/Bar";
import home_cover from '/home_cover.jpg';
import { Box, Flex, Heading, Image, Link, Text } from '@chakra-ui/react';



function Home() {
  // React.useEffect(() => {
  //   fetch("http://localhost:3003")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

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
            {/* Content for the right side */}
          </Box>
        </Flex>
      </Box>
  </div>
  
  );
}

export default Home

