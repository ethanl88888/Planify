import { Box, Flex, Text, Heading, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import icon from '/planify-icon.png';

function Bar() {
  const storedToken = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    if (!storedToken) {
      console.error('Error logging out');
      return;
    }

    // Make POST request to localhost:3003/logout
    fetch('http://localhost:3003/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: storedToken }),
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.removeItem('token');
        console.log(data);

        navigate('/');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: '#4c4f69',
    paddingX: '20px',
    textDecoration: 'none',
    fontSize: '130%',
    _hover: {
      backgroundColor: 'rgba(169, 169, 169, 0.2)',
      cursor: 'pointer',
    },
  };

  return (
    <Flex
      id="bar"
      width="100%"
      height="7%"
      justifyContent="space-between"
      borderBottom="1px solid #6c6f85"
      position="fixed"
      backgroundColor="white"
      zIndex={100}
    >
      <Box width="15%" className="white-space" />
      <Flex id="contents" width="1100px" justifyContent="space-between" flexShrink={0}>
        <Link id="bar-logo" textDecoration="none" display="flex" maxWidth="min-content" _hover={{ textDecoration: "none" }} href="/">
          <img src={icon} alt="Planify Icon" />
          <Heading fontSize="200%" color="#209fb5" ml="2" display="flex" flexDirection="column" justifyContent="center">
            Planify
          </Heading>
        </Link>
        {storedToken && (
          <Link href="/myplans" id="my-plans" className="bar-button" {...buttonStyle}>
            My Plans
          </Link>
        )}
        <Flex id="bar-right" flexDirection="row-reverse" color="#4c4f69" justifyContent="space-between">
          {!storedToken && (
            <>
              <Link href="/login" className="bar-button" {...buttonStyle}>
                Login
              </Link>
              <Link href="/signup" className="bar-button" {...buttonStyle}>
                Signup
              </Link>
            </>
          )}
          {storedToken && (
            <Text onClick={handleLogout} className="bar-button" {...buttonStyle}>
              Logout
            </Text>
          )}
        </Flex>
      </Flex>
      <Box width="15%" className="white-space" />
    </Flex>
  );
}

export default Bar;

