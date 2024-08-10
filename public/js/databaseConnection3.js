export async function fetchTranslation(text, targetLang) {
  try {
    const URL = process.env.URL_Check === 'local' ? 'http://localhost:10000' : 'https://einkaufsmeister.onrender.com';
    const response = await fetch(`http://${URL}/google-translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
    });
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Übersetzung');
    }
    const data = await response.json();

    // Weitere Verarbeitung der empfangenen Daten hier, falls erforderlich
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Übersetzung:', error);
    throw error;
  } 
}


export async function detectLanguage(text) {
  try {
    const response = await fetch(`http://localhost:10000/detect-language`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),

    });

    if (!response.ok) {
      throw new Error('Fehler beim Erkennen der Sprache');
    }

    const data = await response.json();
    //console.log(data.detectedLanguage)
    return data;
    
  } catch (error) {
    console.error('Fehler beim Abrufen der Detection:', error);
    throw error;
  } 
}