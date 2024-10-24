import express from 'express';
import cors from 'cors'; // Importiere die cors Middleware
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import GoogleTranslate from '@google-cloud/translate';
const { Translate } = GoogleTranslate.v2;

dotenv.config();

const app = express();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = process.env.PORT || 3000;

// Statische Dateien im "public" Verzeichnis servieren
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'node_modules/@google-cloud/translate')));


// Verwende die cors Middleware
app.use(cors());

app.use(express.json());


// Route für die Wurzel-URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Bestand.html'));
});




/*
// Proxy-Endpunkt für den Produktabruf
app.get('/product/:upc', async (req, res) => {
  try {
    const { upc } = req.params;
    const API_KEY = process.env.UPC_database_API_KEY 

    const response = await axios.get(`https://api.upcdatabase.org/product/${upc}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    //res.json(response.data);

    // Bereinige die Daten und parse sie als JSON
    const rawData = response.data;
    const jsonStart = rawData.indexOf('{');
    const jsonEnd = rawData.lastIndexOf('}') + 1;
    const jsonString = rawData.substring(jsonStart, jsonEnd);
    const cleanedData = jsonString.replace(/<[^>]*>/g, '').trim();

    // Überprüfe, ob cleanedData ein gültiges JSON ist
    let jsonData;
    try {
      jsonData = JSON.parse(cleanedData
      );
    } catch (parseError) {
      console.error('Fehler beim Parsen der bereinigten Daten im Backend:', parseError.message);
      return res.status(500).json({ error: 'Fehler beim Parsen der bereinigten Daten im Backend' });
    }

    res.json(jsonData);
  } catch (error) {
    console.error('Fehler beim Abrufen von Produktinformationen:', error.message);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten beim Abrufen von Produktinformationen' });
  }
});
*/


// Proxy-Endpunkt für den Produktabruf
app.get('/product/:upc', async (req, res) => {
  try {
    const { upc } = req.params;
    const API_KEY = process.env.UPC_database_API_KEY;

    // Verwende fetch für den API-Aufruf
    const response = await fetch(`https://api.upcdatabase.org/product/${upc}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fehler bei der API-Anfrage: ${response.statusText}`);
    }

    const rawData = await response.text();

    // Bereinige die Daten und parse sie als JSON
    const jsonStart = rawData.indexOf('{');
    const jsonEnd = rawData.lastIndexOf('}') + 1;
    const jsonString = rawData.substring(jsonStart, jsonEnd);
    const cleanedData = jsonString.replace(/<[^>]*>/g, '').trim();

    // Überprüfe, ob cleanedData ein gültiges JSON ist
    let jsonData;
    try {
      jsonData = JSON.parse(cleanedData);
    } catch (parseError) {
      console.error('Fehler beim Parsen der bereinigten Daten im Backend:', parseError.message);
      return res.status(500).json({ error: 'Fehler beim Parsen der bereinigten Daten im Backend' });
    }

    res.json(jsonData);
  } catch (error) {
    console.error('Fehler beim Abrufen von Produktinformationen:', error.message);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten beim Abrufen von Produktinformationen' });
  }
});



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




/*
app.get('/getdata', (req, res) => {
  fs.readFile('openthesaurus.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while reading the file.');
    } else {
      res.send(data);
    }
  });
});*/