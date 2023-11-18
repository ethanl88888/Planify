import React, { useState } from 'react';
import Bar from './components/Bar';
import './css/Signup.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Validate inputs
    if (!username || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    // Make POST request to localhost:3003/signup
    fetch('http://localhost:3003/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Handle the response from the server
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <>
      <Bar />
      <div id="signup">
        <div className="auth-item">
          <label>Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
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
    </>
  );
}

export default Signup;

