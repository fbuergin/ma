

/*
const express = require('express');
const cors = require('cors'); // Importiere die cors Middleware
const axios = require('axios');



const app = express();
const PORT = process.env.PORT || 5501;


// Verwende die cors Middleware
app.use(cors());

app.use(express.json());

// Proxy endpoint
app.get('/product/:upc', async (req, res) => {
  try {
    const { upc } = req.params;
    const API_KEY = '5105C63212D31317ED0076F093ED7BFF'; // Your API key

    const response = await axios.get(`https://api.upcdatabase.org/product/${upc}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    console.log(response.data); // Log the response data
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product information:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching product information' });
  }
});



app.listen(PORT, () => {
  console.log(`Der Server läuft auf Port ${PORT}`);
});

// Route for the root URL
app.get('/', (req, res) => {
  res.send('Hello, World!'); // Replace with your desired response
});
*/





/*


const UPC_CODE = '8717644012208';

fetch(`http://localhost:5501/product/${UPC_CODE}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Log the retrieved data to the console
    console.log(data);
    console.log('test')
  })
  .catch(error => {
    // Handle any errors
    console.error('Error:', error);
  });


*/







/*
  // Root endpoint
app.get('/', (req, res) => {
  console.log('Received request for root endpoint');
  res.send('Hello, World!'); // Example response for the root endpoint
});




// Express-Route zum Abholen von Daten
app.get('/logs', (req, res) => {
  // Hier kannst du beliebige Informationen senden
  const logs = ['Log 1', 'Log 2', 'Log 3'];
  
  // Senden der Logs als Antwort
  res.json(logs);
});


// AJAX-Anforderung an den Server senden, um Logs abzurufen
fetch('http://localhost:5501/logs') // Beispiel URL, ersetze 3000 durch den tatsächlichen Port
  .then(response => response.json())
  .then(logs => {
    // Logs in der Browser-Konsole anzeigen
    logs.forEach(log => console.log(log));
  })
  .catch(error => console.error('Fehler beim Abrufen von Logs:', error));

*/

const express = require('express');
const cors = require('cors'); // Importiere die cors Middleware
const axios = require('axios');

const app = express();

dotenv.config({
  path: 'config.env'
});

const PORT = process.env.PORT || 10000;

// Verwende die cors Middleware
app.use(cors());

app.use(express.json());

// Proxy-Endpunkt für den Produktabruf
app.get('/product/:upc', async (req, res) => {
  try {
    const { upc } = req.params;
    const API_KEY = '5105C63212D31317ED0076F093ED7BFF'; // Dein API-Schlüssel

    const response = await axios.get(`https://api.upcdatabase.org/product/${upc}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Fehler beim Abrufen von Produktinformationen:', error.message);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten beim Abrufen von Produktinformationen' });
  }
});

app.listen(PORT, () => {
  console.log(`Der Server läuft auf Port ${PORT}`);
});
