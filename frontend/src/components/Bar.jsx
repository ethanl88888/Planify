function Bar() {
  const handleLogout = () => {
    const storedToken = localStorage.getItem('token');

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
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div id="bar">
      <img src="https://drive.google.com/uc?export=view&id=1OxlfehxFOvo0FpoH_cuXryDUQuRdWyUt" /> 
      <a href="/login">Login</a>
      <a href="/signup">Signup</a>
      <a onClick={handleLogout}>Logout</a>
    </div>
  );
}

export default Bar;
