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

// Add a new table for itineraries
// Create itineraries table
db.run('CREATE TABLE IF NOT EXISTS itineraries (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, first_day TEXT NOT NULL, last_day TEXT NOT NULL, budget REAL NOT NULL, people INTEGER NOT NULL, activities TEXT NOT NULL, plan TEXT NOT NULL)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created itineraries table.');
});

// Create destinations table
db.run('CREATE TABLE IF NOT EXISTS destinations (id INTEGER PRIMARY KEY AUTOINCREMENT, itinerary_id INTEGER NOT NULL, destination TEXT NOT NULL, date_visiting TEXT NOT NULL)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created destinations table.');
});



app.post('/create-itinerary', express.json(), (req, res) => {
  const { token, destinations, firstDay, lastDay, budget, people, activities } = req.body;

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
    const insertItinerarySql = 'INSERT INTO itineraries (user_id, first_day, last_day, budget, people, activities, plan) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.run(insertItinerarySql, [userId, firstDay, lastDay, budget, people, activities.join(', '), ''], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const itineraryId = this.lastID; // Get the last inserted itinerary ID

      // Insert destinations into the destinations table
      const insertDestinationSql = 'INSERT INTO destinations (itinerary_id, destination, date_visiting) VALUES (?, ?, ?)';
      destinations.forEach(({ destination, dateVisiting }) => {
        db.run(insertDestinationSql, [itineraryId, destination, dateVisiting], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
        });
      });

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

    // Retrieve user itineraries and associated destinations from the database
    const getItinerariesSql = 'SELECT itineraries.id AS itinerary_id, itineraries.first_day, itineraries.last_day, itineraries.budget, itineraries.people, itineraries.activities, itineraries.plan, destinations.destination, destinations.date_visiting FROM itineraries JOIN destinations ON itineraries.id = destinations.itinerary_id WHERE itineraries.user_id = ?';
    
    db.all(getItinerariesSql, [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Convert rows to a more structured format
      const formattedItineraries = [];
      rows.forEach((row) => {
        const existingItinerary = formattedItineraries.find(
          (itinerary) => itinerary.id === row.itinerary_id && itinerary.firstDay === row.first_day
        );

        if (existingItinerary) {
          // Itinerary already exists, add the new destination to its destinations array
          existingItinerary.destinations.push({
            destination: row.destination,
            dateVisiting: row.date_visiting,
          });
        } else {
          // Itinerary doesn't exist, create a new itinerary object
          formattedItineraries.push({
            id: row.itinerary_id,
            destinations: [
              {
                destination: row.destination,
                dateVisiting: row.date_visiting,
              },
            ],
            firstDay: row.first_day,
            lastDay: row.last_day,
            budget: row.budget,
            people: row.people,
            activities: row.activities.split(', '), // Convert activities string to an array
            plan: row.plan,
          });
        }
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
