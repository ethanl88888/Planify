const express = require('express');
const cors = require('cors');

const app = express();

// allow CORS everywhere
app.use(cors());

// use SQLite database
const sqlite3 = require('sqlite3').verbose();

// open database in file named database
let db = new sqlite3.Database('./database', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// create users table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created users table.');
});

// create session tokens table
db.run('CREATE TABLE IF NOT EXISTS session_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL UNIQUE)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created session tokens table.');
});

// Create itineraries table with destinations_data column
db.run('CREATE TABLE IF NOT EXISTS itineraries (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, first_day TEXT NOT NULL, last_day TEXT NOT NULL, budget REAL NOT NULL, numPeople INTEGER NOT NULL, activities TEXT NOT NULL, plan TEXT NOT NULL, destinations_data TEXT)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created itineraries table.');
});

app.post('/create-itinerary', express.json(), (req, res) => {
  const { token, destinations, firstDay, lastDay, budget, numPeople, activities } = req.body;

  // Retrieve user_id from session_tokens
  const getUserIdSql = 'SELECT user_id FROM session_tokens WHERE token = ?';
  db.get(getUserIdSql, [token], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    const userId = row.user_id;

    // Insert itinerary into the itineraries table
    const insertItinerarySql = 'INSERT INTO itineraries (user_id, first_day, last_day, budget, numPeople, activities, plan, destinations_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.run(insertItinerarySql, [userId, firstDay, lastDay, budget, numPeople, activities.join(', '), '', JSON.stringify(destinations)], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const itineraryId = this.lastID; // Get the last inserted itinerary ID

      return res.json({ success: 'Itinerary created.' });
    });
  });
});

app.get('/user-itineraries', (req, res) => {
  const token = req.query.token;

  // Retrieve user_id from session_tokens
  const getUserIdSql = 'SELECT user_id FROM session_tokens WHERE token = ?';
  db.get(getUserIdSql, [token], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    const userId = row.user_id;

    // Retrieve user itineraries from the database
    const getItinerariesSql = 'SELECT id, first_day, last_day, budget, numPeople, activities, plan, destinations_data FROM itineraries WHERE user_id = ?';

    db.all(getItinerariesSql, [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Convert rows to a more structured format
      const formattedItineraries = rows.map((row) => {
        const itinerary = {
          id: row.id,
          destinations: JSON.parse(row.destinations_data || '[]'), // Parse destinations_data as JSON
          firstDay: row.first_day,
          lastDay: row.last_day,
          budget: row.budget,
          numPeople: row.numPeople,
          activities: row.activities.split(', '), // Convert activities string to an array
          plan: row.plan
        };

        return itinerary;
      });

      return res.json({ itineraries: formattedItineraries });
    });
  });
});

// allow log in with email and password
app.post('/login', express.json(), (req, res) => {
  //const email = req.body.email || req.query.email;
  //const password = req.body.password || req.query.password;
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    const token = Math.random().toString(36).substr(2);
    const sql = 'INSERT INTO session_tokens (user_id, token) VALUES (?, ?)';
    db.run(sql, [row.id, token], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ token: token });
    });
  });
});

// allow sign up with name, email, and password
app.post('/signup', express.json(), (req, res) => {
  //const username = req.body.username || req.query.username;
  //const email = req.body.email || req.query.email;
  //const password = req.body.password || req.query.password;
  const { username, email, password } = req.body;
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.run(sql, [username, email, password], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ success: 'User created.' });
  });
});

// allow log out with token
app.post('/logout', express.json(), (req, res) => {
  const { token } = req.body;
  const sql = 'DELETE FROM session_tokens WHERE token = ?';
  db.run(sql, [token], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ success: 'User logged out.' });
  });
});

// allow getting user info with token
app.get('/user', (req, res) => {
  const token = req.query.token;
  const sql = 'SELECT users.id, users.username, users.email FROM users INNER JOIN session_tokens ON users.id = session_tokens.user_id WHERE session_tokens.token = ?';
  db.get(sql, [token], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.json({ id: row.id, username: row.username, email: row.email });
  });
});

app.listen(3003, () => {
  console.log('Server running on port 3003');
});
