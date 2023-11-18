import { Box, Flex, Heading, Image, Link } from '@chakra-ui/react';
import icon from '/planify-icon.png';
import { useNavigate } from 'react-router-dom';

function Bar() {
  const storedToken = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Logout button clicked');
  
    if (!storedToken) {
      console.error('Error logging out');
      return;
    }
  
    try {
      // Make POST request to localhost:3003/logout
      const response = await fetch('http://localhost:3003/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: storedToken }),
      });
  
      const data = await response.json();
  
      localStorage.removeItem('token');
      console.log(data);
  
      // Navigate only if the logout is successful
      if (response.ok) {
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      width="100%"
      height="7%"
      position="fixed"
      borderBottom="3px solid #fec287"
      p="0"
    >
      <Link
        href="/"
        textDecoration="none"
        height="100%"
        px="2"
        py="1"
        display="flex"
        alignItems="center"
      >
        <Image src={icon} alt="Planify Icon" boxSize="4rem" mr="2" ml="330px"/>
        <Heading fontSize="3xl" color="#f49542">
          Planify
        </Heading>
      </Link>
      <Box width="20%" />
      <Flex
        align="center"
        height="100%"
        width="20%"
        color="black"
        fontSize="sm"
      >
        <Link
          href="/login"
          textDecoration="none"
          height="100%"
          px="2"
          py="1"
          display="flex"
          alignItems="center"
          color="#f49542"
          _hover={{ cursor: 'pointer', background: 'rgba(169, 169, 169, 0.2)' }}
          onClick={() => {
            // Handle login logic
          }}
        >
          Login
        </Link>
        <Link
          href="/signup"
          textDecoration="none"
          height="100%"
          px="2"
          py="1"
          display="flex"
          alignItems="center"
          color="#f49542"
          _hover={{ cursor: 'pointer', background: 'rgba(169, 169, 169, 0.2)' }}
          onClick={() => {
            // Handle signup logic
          }}
        >
          Signup
        </Link>
        {storedToken && (
          <Link
            href="/"
            textDecoration="none"
            height="100%"
            px="2"
            py="1"
            display="flex"
            alignItems="center"
            color="#f49542"
            _hover={{ cursor: 'pointer', background: 'rgba(169, 169, 169, 0.2)' }}
            onClick={handleLogout}
          >
            Logout
          </Link>
        )}
      </Flex>
    </Flex>
  );
}

export default Bar;
