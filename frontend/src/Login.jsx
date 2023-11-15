import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      console.error('Already logged in');
      // Handle already logged in state (redirect, display message, etc.)
      return;
    }

    // Validate inputs
    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    // Make POST request to localhost:3003/login
    fetch('http://localhost:3003/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.token) {
          // Save the token locally
          localStorage.setItem('token', data.token);
          console.log('Token saved locally:', data.token);
        } else {
          console.error('Token not received from the server');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div id="signup">
      <div className="auth-item">
        <label>Email</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="auth-item">
        <label>Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Login
