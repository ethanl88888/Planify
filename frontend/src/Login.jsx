import React, { useState } from 'react';
import { Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setError('Already logged in');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    fetch('http://localhost:3003/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token saved locally:', data.token);

          // Redirect to the home page upon successful login
          navigate('/');
        } else {
          setError('Token not received from the server');
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
      <Flex direction="column" background="gray.100" border="3px solid #209fb5" p={12} rounded={6}>
        <Heading mb={6}>Log in</Heading>
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
          bg= "#209fb5"
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="Logging in..."
        >
          Log in
        </Button>
      </Flex>
    </Flex>
  );
}

export default Login;
