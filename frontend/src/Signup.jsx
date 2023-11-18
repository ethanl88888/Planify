import React, { useState } from 'react';
import { Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Validate inputs
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Make POST request to signup endpoint
    fetch('http://localhost:3003/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.success) {
          // Optionally, you can perform additional actions upon successful signup
          console.log('User created:', data.success);

          // Redirect to the home page upon successful signup
          navigate('/');
        } else {
          setError('Signup failed. Please try again.');
        }
      })
      .catch((error) => {
        setError(`Error: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex direction="column" background="gray.100" border="3px solid #f4dbd6" p={12} rounded={6}>
        <Heading mb={6}>Sign up</Heading>
        <Input
          placeholder="Username"
          variant="filled"
          mb={3}
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Email"
          variant="filled"
          mb={3}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          variant="filled"
          mb={6}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Text color="red.500">{error}</Text>}
        <Button
          mb={6}
          colorScheme="orange"
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="Signing up..."
        >
          Sign up
        </Button>
      </Flex>
    </Flex>
  );
}

export default Signup;
