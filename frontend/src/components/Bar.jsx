import icon from '/planify-icon.png';
import { useNavigate } from 'react-router-dom';
import '../css/Bar.css';

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

  return (
    <div id="bar">
      <div className="white-space" />
      <div id="contents">
        <a href="/" id="bar-logo">
          <img src={icon} alt="Planify Icon" /> 
          <h1>Planify</h1>
        </a>
        {storedToken && <a href="/my-plans" id="my-plans" className="bar-button">My Plans</a>}
        <div id="bar-right">
          {!storedToken && (
            <>
              <a href="/login" className="bar-button">Login</a>
              <a href="/signup" className="bar-button">Signup</a>
            </>
          )}
          {storedToken && <a onClick={handleLogout} className="bar-button">Logout</a>}
        </div>
      </div>
      <div className="white-space" />
    </div>
  );
}

export default Bar;

