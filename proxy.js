const express = require('express');
const cors = require('cors'); // Importiere die cors Middleware
const axios = require('axios');
const path = require('path');
const app = express();
const fs = require('fs');
require('dotenv').config();



const PORT = process.env.PORT || 10000;

// Statische Dateien im "public" Verzeichnis servieren
app.use(express.static(path.join(__dirname, 'public')));

// Verwende die cors Middleware
app.use(cors());

app.use(express.json());



// Route für die Wurzel-URL
app.get('/', (req, res) => {
  res.send('Hello World!');
});




// Proxy-Endpunkt für den Produktabruf
app.get('/product/:upc', async (req, res) => {
  try {
    const { upc } = req.params;
    const API_KEY = process.env.UPC_database_API_KEY // Dein API-Schlüssel

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



const {Translate} = require('@google-cloud/translate').v2;





// Your credentials
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// Configuration for the client
const translate = new Translate({
    credentials: CREDENTIALS,
    projectId: CREDENTIALS.project_id
});


const projectId = CREDENTIALS.project_id;



app.post('/google-translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    let [translations] = await translate.translate(text, targetLang);
    translations = Array.isArray(translations) ? translations : [translations];
    res.json({translations});

  } catch (error) {
    console.error('Fehler beim Übersetzen:', error.message);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten beim Übersetzen' });
  }
});


app.post('/detect-language', async (req, res) => {
  try {
      const { text } = req.body;
      let [detections] = await translate.detect(text);
      detections = Array.isArray(detections) ? detections : [detections];
      const detectedLanguage = detections[0].language;
      res.json({detectedLanguage});

  } catch (error) {
      console.error('Error detecting language:', error.message);
      res.status(500).json({ error: 'An error occurred while detecting language' });
  }
});


app.listen(PORT, () => {
  console.log(`Der Server läuft auf Port ${PORT}`);
});

// Middleware, um das Laden von favicon.ico zu unterdrücken
app.get('/favicon.ico', (req, res) => res.status(204));





app.get('/getdata', (req, res) => {
  fs.readFile('openthesaurus.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while reading the file.');
    } else {
      res.send(data);
    }
  });
});